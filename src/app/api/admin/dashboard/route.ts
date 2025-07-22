import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    // Fetch all statistics in parallel
    const [
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalCards,
      totalFixedDeposits,
      totalEchecks,
      pendingKYC,
      corporateBanks,
      totalBankTransfers,
      recentTransactions,
      recentKYC,
      corporateBankStats
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total accounts
      prisma.account.count(),
      
      // Total transactions
      prisma.transaction.count(),
      
      // Total cards
      prisma.card.count(),
      
      // Total fixed deposits
      prisma.fixedDeposit.count(),
      
      // Total e-checks
      prisma.eCheck.count(),
      
      // Pending KYC documents
      prisma.kycDocument.count({
        where: { status: 'PENDING' }
      }),
      
      // Corporate banks
      prisma.corporateBank.count(),
      
      // Total bank transfers
      prisma.bankTransfer.count(),
      
      // Recent transactions (last 10)
      prisma.transaction.findMany({
        take: 10,
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
      }),
      
      // Recent KYC documents (last 10)
      prisma.kycDocument.findMany({
        take: 10,
        orderBy: { uploadedAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      }),
      
      // Corporate bank statistics
      prisma.corporateBank.findMany({
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          isActive: true,
          dailyLimit: true,
          monthlyLimit: true,
          currency: true,
          _count: {
            select: {
              bankTransfers: true
            }
          }
        }
      })
    ]);

    return NextResponse.json({
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalCards,
      totalFixedDeposits,
      totalEchecks,
      pendingKYC,
      corporateBanks,
      totalBankTransfers,
      recentTransactions,
      recentKYC,
      corporateBankStats
    });

  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}); 