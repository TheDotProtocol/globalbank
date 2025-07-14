import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Admin dashboard statistics
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    // Check if user is admin (you can implement admin role checking here)
    // For now, we'll allow access to all authenticated users

    // Get system statistics
    const [
      totalUsers,
      activeUsers,
      pendingKyc,
      verifiedKyc,
      totalTransactions,
      totalCards,
      totalFixedDeposits,
      systemBalance
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { kycStatus: 'VERIFIED' } }),
      prisma.kycDocument.count({ where: { status: 'PENDING' } }),
      prisma.kycDocument.count({ where: { status: 'VERIFIED' } }),
      prisma.transaction.count(),
      prisma.card.count(),
      prisma.fixedDeposit.count({ where: { status: 'ACTIVE' } }),
      prisma.account.aggregate({
        _sum: { balance: true }
      })
    ]);

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        kycStatus: true,
        createdAt: true
      }
    });

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      }
    });

    return NextResponse.json({
      statistics: {
        totalUsers,
        activeUsers,
        pendingKyc,
        verifiedKyc,
        totalTransactions,
        totalCards,
        totalFixedDeposits,
        systemBalance: systemBalance._sum.balance || 0
      },
      recentUsers,
      recentTransactions
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 