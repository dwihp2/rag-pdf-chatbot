import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string; // JSON string of sources
  createdAt: string;
}

export interface CreateChatData {
  title?: string;
}

export interface CreateMessageData {
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: any[];
}

class DatabaseService {
  private db: Database.Database;

  constructor() {
    // Create database in the project root for development
    const dbPath = path.join(process.cwd(), 'chat_history.db');
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
    // Create chats table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS chats (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        sources TEXT, -- JSON string
        created_at TEXT NOT NULL,
        FOREIGN KEY (chat_id) REFERENCES chats (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages (chat_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at);
      CREATE INDEX IF NOT EXISTS idx_chats_updated_at ON chats (updated_at);
    `);
  }

  // Chat operations
  createChat(data: CreateChatData = {}): Chat {
    const now = new Date().toISOString();
    const chat: Chat = {
      id: uuidv4(),
      title: data.title || 'New Chat',
      createdAt: now,
      updatedAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO chats (id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);

    stmt.run(chat.id, chat.title, chat.createdAt, chat.updatedAt);
    return chat;
  }

  getAllChats(): Chat[] {
    const stmt = this.db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt
      FROM chats
      ORDER BY updated_at DESC
    `);

    return stmt.all() as Chat[];
  }

  getChatById(id: string): Chat | null {
    const stmt = this.db.prepare(`
      SELECT id, title, created_at as createdAt, updated_at as updatedAt
      FROM chats
      WHERE id = ?
    `);

    return stmt.get(id) as Chat | null;
  }

  updateChatTitle(id: string, title: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE chats
      SET title = ?, updated_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(title, new Date().toISOString(), id);
    return result.changes > 0;
  }

  deleteChat(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM chats WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Message operations
  createMessage(data: CreateMessageData): Message {
    const now = new Date().toISOString();
    const message: Message = {
      id: uuidv4(),
      chatId: data.chatId,
      role: data.role,
      content: data.content,
      sources: data.sources ? JSON.stringify(data.sources) : undefined,
      createdAt: now,
    };

    const stmt = this.db.prepare(`
      INSERT INTO messages (id, chat_id, role, content, sources, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      message.id,
      message.chatId,
      message.role,
      message.content,
      message.sources,
      message.createdAt
    );

    // Update chat's updated_at timestamp
    this.updateChatTimestamp(data.chatId);

    return message;
  }

  getMessagesByChatId(chatId: string): Message[] {
    const stmt = this.db.prepare(`
      SELECT id, chat_id as chatId, role, content, sources, created_at as createdAt
      FROM messages
      WHERE chat_id = ?
      ORDER BY created_at ASC
    `);

    const messages = stmt.all(chatId) as Message[];

    // Parse sources JSON for each message
    return messages.map(message => ({
      ...message,
      sources: message.sources ? message.sources : undefined,
    }));
  }

  deleteMessage(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM messages WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Get recent messages across all chats for search/reference
  getRecentMessages(limit: number = 50): Message[] {
    const stmt = this.db.prepare(`
      SELECT id, chat_id as chatId, role, content, sources, created_at as createdAt
      FROM messages
      ORDER BY created_at DESC
      LIMIT ?
    `);

    return stmt.all(limit) as Message[];
  }

  // Helper method to update chat timestamp
  private updateChatTimestamp(chatId: string): void {
    const stmt = this.db.prepare(`
      UPDATE chats
      SET updated_at = ?
      WHERE id = ?
    `);

    stmt.run(new Date().toISOString(), chatId);
  }

  // Generate chat title from first user message
  generateChatTitle(chatId: string): boolean {
    const firstMessage = this.db.prepare(`
      SELECT content
      FROM messages
      WHERE chat_id = ? AND role = 'user'
      ORDER BY created_at ASC
      LIMIT 1
    `).get(chatId) as { content: string } | undefined;

    if (firstMessage) {
      // Take first 50 characters as title
      const title = firstMessage.content.length > 50
        ? firstMessage.content.substring(0, 50) + '...'
        : firstMessage.content;

      return this.updateChatTitle(chatId, title);
    }

    return false;
  }

  // Database maintenance
  close(): void {
    this.db.close();
  }

  // Get database statistics
  getStats() {
    const chatCount = this.db.prepare('SELECT COUNT(*) as count FROM chats').get() as { count: number };
    const messageCount = this.db.prepare('SELECT COUNT(*) as count FROM messages').get() as { count: number };

    return {
      totalChats: chatCount.count,
      totalMessages: messageCount.count,
    };
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Graceful shutdown
process.on('exit', () => {
  databaseService.close();
});

process.on('SIGINT', () => {
  databaseService.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  databaseService.close();
  process.exit(0);
});
