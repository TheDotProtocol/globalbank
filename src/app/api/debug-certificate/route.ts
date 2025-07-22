import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (request: NextRequest) => {
  try {
    console.log('🔍 Debug certificate endpoint called');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database connection successful:', testQuery);
    
    // Test fixed deposit query
    console.log('🔍 Testing fixed deposit query...');
    const fixedDeposits = await prisma.fixedDeposit.findMany({
      take: 5,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ Fixed deposits found:', fixedDeposits.length);
    
    // Test account query
    console.log('🔍 Testing account query...');
    const accounts = await prisma.account.findMany({
      take: 5,
      select: {
        id: true,
        accountNumber: true,
        accountType: true
      }
    });
    
    console.log('✅ Accounts found:', accounts.length);
    
    return NextResponse.json({
      success: true,
      message: 'Debug certificate successful',
      databaseConnection: 'OK',
      fixedDepositsCount: fixedDeposits.length,
      accountsCount: accounts.length,
      sampleFixedDeposit: fixedDeposits[0] ? {
        id: fixedDeposits[0].id,
        amount: fixedDeposits[0].amount,
        userId: fixedDeposits[0].userId
      } : null,
      sampleAccount: accounts[0] ? {
        id: accounts[0].id,
        accountNumber: accounts[0].accountNumber
      } : null
    });
    
  } catch (error: any) {
    console.error('❌ Debug certificate error:', error);
    return NextResponse.json(
      { 
        error: 'Debug certificate failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}; 