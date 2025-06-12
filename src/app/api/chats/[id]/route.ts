import { NextRequest, NextResponse } from 'next/server';
import { databaseService } from '@/lib/database';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/chats/[id] - Get chat with messages
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: chatId } = await params;

    const chat = await databaseService.getChatById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const messages = await databaseService.getMessagesByChatId(chatId);

    return NextResponse.json({
      chat,
      messages: messages.map(msg => ({
        ...msg,
        sources: msg.sources || undefined,
      })),
    });
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}

// PUT /api/chats/[id] - Update chat title
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: chatId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const success = await databaseService.updateChatTitle(chatId, title);
    if (!success) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    const updatedChat = await databaseService.getChatById(chatId);
    return NextResponse.json({ chat: updatedChat });
  } catch (error) {
    console.error('Error updating chat:', error);
    return NextResponse.json(
      { error: 'Failed to update chat' },
      { status: 500 }
    );
  }
}

// DELETE /api/chats/[id] - Delete chat
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: chatId } = await params;

    const success = await databaseService.deleteChat(chatId);
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
