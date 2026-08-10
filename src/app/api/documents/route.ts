import { auth } from "@/lib/auth-server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id },
    orderBy: { uploadedAt: "desc" },
    include: { _count: { select: { chunks: true } } },
  });
  return NextResponse.json(documents);
}

export async function DELETE(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.document.deleteMany({ where: { id, userId: session.user.id } });
  return NextResponse.json({ success: true });
}
