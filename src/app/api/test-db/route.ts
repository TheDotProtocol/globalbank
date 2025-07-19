import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Test DB: Starting database connection test...');
    
    // Test basic connection
    const userCount = await prisma.user.count();
    console.log('Test DB: User count:', userCount);
    
    // Test a simple query
    const testUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true
      }
    });
    
    console.log('Test DB: Test user found:', !!testUser);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      userCount,
      testUser: testUser ? {
        id: testUser.id,
        email: testUser.email,
        name: `${testUser.firstName} ${testUser.lastName}`
      } : null
    });
  } catch (error) {
    console.error('Test DB: Database connection failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 