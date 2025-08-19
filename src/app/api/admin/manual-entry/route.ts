import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { userId, accountId, amount, type, description, adminNote } = await request.json();

    console.log('🔧 Admin manual entry request:', { userId, accountId, amount, type, description });

    // Validate required fields
    if (!userId || !accountId || !amount || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate transaction type
    const validTypes = ['CREDIT', 'DEBIT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type. Must be CREDIT or DEBIT' },
        { status: 400 }
      );
    }

    // Validate amount
    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or inactive' },
        { status: 404 }
      );
    }

    // For DEBIT transactions, check sufficient balance
    if (type === 'DEBIT') {
      if (account.balance.toNumber() < transactionAmount) {
        return NextResponse.json(
          { error: 'Insufficient balance in account' },
          { status: 400 }
        );
      }
    }

    let transaction;

    // Route transaction through K Bank corporate account
    if (type === 'CREDIT') {
      transaction = await corporateBankService.processCreditTransaction(
        userId,
        accountId,
        transactionAmount,
        `Admin Manual Entry: ${description}${adminNote ? ` (${adminNote})` : ''}`,
        `ADMIN-${Date.now()}`
      );
    } else {
      transaction = await corporateBankService.processDebitTransaction(
        userId,
        accountId,
        transactionAmount,
        `Admin Manual Entry: ${description}${adminNote ? ` (${adminNote})` : ''}`,
        `ADMIN-${Date.now()}`
      );
    }

    // Get updated account balance
    const updatedAccount = await prisma.account.findUnique({
      where: { id: accountId }
    });

    console.log('✅ Admin manual entry completed:', {
      transactionId: transaction.id,
      type: transaction.type,
      amount: transaction.amount,
      newBalance: updatedAccount?.balance
    });

    return NextResponse.json({
      success: true,
      message: 'Manual entry created successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        reference: transaction.reference,
        status: transaction.status,
        createdAt: transaction.createdAt
      },
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        previousBalance: account.balance,
        newBalance: updatedAccount?.balance,
        user: {
          name: `${account.user.firstName} ${account.user.lastName}`,
          email: account.user.email
        }
      }
    });

  } catch (error: any) {
    console.error('❌ Admin manual entry error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create manual entry',
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 