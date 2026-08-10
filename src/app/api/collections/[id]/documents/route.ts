import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { documentId } = await req.json();

  const collection = await prisma.collection.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const document = await prisma.document.findFirst({
    where: { id: documentId, userId: session.user.id },
  });
  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });

  const relation = await prisma.collectionDocument.create({
    data: { collectionId: id, documentId },
  });
  return NextResponse.json(relation);
}
