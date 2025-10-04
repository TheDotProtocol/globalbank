import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!fixedDeposit) {
      return NextResponse.json(
        { error: 'Fixed deposit not found' },
        { status: 404 }
      );
    }

    // Calculate interest earned
    const now = new Date();
    const startDate = fixedDeposit.createdAt;
    const maturityDate = fixedDeposit.maturityDate;
    const isMatured = now >= maturityDate;
    
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const interestEarned = isMatured 
      ? Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * (totalDays / 365)
      : Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * (daysElapsed / 365);

    return NextResponse.json({
      fixedDeposit: {
        ...fixedDeposit,
        interestEarned: interestEarned.toFixed(2),
        isMatured,
        daysElapsed,
        totalDays,
        maturityAmount: (Number(fixedDeposit.amount) + interestEarned).toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error fetching fixed deposit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fixed deposit' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;
    const { action } = await request.json();

    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!fixedDeposit) {
      return NextResponse.json(
        { error: 'Fixed deposit not found' },
        { status: 404 }
      );
    }

    if (action === 'withdraw' && fixedDeposit.status === 'ACTIVE') {
      // Check if matured
      const now = new Date();
      if (now < fixedDeposit.maturityDate) {
        return NextResponse.json(
          { error: 'Fixed deposit has not matured yet' },
          { status: 400 }
        );
      }

      // Calculate final amount with interest
      const daysElapsed = Math.floor((now.getTime() - fixedDeposit.createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const interestEarned = Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * (daysElapsed / 365);
      const totalAmount = Number(fixedDeposit.amount) + interestEarned;

      // Update fixed deposit status
      await prisma.fixedDeposit.update({
        where: { id: id },
        data: { status: 'WITHDRAWN' }
      });

      // Add to account balance
      await prisma.account.update({
        where: { id: fixedDeposit.accountId },
        data: {
          balance: {
            increment: totalAmount
          }
        }
      });

      // Create transaction record
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: fixedDeposit.accountId,
          type: 'CREDIT',
          amount: totalAmount,
          description: `Fixed deposit withdrawal - ${fixedDeposit.amount} + ${interestEarned.toFixed(2)} interest`,
          status: 'COMPLETED'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Fixed deposit withdrawn successfully',
        amount: totalAmount.toFixed(2)
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating fixed deposit:', error);
    return NextResponse.json(
      { error: 'Failed to update fixed deposit' },
      { status: 500 }
    );
  }
});
