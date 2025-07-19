import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { userId, accountId, amount, interestRate, duration, description } = await request.json();

    // Validate input
    if (!userId || !accountId || !amount || !interestRate || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + duration);

    // Create fixed deposit
    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId,
        accountId,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        duration: parseInt(duration),
        maturityDate,
        status: 'ACTIVE' as any
      }
    });

    // Create transaction record for the fixed deposit
    await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: 'DEBIT',
        amount: parseFloat(amount),
        description: description || `Fixed Deposit - ${duration} months at ${interestRate}% p.a.`,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Fixed deposit created successfully',
      fixedDeposit: {
        id: fixedDeposit.id,
        amount: fixedDeposit.amount,
        interestRate: fixedDeposit.interestRate,
        duration: fixedDeposit.duration,
        maturityDate: fixedDeposit.maturityDate,
        status: fixedDeposit.status,
        createdAt: fixedDeposit.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Admin create fixed deposit error:', error);
    return NextResponse.json(
      { error: 'Failed to create fixed deposit' },
      { status: 500 }
    );
  }
}); 