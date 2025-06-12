// Test script specifically for message creation
import { PrismaClient } from '@prisma/client';

async function testMessageCreation() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing message creation...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create a test chat first
    const chat = await prisma.chat.create({
      data: {
        title: 'Test Chat for Messages ' + new Date().toISOString(),
      },
    });
    console.log('✅ Test chat created:', chat.id);

    // Test message creation (this is where the error was occurring)
    console.log('Testing message creation...');
    const message1 = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'user',
        content: 'Hello, this is a test message from user',
      },
    });
    console.log('✅ User message created successfully:', message1.id);

    // Test creating an assistant message with sources
    const message2 = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: 'assistant',
        content: 'Hello! This is a test response from assistant',
        sources: [
          {
            filename: 'test.pdf',
            page: 1,
            text: 'Sample text from document',
            score: 0.95
          }
        ],
      },
    });
    console.log('✅ Assistant message with sources created successfully:', message2.id);

    // Test retrieving messages
    console.log('Testing message retrieval...');
    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: 'asc' },
    });
    console.log('✅ Messages retrieved successfully:', messages.length, 'messages found');

    // Clean up
    await prisma.message.deleteMany({
      where: { chatId: chat.id },
    });
    await prisma.chat.delete({
      where: { id: chat.id },
    });
    console.log('✅ Test data cleaned up');

  } catch (error) {
    console.error('❌ Message test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('Database connection closed');
  }
}

testMessageCreation();
