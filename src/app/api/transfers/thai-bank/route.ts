import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const {
      sourceAccountId,
      amount,
      destinationAccountNumber,
      accountHolderName,
      bankCode,
      bankName,
      reason
    } = await request.json();

    // Validate input
    if (!sourceAccountId || !amount || !destinationAccountNumber || !accountHolderName || !bankCode || !bankName || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Verify source account exists and belongs to user
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: sourceAccountId,
        userId: user.id,
        isActive: true
      }
    });

    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found or inactive' },
        { status: 404 }
      );
    }

    // Check balance
    const balance = typeof sourceAccount.balance === 'string' 
      ? parseFloat(sourceAccount.balance) 
      : sourceAccount.balance;

    const transferFee = transferAmount * 0.01; // 1% fee for Thai bank transfers
    const totalAmount = transferAmount + transferFee;

    if (balance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `THAI-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction for debit
    const debitTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: sourceAccountId,
        type: 'DEBIT',
        amount: totalAmount,
        description: `Thai Bank Transfer to ${bankName} - ${accountHolderName}. Reason: ${reason}`,
        status: 'COMPLETED',
        reference: reference,
        transferMode: 'EXTERNAL_TRANSFER',
        destinationAccountNumber: destinationAccountNumber,
        destinationAccountHolder: accountHolderName,
        transferFee: transferFee,
        netAmount: transferAmount
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: sourceAccountId },
      data: {
        balance: balance - totalAmount
      }
    });

    // Update bank total balance (if exists)
    try {
      const bankBalance = await prisma.account.aggregate({
        _sum: {
          balance: true
        },
        where: {
          isActive: true
        }
      });

      // Update admin balance record if exists
      const adminBalance = await prisma.adminBalance.findFirst();
      if (adminBalance) {
        await prisma.adminBalance.update({
          where: { id: adminBalance.id },
          data: {
            totalBalance: bankBalance._sum.balance || 0
          }
        });
      }
    } catch (error) {
      // Admin balance might not exist, continue
      console.log('Could not update admin balance:', error);
    }

    return NextResponse.json({
      success: true,
      transaction: {
        id: debitTransaction.id,
        reference: reference,
        amount: transferAmount,
        fee: transferFee,
        totalAmount: totalAmount,
        status: 'COMPLETED'
      },
      message: 'Thai bank transfer completed successfully'
    });

  } catch (error) {
    console.error('Thai bank transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process Thai bank transfer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

