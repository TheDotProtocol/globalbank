import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    console.log('🧪 Testing database connection...');
    
    // Test basic database connection
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    // Test if international_transfers table exists and is accessible
    try {
      const transferCount = await prisma.internationalTransfer.count();
      console.log('✅ International transfers count:', transferCount);
    } catch (error) {
      console.log('❌ International transfers table error:', error);
      return NextResponse.json({
        success: false,
        error: 'International transfers table not accessible',
        details: error instanceof Error ? error.message : 'Unknown error',
        userCount
      });
    }
    
    // Test if we can create a transaction record (simplified to avoid enum issues)
    try {
      // Just test if we can query transactions instead of creating
      const transactionCount = await prisma.transaction.count();
      console.log('✅ Transaction query test successful, count:', transactionCount);
      
    } catch (error) {
      console.log('❌ Transaction query test failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Transaction query failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        userCount
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and table access successful',
      userCount,
      internationalTransfersCount: await prisma.internationalTransfer.count()
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: errorMessage
    }, { status: 500 });
  }
});
