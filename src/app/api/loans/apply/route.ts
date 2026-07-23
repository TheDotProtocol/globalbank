import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { assertUserCanTransact } from '@/lib/regulatory/compliance-guard';
import { randomUUID } from 'crypto';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const applications = await prisma.loanApplication.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
      include: { product: true, loan: true },
    });
    return NextResponse.json({ success: true, applications });
  } catch (error) {
    console.error('Loan applications list error:', error);
    return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { productId, accountId, requestedAmount, termMonths, purpose } = await request.json();

    const eligibility = await assertUserCanTransact(user.id);
    if (!eligibility.ok) {
      return NextResponse.json({ error: eligibility.reason, code: eligibility.code }, { status: 403 });
    }

    const product = await prisma.loanProduct.findFirst({
      where: { id: productId, isActive: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Loan product not found' }, { status: 404 });
    }

    const amount = Number(requestedAmount);
    if (amount < Number(product.minAmount) || amount > Number(product.maxAmount)) {
      return NextResponse.json(
        { error: `Amount must be between ${product.minAmount} and ${product.maxAmount}` },
        { status: 400 }
      );
    }

    if (termMonths < product.minTermMonths || termMonths > product.maxTermMonths) {
      return NextResponse.json({ error: 'Term out of product range' }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isActive: true },
    });
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const reference = `LAPP-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;

    const application = await prisma.loanApplication.create({
      data: {
        reference,
        userId: user.id,
        accountId,
        productId,
        requestedAmount: amount,
        termMonths,
        purpose: purpose ?? null,
        status: 'SUBMITTED',
      },
      include: { product: true },
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error('Loan application error:', error);
    return NextResponse.json({ error: 'Failed to submit loan application' }, { status: 500 });
  }
});
