import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { userId, accountId, amount, type, description, adminNote } = await request.json();

    // Validate input
    if (!userId || !accountId || !amount || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!['CREDIT', 'DEBIT'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Create transaction with admin note in description
    const fullDescription = adminNote ? `${description} (Admin Note: ${adminNote})` : description;
    
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type,
        amount: numericAmount,
        description: fullDescription,
        status: 'COMPLETED',
        reference: `ADMIN-${Date.now()}`
      }
    });

    // Update account balance
    const balanceChange = type === 'CREDIT' ? numericAmount : -numericAmount;
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Manual entry created successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Manual entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create manual entry' },
      { status: 500 }
    );
  }
}); 