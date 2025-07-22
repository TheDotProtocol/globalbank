import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

// Get all users for admin management
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const kycStatus = searchParams.get('kycStatus') || '';

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (kycStatus && kycStatus !== 'all') {
      where.kycStatus = kycStatus.toUpperCase();
    }

    // Get users with complete data including cards
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          kycStatus: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          accounts: {
            select: {
              id: true,
              accountNumber: true,
              accountType: true,
              balance: true,
              currency: true,
              isActive: true,
              createdAt: true,
              cards: {
                select: {
                  id: true,
                  cardNumber: true,
                  cardType: true,
                  status: true,
                  expiryDate: true,
                  cvv: true,
                  isVirtual: true,
                  isActive: true,
                  dailyLimit: true,
                  monthlyLimit: true,
                  createdAt: true
                }
              }
            }
          },
          kycDocuments: {
            select: {
              id: true,
              documentType: true,
              status: true,
              uploadedAt: true,
              verifiedAt: true
            }
          },
          fixedDeposits: {
            select: {
              id: true,
              amount: true,
              interestRate: true,
              duration: true,
              status: true,
              maturityDate: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Get transactions separately
    const userIds = users.map(user => user.id);
    const transactions = await prisma.transaction.findMany({
      where: { userId: { in: userIds } },
      select: {
        id: true,
        userId: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Combine the data
    const usersWithData = users.map(user => {
      const userTransactions = transactions.filter(tx => tx.userId === user.id);
      const totalBalance = user.accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
      const totalCards = user.accounts.reduce((sum, acc) => sum + acc.cards.length, 0);
      const totalTransactions = userTransactions.length;

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accounts: user.accounts.map(account => ({
          ...account,
          cards: account.cards,
          transactions: userTransactions.filter(tx => tx.userId === user.id)
        })),
        kycDocuments: user.kycDocuments,
        fixedDeposits: user.fixedDeposits,
        recentTransactions: userTransactions.slice(0, 5),
        totalBalance,
        totalCards,
        totalTransactions
      };
    });

    return NextResponse.json({
      users: usersWithData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// Update user KYC status
export const PUT = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { userId, kycStatus, adminNote } = await request.json();

    if (!userId || !kycStatus) {
      return NextResponse.json(
        { error: 'User ID and KYC status are required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { 
        kycStatus: kycStatus.toUpperCase(),
        updatedAt: new Date()
      },
      include: {
        accounts: true
      }
    });

    // Log admin action
    console.log(`Admin ${admin.email} updated KYC status for user ${updatedUser.email} to ${kycStatus}`);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `KYC status updated to ${kycStatus}`
    });
  } catch (error) {
    console.error('Update KYC status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 