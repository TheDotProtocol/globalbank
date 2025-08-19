import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { userId, accountId, type, amount, description, reference } = await request.json();

    // Validate input
    if (!userId || !accountId || !type || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['CREDIT', 'DEBIT', 'TRANSFER'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
        isActive: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: type as any,
        amount: parseFloat(amount),
        description,
        reference: reference || `ADMIN-TXN-${Date.now()}`,
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

    // Update account balance
    const balanceChange = type === 'CREDIT' ? amount : -amount;
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: { increment: balanceChange }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
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
    }, { status: 201 });

  } catch (error) {
    console.error('Admin create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}); 