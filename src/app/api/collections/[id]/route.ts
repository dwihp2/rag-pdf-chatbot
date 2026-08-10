import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const collection = await prisma.collection.findFirst({
    where: {
      id,
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: {
      documents: { include: { document: true } },
      chats: { select: { id: true, title: true, updatedAt: true } },
    },
  });
  if (!collection) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(collection);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.collection.deleteMany({ where: { id, ownerId: session.user.id } });
  return NextResponse.json({ success: true });
}
