import { NextRequest, NextResponse } from "next/server";
import { qdrantService } from "@/lib/qdrant";
import { documentProcessor } from "@/lib/document-processor";
import { prisma } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    console.log("📁 Processing file upload request...");

    // Process form data
    const formData = await request.formData();
    const files: File[] = [];

    for (const entry of Array.from(formData.entries())) {
      const [, value] = entry;
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "No files uploaded" },
        { status: 400 }
      );
    }

    console.log(`📄 Processing ${files.length} PDF file(s)...`);

    // Process all PDF files
    const processedDocuments = await documentProcessor.processMultiplePDFs(files);

    // Collect all chunks
    const allChunks = processedDocuments.flatMap(doc => doc.chunks);

    if (allChunks.length === 0) {
      return NextResponse.json(
        { error: "No content could be extracted from the uploaded files" },
        { status: 400 }
      );
    }

    console.log(`🔄 Uploading ${allChunks.length} chunks to Qdrant...`);

    // Upload to Qdrant
    await qdrantService.addDocuments(allChunks);

    // Store document metadata in database
    const documentMetadata = await Promise.all(
      processedDocuments.map(async (doc) => {
        const file = files.find(f => f.name === doc.filename);
        return prisma.document.create({
          data: {
            filename: doc.filename,
            originalName: file?.name || doc.filename,
            fileSize: file?.size || 0,
            mimeType: file?.type || 'application/pdf',
            chunkCount: doc.totalChunks,
            summary: `Document with ${doc.totalPages} pages and ${doc.totalChunks} chunks`,
            status: 'completed',
          },
        });
      })
    );

    // Get collection stats
    const stats = await qdrantService.getStats();

    console.log("✅ Upload completed successfully!");

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} PDFs`,
      details: {
        filesProcessed: files.length,
        totalChunks: allChunks.length,
        documents: processedDocuments.map(doc => ({
          filename: doc.filename,
          pages: doc.totalPages,
          chunks: doc.totalChunks,
        })),
        documentMetadata: documentMetadata,
        collectionStats: stats,
      }
    });

  } catch (error) {
    console.error("❌ Error processing files:", error);
    return NextResponse.json(
      {
        error: "Failed to process files",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}