import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const collections = await prisma.collection.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { members: { some: { userId: session.user.id } } },
      ],
    },
    include: { _count: { select: { documents: true, chats: true } } },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(collections);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, description } = await req.json();
  const collection = await prisma.collection.create({
    data: { name, description, ownerId: session.user.id },
  });
  return NextResponse.json(collection);
}
