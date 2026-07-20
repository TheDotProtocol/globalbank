import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { generateAccountNumber } from '@/lib/account-number';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { accountType, initialBalance = 0 } = await request.json();

    if (!accountType) {
      return NextResponse.json({ error: 'Account type is required' }, { status: 400 });
    }

    if (user.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'KYC verification required before opening accounts' },
        { status: 403 }
      );
    }

    const accountNumber = generateAccountNumber();

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber,
        accountType,
        balance: initialBalance,
        currency: 'USD',
      },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
