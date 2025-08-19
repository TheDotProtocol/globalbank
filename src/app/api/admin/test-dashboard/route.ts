import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    console.log('🔍 Testing admin dashboard with basic stats...');

    // Test basic database connection
    const totalUsers = await prisma.user.count();
    console.log('✅ Total users:', totalUsers);

    const totalAccounts = await prisma.account.count();
    console.log('✅ Total accounts:', totalAccounts);

    const totalTransactions = await prisma.transaction.count();
    console.log('✅ Total transactions:', totalTransactions);

    const totalCards = await prisma.card.count();
    console.log('✅ Total cards:', totalCards);

    // Test if we can fetch a recent transaction
    const recentTransaction = await prisma.transaction.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        account: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log('✅ Recent transaction fetched:', recentTransaction ? 'Yes' : 'No');

    return NextResponse.json({
      success: true,
      message: 'Dashboard test successful',
      stats: {
        totalUsers,
        totalAccounts,
        totalTransactions,
        totalCards
      },
      recentTransaction: recentTransaction ? {
        id: recentTransaction.id,
        description: recentTransaction.description,
        amount: recentTransaction.amount,
        status: recentTransaction.status,
        createdAt: recentTransaction.createdAt,
        accountHolder: recentTransaction.account?.user ? 
          `${recentTransaction.account.user.firstName} ${recentTransaction.account.user.lastName}` : 
          'Unknown'
      } : null
    });

  } catch (error: any) {
    console.error('❌ Dashboard test error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Dashboard test failed', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}); 