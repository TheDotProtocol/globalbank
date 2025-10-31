import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const {
      sourceAccountId,
      amount,
      promptPayId,
      reason,
      qrCode
    } = await request.json();

    // Validate input
    if (!sourceAccountId || !amount || !promptPayId || !reason) {
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

    // Validate PromptPay ID format (10 digits for phone, 13 digits for national ID)
    const cleanedId = promptPayId.replace(/\D/g, '');
    if (cleanedId.length !== 10 && cleanedId.length !== 13) {
      return NextResponse.json(
        { error: 'Invalid PromptPay ID. Must be 10 digits (phone) or 13 digits (national ID)' },
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

    // Check balance - convert Prisma Decimal to number
    const balance = parseFloat(sourceAccount.balance.toString());

    // No fee for PromptPay transfers
    const totalAmount = transferAmount;

    if (balance < totalAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Generate unique reference
    const reference = `PROMPTPAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction for debit
    const debitTransaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId: sourceAccountId,
        type: 'DEBIT',
        amount: transferAmount,
        description: `PromptPay Transfer to ${cleanedId}. Reason: ${reason}`,
        status: 'COMPLETED',
        reference: reference,
        transferMode: 'MOBILE_TRANSFER',
        destinationAccountNumber: cleanedId,
        transferFee: 0,
        netAmount: transferAmount
      }
    });

    // Update account balance
    await prisma.account.update({
      where: { id: sourceAccountId },
      data: {
        balance: {
          decrement: totalAmount
        }
      }
    });

    // Bank total balance is calculated dynamically from account aggregation
    // No need to update a separate admin balance table

    return NextResponse.json({
      success: true,
      transaction: {
        id: debitTransaction.id,
        reference: reference,
        amount: transferAmount,
        fee: 0,
        totalAmount: totalAmount,
        status: 'COMPLETED',
        promptPayId: cleanedId,
        qrCode: qrCode
      },
      message: 'PromptPay transfer initiated successfully'
    });

  } catch (error) {
    console.error('Thai QR transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process PromptPay transfer', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

