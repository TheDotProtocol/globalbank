import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const POST = async (request: NextRequest) => {
  try {
    const { email, amount, description } = await request.json();

    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find the account
    const account = await prisma.account.findFirst({
      where: { userId: user.id }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: account.id,
        type: 'CREDIT',
        amount: parseFloat(amount),
        description: description || 'Manual deposit entry',
        status: 'COMPLETED',
        reference: `MANUAL-${Date.now()}`,
        metadata: {
          adminNote: 'Manual deposit entry from API',
          createdBy: 'admin',
          timestamp: new Date().toISOString()
        }
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: account.id },
      data: {
        balance: {
          increment: parseFloat(amount)
        }
      }
    });

    // Get updated account
    const updatedAccount = await prisma.account.findUnique({
      where: { id: account.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Balance updated successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      },
      account: {
        id: updatedAccount.id,
        accountNumber: updatedAccount.accountNumber,
        balance: updatedAccount.balance
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Fix balance error:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}; 