import { PrismaClient } from '@prisma/client';

// Global Prisma instance for serverless environments
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface CreateChatData {
  title?: string;
}

export interface CreateMessageData {
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    filename: string;
    page: number;
    text: string;
    score: number;
  }>;
}

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  // Chat operations
  async createChat(data: CreateChatData = {}) {
    return await this.prisma.chat.create({
      data: {
        title: data.title || 'New Chat',
      },
    });
  }

  async getAllChats() {
    return await this.prisma.chat.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async getChatById(id: string) {
    return await this.prisma.chat.findUnique({
      where: { id },
    });
  }

  async updateChatTitle(id: string, title: string) {
    try {
      await this.prisma.chat.update({
        where: { id },
        data: { title },
      });
      return true;
    } catch (error) {
      console.error('Error updating chat title:', error);
      return false;
    }
  }

  async deleteChat(id: string) {
    try {
      await this.prisma.chat.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }

  // Message operations
  async createMessage(data: CreateMessageData) {
    return await this.prisma.message.create({
      data: {
        chatId: data.chatId,
        role: data.role,
        content: data.content,
        sources: data.sources || undefined,
      },
    });
  }

  async getMessagesByChatId(chatId: string) {
    return await this.prisma.message.findMany({
      where: { chatId },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async deleteMessage(id: string) {
    try {
      await this.prisma.message.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  async getRecentMessages(limit: number = 50) {
    return await this.prisma.message.findMany({
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Helper method to update chat timestamp (Prisma handles this automatically with @updatedAt)
  private async updateChatTimestamp(chatId: string) {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: {}, // Empty update to trigger @updatedAt
    });
  }

  // Generate chat title from first user message
  async generateChatTitle(chatId: string) {
    const firstMessage = await this.prisma.message.findFirst({
      where: {
        chatId,
        role: 'user',
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (firstMessage) {
      const title = firstMessage.content.length > 50
        ? firstMessage.content.substring(0, 50) + '...'
        : firstMessage.content;

      return await this.updateChatTitle(chatId, title);
    }

    return false;
  }

  // Database statistics
  async getStats() {
    const [chatCount, messageCount] = await Promise.all([
      this.prisma.chat.count(),
      this.prisma.message.count(),
    ]);

    return {
      totalChats: chatCount,
      totalMessages: messageCount,
    };
  }

  // Graceful shutdown
  async close() {
    await this.prisma.$disconnect();
  }
}

// Create singleton instance
export const databaseService = new DatabaseService();

// Graceful shutdown handlers
if (typeof process !== 'undefined') {
  process.on('exit', async () => {
    await databaseService.close();
  });

  process.on('SIGINT', async () => {
    await databaseService.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await databaseService.close();
    process.exit(0);
  });
}
