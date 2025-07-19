import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: id,
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
        { error: 'Fixed deposit not found' },
        { status: 404 }
      );
    }

    // Get account details separately
    const account = await prisma.account.findUnique({
      where: { id: fixedDeposit.accountId },
      select: {
        accountNumber: true,
        accountType: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
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

    const maturityAmount = Number(fixedDeposit.amount) + interestEarned;

    // Generate certificate data
    const certificate = {
      certificateNumber: `FD-${fixedDeposit.id.slice(-8).toUpperCase()}`,
      customerName: `${fixedDeposit.user.firstName} ${fixedDeposit.user.lastName}`,
      customerEmail: fixedDeposit.user.email,
      accountNumber: account.accountNumber,
      depositAmount: Number(fixedDeposit.amount),
      interestRate: Number(fixedDeposit.interestRate),
      duration: fixedDeposit.duration,
      startDate: fixedDeposit.createdAt,
      maturityDate: fixedDeposit.maturityDate,
      interestEarned: interestEarned.toFixed(2),
      maturityAmount: maturityAmount.toFixed(2),
      status: fixedDeposit.status,
      isMatured,
      daysElapsed,
      totalDays,
      generatedAt: new Date(),
      bankName: 'Global Dot Bank',
      bankAddress: 'Global HQ, USA',
      terms: [
        'This certificate is valid for the specified fixed deposit period.',
        'Early withdrawal may incur penalties.',
        'Interest is calculated on a daily basis.',
        'This is a digital certificate and serves as proof of deposit.'
      ]
    };

    return NextResponse.json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}); 