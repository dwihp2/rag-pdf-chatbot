import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { documentProcessor } from "@/lib/document-processor";
import { vectorService } from "@/lib/vector-service";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
  }

  // Create document record
  const doc = await prisma.document.create({
    data: {
      userId: session.user.id,
      filename: file.name,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/pdf",
      status: "processing",
    },
  });

  // Process async — in production, use a queue
  try {
    const { chunks } = await documentProcessor.processPDF(file);
    await vectorService.addDocuments(
      doc.id,
      chunks.map((c, i) => ({ ...c, chunkIndex: i }))
    );
  } catch (err) {
    await prisma.document.update({
      where: { id: doc.id },
      data: { status: "failed" },
    });
    return NextResponse.json(
      { error: "Failed to process PDF", details: String(err) },
      { status: 500 }
    );
  }

  const updated = await prisma.document.findUnique({ where: { id: doc.id } });
  return NextResponse.json(updated);
}
