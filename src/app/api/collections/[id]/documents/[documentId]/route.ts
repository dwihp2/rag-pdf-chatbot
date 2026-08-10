import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, documentId } = await params;

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

  await prisma.collectionDocument.deleteMany({
    where: { collectionId: id, documentId },
  });
  return NextResponse.json({ success: true });
}
