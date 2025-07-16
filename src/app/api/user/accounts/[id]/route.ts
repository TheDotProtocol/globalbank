import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const accountId = params.id;

    // Get account with transactions
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Calculate account statistics
    const totalTransactions = account.transactions.length;
    const totalCredits = account.transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDebits = account.transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      account: {
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
          averageTransactionAmount: totalTransactions > 0 
            ? (totalCredits + totalDebits) / totalTransactions 
            : 0
        },
        transactions: account.transactions.map(transaction => ({
          id: transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          reference: transaction.reference,
          createdAt: transaction.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get account details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 