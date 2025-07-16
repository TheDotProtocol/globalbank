import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, accountId, amount, duration, interestRate } = await request.json();

    // Validate input
    if (!userId || !accountId || !amount || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify account exists and has sufficient balance
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    if (account.balance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate maturity date and interest
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + duration);
    
    const defaultInterestRate = 5.5; // Default 5.5% annual interest
    const finalInterestRate = interestRate || defaultInterestRate;
    const interestAmount = (amount * finalInterestRate * duration) / (12 * 100);

    // Create fixed deposit
    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId,
        accountId,
        amount,
        interestRate: finalInterestRate,
        duration,
        maturityDate,
        maturityAmount: amount + interestAmount,
        status: 'ACTIVE'
      }
    });

    // Deduct amount from account
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type: 'WITHDRAWAL',
        amount,
        description: `Fixed deposit created - ${duration} months`,
        status: 'COMPLETED',
        reference: `FD-${fixedDeposit.id}`
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fixed deposit created successfully',
      fixedDeposit: {
        id: fixedDeposit.id,
        amount,
        interestRate: finalInterestRate,
        duration,
        maturityDate,
        maturityAmount: fixedDeposit.maturityAmount,
        status: fixedDeposit.status
      }
    });

  } catch (error) {
    console.error('Create fixed deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to create fixed deposit' },
      { status: 500 }
    );
  }
} 