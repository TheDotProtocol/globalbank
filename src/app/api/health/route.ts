import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (request: NextRequest) => {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Test cards table
    const cardsCount = await prisma.card.count();
    
    // Test users table
    const usersCount = await prisma.user.count();
    
    // Test accounts table
    const accountsCount = await prisma.account.count();

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      tables: {
        cards: cardsCount,
        users: usersCount,
        accounts: accountsCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}; 