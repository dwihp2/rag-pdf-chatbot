import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

// GET /api/chats - Get all chats
export async function GET() {
  try {
    const chats = databaseService.getAllChats();
    return NextResponse.json({ chats });
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats' },
      { status: 500 }
    );
  }
}

// POST /api/chats - Create new chat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    const chat = databaseService.createChat({ title });
    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats - Delete chat by ID (via query parameter)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('id');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    const success = databaseService.deleteChat(chatId);
    if (!success) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}
