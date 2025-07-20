import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;
    
    const where: any = { userId: user.id };
    
    if (accountId) where.accountId = accountId;
    if (type) where.type = type;
    if (status) where.status = status;
    
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
            currency: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });
    
    const total = await prisma.transaction.count({ where });
    
    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId: user.id },
      _sum: { amount: true }
    });
    
    const summary = {
      total,
      income: stats.find(s => s.type === 'CREDIT')?._sum.amount || 0,
      expenses: stats.find(s => s.type === 'DEBIT')?._sum.amount || 0
    };
    
    return NextResponse.json({
      success: true,
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        reference: t.reference,
        status: t.status,
        createdAt: t.createdAt,
        account: t.account,
        // Enhanced transfer details
        transferMode: t.transferMode,
        sourceAccountId: t.sourceAccountId,
        destinationAccountId: t.destinationAccountId,
        sourceAccountNumber: t.sourceAccountNumber,
        destinationAccountNumber: t.destinationAccountNumber,
        sourceAccountHolder: t.sourceAccountHolder,
        destinationAccountHolder: t.destinationAccountHolder,
        transferFee: t.transferFee,
        netAmount: t.netAmount
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary
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
    
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId,
        type: type as any,
        amount: parseFloat(amount),
        description,
        reference: reference || `TXN-${Date.now()}`,
        status: 'COMPLETED'
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
            currency: true
          }
        }
      }
    });
    
    const balanceChange = type === 'CREDIT' ? amount : -amount;
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: balanceChange }
      }
    });
    
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
        account: transaction.account
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
