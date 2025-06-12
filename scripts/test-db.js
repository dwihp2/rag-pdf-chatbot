// Test script to check database connection and operations
import { PrismaClient } from '@prisma/client';

async function testDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test chat creation
    console.log('Testing chat creation...');
    const chat = await prisma.chat.create({
      data: {
        title: 'Test Chat ' + new Date().toISOString(),
      },
    });
    console.log('✅ Chat created successfully:', chat);

    // Test chat retrieval
    console.log('Testing chat retrieval...');
    const chats = await prisma.chat.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('✅ Chats retrieved successfully:', chats.length, 'chats found');

    // Clean up test chat
    await prisma.chat.delete({
      where: { id: chat.id },
    });
    console.log('✅ Test chat cleaned up');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

testDatabase();
