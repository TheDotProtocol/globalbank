import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';

// Interest rate tiers for fixed deposits
const FIXED_DEPOSIT_RATES = {
  3: { rate: 6.5, minAmount: 100, name: '3 Months' },
  6: { rate: 7.5, minAmount: 100, name: '6 Months' },
  12: { rate: 9.0, minAmount: 100, name: '12 Months' },
  24: { rate: 10.0, minAmount: 100, name: '24 Months' }
};

// List user's fixed deposits
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build where clause
    const where: any = { userId: user.id };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Get fixed deposits with account info
    const fixedDeposits = await prisma.fixedDeposit.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count
    const totalCount = await prisma.fixedDeposit.count({ where });

    // Calculate current values and interest earned
    const depositsWithCalculations = fixedDeposits.map(deposit => {
      const now = new Date();
      const isMatured = now >= deposit.maturityDate;
      const isActive = deposit.status === 'ACTIVE';
      
      // Calculate interest earned
      const startDate = deposit.createdAt;
      const endDate = isMatured ? deposit.maturityDate : now;
      const monthsElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      const interestEarned = isActive ? 
        (Number(deposit.amount) * Number(deposit.interestRate) / 100 * monthsElapsed / 12) : 0;
      
      const currentValue = Number(deposit.amount) + interestEarned;

      return {
        id: deposit.id,
        amount: deposit.amount,
        interestRate: deposit.interestRate,
        duration: deposit.duration,
        maturityDate: deposit.maturityDate,
        status: deposit.status,
        createdAt: deposit.createdAt,
        currentValue: Math.round(currentValue * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        isMatured,
        daysRemaining: isActive ? Math.ceil((deposit.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
      };
    });

    return NextResponse.json({
      fixedDeposits: depositsWithCalculations,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      },
      availableRates: FIXED_DEPOSIT_RATES
    });
  } catch (error) {
    console.error('Get fixed deposits error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Create new fixed deposit
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { amount, duration } = await request.json();

    // Validate input
    if (!amount || !duration) {
      return NextResponse.json(
        { error: 'Amount and duration are required' },
        { status: 400 }
      );
    }

    // Validate duration
    if (!FIXED_DEPOSIT_RATES[duration as keyof typeof FIXED_DEPOSIT_RATES]) {
      return NextResponse.json(
        { error: 'Invalid duration. Available durations: 3, 6, 12, 24 months' },
        { status: 400 }
      );
    }

    const rateInfo = FIXED_DEPOSIT_RATES[duration as keyof typeof FIXED_DEPOSIT_RATES];
    
    // Validate minimum amount
    if (amount < rateInfo.minAmount) {
      return NextResponse.json(
        { error: `Minimum amount for ${rateInfo.name} is $${rateInfo.minAmount}` },
        { status: 400 }
      );
    }

    // Get user's primary savings account
    const savingsAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: 'SAVINGS',
        isActive: true
      }
    });

    if (!savingsAccount) {
      return NextResponse.json(
        { error: 'No active savings account found. Please create a savings account first.' },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance
    if (Number(savingsAccount.balance) < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance in savings account' },
        { status: 400 }
      );
    }

    // Calculate maturity date
    const maturityDate = new Date();
    maturityDate.setMonth(maturityDate.getMonth() + duration);

    // Create fixed deposit with explicit status
    const fixedDeposit = await prisma.fixedDeposit.create({
      data: {
        userId: user.id,
        accountId: savingsAccount.id,
        amount,
        interestRate: rateInfo.rate,
        duration,
        maturityDate,
        status: 'ACTIVE' as any
      }
    });

    // Deduct amount from savings account
    await prisma.account.update({
      where: { id: savingsAccount.id },
      data: {
        balance: {
          decrement: amount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        accountId: savingsAccount.id,
        userId: user.id,
        type: 'DEBIT',
        amount,
        description: `Fixed Deposit - ${rateInfo.name} at ${rateInfo.rate}% p.a.`,
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
    console.error('Create fixed deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 