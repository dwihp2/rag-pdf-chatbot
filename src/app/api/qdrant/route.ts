import { NextRequest, NextResponse } from "next/server";
import { qdrantService } from "@/lib/qdrant";

export async function GET() {
  try {
    const stats = await qdrantService.getStats();
    const info = await qdrantService.getCollectionInfo();

    return NextResponse.json({
      success: true,
      stats,
      info,
    });
  } catch (error) {
    console.error("Error getting collection status:", error);
    return NextResponse.json(
      {
        error: "Failed to get collection status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const filename = url.searchParams.get("filename");

    if (action === "clear") {
      await qdrantService.clearCollection();
      return NextResponse.json({
        success: true,
        message: "Collection cleared successfully",
      });
    } else if (action === "deleteFile" && filename) {
      await qdrantService.deleteDocumentsByFilename(filename);
      return NextResponse.json({
        success: true,
        message: `Documents from '${filename}' deleted successfully`,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action or missing parameters" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error managing collection:", error);
    return NextResponse.json(
      {
        error: "Failed to manage collection",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
