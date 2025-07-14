import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Get fixed deposit details
export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const depositId = params.id;

    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: depositId,
        userId: user.id
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

    if (!fixedDeposit) {
      return NextResponse.json(
        { error: 'Fixed deposit not found or not accessible' },
        { status: 404 }
      );
    }

    // Calculate current values
    const now = new Date();
    const isMatured = now >= fixedDeposit.maturityDate;
    const isActive = fixedDeposit.status === 'ACTIVE';
    
    // Calculate interest earned
    const startDate = fixedDeposit.createdAt;
    const endDate = isMatured ? fixedDeposit.maturityDate : now;
    const monthsElapsed = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    const interestEarned = isActive ? 
      (Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * monthsElapsed / 12) : 0;
    
    const currentValue = Number(fixedDeposit.amount) + interestEarned;
    const daysRemaining = isActive ? Math.ceil((fixedDeposit.maturityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return NextResponse.json({
      fixedDeposit: {
        id: fixedDeposit.id,
        amount: fixedDeposit.amount,
        interestRate: fixedDeposit.interestRate,
        duration: fixedDeposit.duration,
        maturityDate: fixedDeposit.maturityDate,
        status: fixedDeposit.status,
        createdAt: fixedDeposit.createdAt,
        currentValue: Math.round(currentValue * 100) / 100,
        interestEarned: Math.round(interestEarned * 100) / 100,
        isMatured,
        daysRemaining,
        canWithdraw: isMatured && fixedDeposit.status === 'ACTIVE'
      }
    });
  } catch (error) {
    console.error('Get fixed deposit details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Withdraw matured fixed deposit
export const PUT = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const depositId = params.id;
    const { action } = await request.json();

    if (action !== 'withdraw') {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Find fixed deposit
    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: depositId,
        userId: user.id
      }
    });

    if (!fixedDeposit) {
      return NextResponse.json(
        { error: 'Fixed deposit not found or not accessible' },
        { status: 404 }
      );
    }

    // Check if deposit is matured and active
    const now = new Date();
    const isMatured = now >= fixedDeposit.maturityDate;

    if (!isMatured) {
      return NextResponse.json(
        { error: 'Fixed deposit has not matured yet' },
        { status: 400 }
      );
    }

    if (fixedDeposit.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Fixed deposit is not active' },
        { status: 400 }
      );
    }

    // Calculate final amount with interest
    const monthsElapsed = (fixedDeposit.maturityDate.getTime() - fixedDeposit.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    const interestEarned = Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * monthsElapsed / 12;
    const finalAmount = Number(fixedDeposit.amount) + interestEarned;

    // Get user's savings account
    const savingsAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: 'SAVINGS',
        isActive: true
      }
    });

    if (!savingsAccount) {
      return NextResponse.json(
        { error: 'No active savings account found' },
        { status: 400 }
      );
    }

    // Update fixed deposit status
    await prisma.fixedDeposit.update({
      where: { id: depositId },
      data: { status: 'WITHDRAWN' }
    });

    // Add amount to savings account
    await prisma.account.update({
      where: { id: savingsAccount.id },
      data: {
        balance: {
          increment: finalAmount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        accountId: savingsAccount.id,
        userId: user.id,
        type: 'CREDIT',
        amount: finalAmount,
        description: `Fixed Deposit Maturity - Principal: $${fixedDeposit.amount}, Interest: $${Math.round(interestEarned * 100) / 100}`,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      message: 'Fixed deposit withdrawn successfully',
      withdrawal: {
        principal: fixedDeposit.amount,
        interest: Math.round(interestEarned * 100) / 100,
        totalAmount: Math.round(finalAmount * 100) / 100
      }
    });
  } catch (error) {
    console.error('Withdraw fixed deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 