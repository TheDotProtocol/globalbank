import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    // Get all user accounts with recent transactions
    const accounts = await prisma.account.findMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, account) => {
      return sum + Number(account.balance);
    }, 0);

    return NextResponse.json({
      accounts: accounts.map(account => ({
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
        isActive: account.isActive,
        createdAt: account.createdAt,
        recentTransactions: account.transactions.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          createdAt: transaction.createdAt
        }))
      })),
      totalBalance,
      accountCount: accounts.length
    });
  } catch (error) {
    console.error('Get user accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { accountType, initialBalance = 0 } = await request.json();

    // Validate input
    if (!accountType) {
      return NextResponse.json(
        { error: 'Account type is required' },
        { status: 400 }
      );
    }

    // Validate account type
    const validAccountTypes = ['SAVINGS', 'CHECKING', 'BUSINESS'];
    if (!validAccountTypes.includes(accountType)) {
      return NextResponse.json(
        { error: 'Invalid account type' },
        { status: 400 }
      );
    }

    // Check if user already has this type of account
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType,
        isActive: true
      }
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: `You already have a ${accountType.toLowerCase()} account` },
        { status: 400 }
      );
    }

    // Generate unique account number
    const accountNumber = `050611${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create new account
    const newAccount = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber,
        accountType,
        balance: initialBalance,
        currency: 'USD',
        isActive: true
      }
    });

    return NextResponse.json({
      message: 'Account created successfully',
      account: {
        id: newAccount.id,
        accountNumber: newAccount.accountNumber,
        accountType: newAccount.accountType,
        balance: newAccount.balance,
        currency: newAccount.currency,
        isActive: newAccount.isActive,
        createdAt: newAccount.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 