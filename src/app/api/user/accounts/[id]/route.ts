import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    // Get account with transactions and statistics
    const account = await prisma.account.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const totalTransactions = account.transactions.length;
    const totalCredits = account.transactions
      .filter(tx => tx.type === 'CREDIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalDebits = account.transactions
      .filter(tx => tx.type === 'DEBIT')
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const averageTransactionAmount = totalTransactions > 0 
      ? (totalCredits + totalDebits) / totalTransactions 
      : 0;

    const accountDetails = {
      id: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      balance: account.balance,
      currency: account.currency,
      isActive: account.isActive,
      createdAt: account.createdAt,
      statistics: {
        totalTransactions,
        totalCredits,
        totalDebits,
        averageTransactionAmount
      },
      transactions: account.transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        createdAt: transaction.createdAt,
        reference: transaction.reference
      }))
    };

    return NextResponse.json({ account: accountDetails });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account' },
      { status: 500 }
    );
  }
});
