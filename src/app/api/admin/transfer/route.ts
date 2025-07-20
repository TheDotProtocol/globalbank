import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { fromAccountNumber, toAccountNumber, amount, description } = await request.json();

    // Validate input
    if (!fromAccountNumber || !toAccountNumber || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid input parameters' },
        { status: 400 }
      );
    }

    // Find accounts
    const fromAccount = await prisma.account.findUnique({
      where: { accountNumber: fromAccountNumber },
      include: { user: true }
    });

    const toAccount = await prisma.account.findUnique({
      where: { accountNumber: toAccountNumber },
      include: { user: true }
    });

    if (!fromAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }

    if (!toAccount) {
      return NextResponse.json(
        { error: 'Destination account not found' },
        { status: 404 }
      );
    }

    if (fromAccount.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Perform transfer using transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create debit transaction
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: fromAccount.id,
          userId: fromAccount.userId,
          type: 'DEBIT',
          amount: amount,
          description: description || `Transfer to ${toAccount.user.firstName} ${toAccount.user.lastName} (${toAccount.accountNumber})`,
          status: 'COMPLETED',
          transferMode: 'INTERNAL_TRANSFER',
          metadata: {
            destinationAccount: toAccount.accountNumber,
            destinationUser: `${toAccount.user.firstName} ${toAccount.user.lastName}`,
            transferType: 'internal_transfer',
            adminTransfer: true
          }
        }
      });

      // Create credit transaction
      const creditTransaction = await tx.transaction.create({
        data: {
          accountId: toAccount.id,
          userId: toAccount.userId,
          type: 'CREDIT',
          amount: amount,
          description: `Transfer from ${fromAccount.user.firstName} ${fromAccount.user.lastName} (${fromAccount.accountNumber})`,
          status: 'COMPLETED',
          transferMode: 'INTERNAL_TRANSFER',
          metadata: {
            sourceAccount: fromAccount.accountNumber,
            sourceUser: `${fromAccount.user.firstName} ${fromAccount.user.lastName}`,
            transferType: 'internal_transfer',
            adminTransfer: true
          }
        }
      });

      // Update account balances
      await tx.account.update({
        where: { id: fromAccount.id },
        data: { balance: fromAccount.balance - amount }
      });

      await tx.account.update({
        where: { id: toAccount.id },
        data: { balance: toAccount.balance + amount }
      });

      return { debitTransaction, creditTransaction };
    });

    return NextResponse.json({
      message: 'Transfer completed successfully',
      transfer: {
        fromAccount: fromAccount.accountNumber,
        toAccount: toAccount.accountNumber,
        amount: amount,
        description: description,
        debitTransactionId: result.debitTransaction.id,
        creditTransactionId: result.creditTransaction.id
      }
    });

  } catch (error) {
    console.error('Admin transfer error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 