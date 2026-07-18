import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    console.log('🔍 Fetching admin dashboard statistics...');

    // Fetch basic statistics first
    const totalUsers = await prisma.user.count();
    const totalAccounts = await prisma.account.count();
    const totalTransactions = await prisma.transaction.count();
    const totalCards = await prisma.card.count();

    console.log('✅ Basic stats fetched:', { totalUsers, totalAccounts, totalTransactions, totalCards });

    // Try to fetch additional statistics with error handling
    let totalFixedDeposits = 0;
    let totalEchecks = 0;
    let pendingKYC = 0;
    let corporateBanks = 0;
    let totalBankTransfers = 0;

    try {
      totalFixedDeposits = await prisma.fixedDeposit.count();
      console.log('✅ Fixed deposits count:', totalFixedDeposits);
    } catch (error) {
      console.warn('⚠️ Fixed deposits count failed:', error);
    }

    try {
      totalEchecks = await prisma.eCheck.count();
      console.log('✅ E-checks count:', totalEchecks);
    } catch (error) {
      console.warn('⚠️ E-checks count failed:', error);
    }

    try {
      const pendingResult = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count FROM users WHERE "kycStatus"::text = 'PENDING'
      `;
      pendingKYC = Number(pendingResult[0]?.count ?? 0);
      console.log('✅ Pending KYC count:', pendingKYC);
    } catch (error) {
      console.warn('⚠️ Pending KYC count failed:', error);
    }

    try {
      corporateBanks = await prisma.corporateBank.count();
      console.log('✅ Corporate banks count:', corporateBanks);
    } catch (error) {
      console.warn('⚠️ Corporate banks count failed:', error);
    }

    try {
      totalBankTransfers = await prisma.bankTransfer.count();
      console.log('✅ Bank transfers count:', totalBankTransfers);
    } catch (error) {
      console.warn('⚠️ Bank transfers count failed:', error);
    }

    // Fetch recent transactions
    let recentTransactions: any[] = [];
    try {
      recentTransactions = await prisma.transaction.findMany({
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
      });
      console.log('✅ Recent transactions fetched:', recentTransactions.length);
    } catch (error) {
      console.warn('⚠️ Recent transactions fetch failed:', error);
    }

    // Fetch recent KYC documents
    let recentKYC: any[] = [];
    try {
      recentKYC = await prisma.kycDocument.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
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
      console.log('✅ Recent KYC documents fetched:', recentKYC.length);
    } catch (error) {
      console.warn('⚠️ Recent KYC documents fetch failed:', error);
    }

    // Fetch corporate bank statistics
    let corporateBankStats: any[] = [];
    try {
      corporateBankStats = await prisma.corporateBank.findMany({
        select: {
          id: true,
          bankName: true,
          accountNumber: true,
          isActive: true,
          currency: true,
          transferFee: true,
          _count: {
            select: {
              bankTransfers: true
            }
          }
        }
      });
      console.log('✅ Corporate bank stats fetched:', corporateBankStats.length);
    } catch (error) {
      console.warn('⚠️ Corporate bank stats fetch failed:', error);
    }

    console.log('✅ All dashboard statistics fetched successfully');

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
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}); 