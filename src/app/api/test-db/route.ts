import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('Database connected successfully');
    
    // Test query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('Test query result:', result);
    
    // Test table access
    const chatCount = await prisma.chat.count();
    console.log('Chat count:', chatCount);
    
    return NextResponse.json({ 
      status: 'success', 
      message: 'Database connection working',
      chatCount,
      testQuery: result
    });
  } catch (error) {
    console.error('Database connection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error && typeof error === 'object' && 'code' in error ? (error as { code: string }).code : 'UNKNOWN';
    
    return NextResponse.json(
      { 
        error: 'Database connection failed', 
        details: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
