import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accountId = params.id;

    // Get account details with transactions
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Calculate statistics
    const allTransactions = await prisma.transaction.findMany({
      where: { accountId: accountId }
    });

    const totalTransactions = allTransactions.length;
    const totalCredits = allTransactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const totalDebits = allTransactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const averageTransactionAmount = totalTransactions > 0 
      ? allTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / totalTransactions 
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
      transactions: account.transactions
    };

    return NextResponse.json({ account: accountDetails });
  } catch (error) {
    console.error('Error fetching account details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 