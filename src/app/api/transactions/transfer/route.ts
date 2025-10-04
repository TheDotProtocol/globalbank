import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const { fromAccountId, toAccountNumber, amount, description } = await request.json();
    const user = (request as any).user;

    if (!fromAccountId || !toAccountNumber || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer parameters' },
        { status: 400 }
      );
    }

    // Verify user owns the source account
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: user.id,
        isActive: true
      }
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found or access denied' },
        { status: 404 }
      );
    }

    // Find destination account
    const destinationAccount = await prisma.account.findFirst({
      where: {
        accountNumber: toAccountNumber,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!destinationAccount) {
      return NextResponse.json(
        { error: 'Destination account not found' },
        { status: 404 }
      );
    }

    // Check if source account has sufficient balance
    const sourceBalance = parseFloat(sourceAccount.balance.toString());
    if (sourceBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Perform transfer in a transaction
    const transferResult = await prisma.$transaction(async (tx) => {
      // Deduct from source account
      const updatedSourceAccount = await tx.account.update({
        where: { id: fromAccountId },
        data: {
          balance: {
            decrement: amount
          }
        }
      });

      // Add to destination account
      const updatedDestinationAccount = await tx.account.update({
        where: { id: destinationAccount.id },
        data: {
          balance: {
            increment: amount
          }
        }
      });

      // Create debit transaction
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount: amount,
          description: `Transfer to ${destinationAccount.accountNumber} - ${description || 'Internal Transfer'}`,
          reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'COMPLETED'
        }
      });

      // Create credit transaction
      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: destinationAccount.id,
          userId: destinationAccount.userId,
          type: 'CREDIT',
          amount: amount,
          description: `Transfer from ${sourceAccount.accountNumber} - ${description || 'Internal Transfer'}`,
          reference: `TRF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          status: 'COMPLETED'
        }
      });

      return {
        sourceAccount: updatedSourceAccount,
        destinationAccount: updatedDestinationAccount,
        debitTransaction,
        creditTransaction
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Transfer completed successfully',
      transfer: {
        fromAccount: sourceAccount.accountNumber,
        toAccount: destinationAccount.accountNumber,
        amount: amount,
        description: description || 'Internal Transfer',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Transfer error:', error);
    return NextResponse.json(
      { 
        error: 'Transfer failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}); 