import { PrismaClient } from '@prisma/client';

// Global Prisma instance for serverless environments
// Uses DATABASE_URL and DIRECT_URL from environment variables
// For Neon-specific configurations, see ./neon-config.ts
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

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
    try {
      return await this.prisma.chat.findMany({
        orderBy: {
          updatedAt: 'desc',
        },
      });
    } catch (error) {
      console.error('Error getting all chats:', error);
      if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes('prepared statement')) {
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
        return await this.prisma.chat.findMany({
          orderBy: {
            updatedAt: 'desc',
          },
        });
      }
      throw error;
    }
  }

  async getChatById(id: string) {
    try {
      return await this.prisma.chat.findUnique({
        where: { id },
      });
    } catch (error) {
      console.error('Error getting chat by ID:', error);
      if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes('prepared statement')) {
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
        return await this.prisma.chat.findUnique({
          where: { id },
        });
      }
      throw error;
    }
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
    try {
      return await this.prisma.message.create({
        data: {
          chatId: data.chatId,
          role: data.role,
          content: data.content,
          sources: data.sources || undefined,
        },
      });
    } catch (error) {
      console.error('Error creating message:', error);
      // For prepared statement errors, try disconnecting and reconnecting
      if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes('prepared statement')) {
        console.log('Prepared statement conflict detected in createMessage, attempting to reconnect...');
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
          return await this.prisma.message.create({
            data: {
              chatId: data.chatId,
              role: data.role,
              content: data.content,
              sources: data.sources || undefined,
            },
          });
        } catch (retryError) {
          console.error('Retry failed for createMessage:', retryError);
          throw retryError;
        }
      }
      throw error;
    }
  }

  async getMessagesByChatId(chatId: string) {
    try {
      return await this.prisma.message.findMany({
        where: { chatId },
        orderBy: {
          createdAt: 'asc',
        },
      });
    } catch (error) {
      console.error('Error getting messages by chat ID:', error);
      if (error && typeof error === 'object' && 'message' in error &&
        typeof error.message === 'string' && error.message.includes('prepared statement')) {
        await this.prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 100));
        return await this.prisma.message.findMany({
          where: { chatId },
          orderBy: {
            createdAt: 'asc',
          },
        });
      }
      throw error;
    }
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
