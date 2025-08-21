import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, originalName, fileSize, mimeType, summary, chunkCount } = body;

    const document = await prisma.document.create({
      data: {
        filename,
        originalName,
        fileSize,
        mimeType,
        summary,
        chunkCount,
        status: 'completed',
      },
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
  }
}
