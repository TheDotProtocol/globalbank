import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';

const prisma = new PrismaClient();

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const accountId = searchParams.get('accountId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {
      userId: user.id
    };

    if (accountId) {
      where.accountId = accountId;
    }

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get transactions with pagination
    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.transaction.count({ where });

    // Calculate statistics
    const totalAmount = transactions.reduce((sum, t) => {
      return sum + Number(t.amount);
    }, 0);

    const totalCredits = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalDebits = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      transactions: transactions.map(transaction => ({
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt,
        isDisputed: transaction.isDisputed,
        disputeStatus: transaction.disputeStatus,
        disputeReason: transaction.disputeReason,
        account: {
          accountNumber: transaction.account.accountNumber,
          accountType: transaction.account.accountType
        }
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      statistics: {
        totalAmount,
        totalCredits,
        totalDebits,
        transactionCount: transactions.length
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { accountId, type, amount, description, recipientAccountId } = await request.json();

    // Validate input
    if (!accountId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Account ID, type, amount, and description are required' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['CREDIT', 'DEBIT', 'TRANSFER', 'WITHDRAWAL', 'DEPOSIT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or not accessible' },
        { status: 404 }
      );
    }

    // Check sufficient balance for debit/withdrawal/transfer
    if (['DEBIT', 'WITHDRAWAL', 'TRANSFER'].includes(type)) {
      if (Number(account.balance) < Number(amount)) {
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }
    }

    // Generate unique reference
    const reference = `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId,
        userId: user.id,
        type,
        amount,
        description,
        reference,
        status: 'PENDING'
      }
    });

    // Update account balance
    let newBalance = Number(account.balance);
    if (['CREDIT', 'DEPOSIT'].includes(type)) {
      newBalance += Number(amount);
    } else if (['DEBIT', 'WITHDRAWAL', 'TRANSFER'].includes(type)) {
      newBalance -= Number(amount);
    }

    await prisma.account.update({
      where: { id: accountId },
      data: { balance: newBalance }
    });

    // Handle transfer to recipient account
    if (type === 'TRANSFER' && recipientAccountId) {
      const recipientAccount = await prisma.account.findFirst({
        where: {
          id: recipientAccountId,
          isActive: true
        }
      });

      if (recipientAccount) {
        // Create credit transaction for recipient
        await prisma.transaction.create({
          data: {
            accountId: recipientAccountId,
            userId: recipientAccount.userId,
            type: 'CREDIT',
            amount,
            description: `Transfer from ${account.accountNumber}`,
            reference: `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
            status: 'COMPLETED'
          }
        });

        // Update recipient account balance
        await prisma.account.update({
          where: { id: recipientAccountId },
          data: { balance: Number(recipientAccount.balance) + Number(amount) }
        });
      }
    }

    // Update transaction status to completed
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' }
    });

    return NextResponse.json({
      message: 'Transaction created successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        reference: transaction.reference,
        status: 'COMPLETED',
        createdAt: transaction.createdAt
      },
      newBalance
    }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 