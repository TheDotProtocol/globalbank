import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { userId: user.id };
    if (accountId) {
      where.accountId = accountId;
    }

    const [transactions, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
              currency: true
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    
    const { accountId, type, amount, description, reference } = body;
    
    if (!accountId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const validTypes = ['CREDIT', 'DEBIT', 'TRANSFER'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }
    
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      }
    });
    
    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // For DEBIT transactions, check sufficient balance
    if (type === 'DEBIT') {
      if (account.balance.toNumber() < amount) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
    }

    let transaction;

    // Route all transactions through K Bank corporate account
    if (type === 'CREDIT') {
      transaction = await corporateBankService.processCreditTransaction(
        user.id,
        accountId,
        amount,
        description,
        reference || `TXN-${Date.now()}`
      );
    } else if (type === 'DEBIT') {
      transaction = await corporateBankService.processDebitTransaction(
        user.id,
        accountId,
        amount,
        description,
        reference || `TXN-${Date.now()}`
      );
    } else {
      // For TRANSFER type, we'll handle it as a combination of DEBIT and CREDIT
      // This should be handled by the transfer API instead
      return NextResponse.json(
        { error: 'Use transfer API for transfer transactions' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt,
        account: {
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          currency: account.currency
        }
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
});
