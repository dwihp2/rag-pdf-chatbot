import { NextRequest, NextResponse } from "next/server";
import { vectorService } from "@/lib/vector-service";

export async function GET() {
  try {
    console.log("📊 Getting vector database stats...");

    const stats = await vectorService.getStats();

    if (!stats) {
      return NextResponse.json(
        { error: "Failed to get vector database statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      stats,
    });

  } catch (error) {
    console.error("❌ Error getting vector stats:", error);
    return NextResponse.json(
      {
        error: "Failed to get vector database statistics",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'clear') {
      console.log("🗑️ Clearing all vectors from database...");
      await vectorService.clearAllVectors();

      return NextResponse.json({
        success: true,
        message: "All vectors cleared successfully",
      });
    }

    const documentId = searchParams.get('documentId');
    if (documentId) {
      console.log(`🗑️ Deleting vectors for document: ${documentId}`);
      await vectorService.deleteDocumentChunks(documentId);

      return NextResponse.json({
        success: true,
        message: `Vectors for document ${documentId} deleted successfully`,
      });
    }

    return NextResponse.json(
      { error: "Missing required parameter: action=clear or documentId" },
      { status: 400 }
    );

  } catch (error) {
    console.error("❌ Error deleting vectors:", error);
    return NextResponse.json(
      {
        error: "Failed to delete vectors",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 5, threshold = 0.7 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching vectors for query: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await vectorService.generateQueryEmbedding(query);

    // Search for similar vectors
    const results = await vectorService.searchSimilar(queryEmbedding, limit, threshold);

    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
    });

  } catch (error) {
    console.error("❌ Error searching vectors:", error);
    return NextResponse.json(
      {
        error: "Failed to search vectors",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
