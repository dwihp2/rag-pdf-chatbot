import { NextRequest, NextResponse } from "next/server";
import { vectorService } from "@/lib/vector-service";
import { documentProcessor } from "@/lib/document-processor";
import { prisma } from "@/lib/db";

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

    if (processedDocuments.length === 0) {
      return NextResponse.json(
        { error: "No content could be extracted from the uploaded files" },
        { status: 400 }
      );
    }

    console.log(`�️ Storing documents and generating embeddings...`);

    // Store document metadata and chunks in database
    const documentMetadata = await Promise.all(
      processedDocuments.map(async (doc) => {
        const file = files.find(f => f.name === doc.filename);

        // Create document record
        const documentRecord = await prisma.document.create({
          data: {
            filename: doc.filename,
            originalName: file?.name || doc.filename,
            fileSize: file?.size || 0,
            mimeType: file?.type || 'application/pdf',
            chunkCount: doc.chunks.length,
            summary: `Document with ${doc.pageCount} pages and ${doc.chunks.length} chunks`,
            status: 'processing',
          },
        });

        // Add chunks to vector database with embeddings
        if (doc.chunks.length > 0) {
          await vectorService.addDocuments(documentRecord.id, doc.chunks);

          // Update document status to completed
          await prisma.document.update({
            where: { id: documentRecord.id },
            data: { status: 'completed' },
          });
        }

        return documentRecord;
      })
    );

    console.log("✅ Upload completed successfully!");

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${files.length} PDFs`,
      details: {
        filesProcessed: files.length,
        totalChunks: documentMetadata.reduce((total, doc) => total + doc.chunkCount, 0),
        documents: processedDocuments.map(doc => ({
          filename: doc.filename,
          pages: doc.pageCount,
          chunks: doc.chunks.length,
        })),
        documentMetadata: documentMetadata,
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