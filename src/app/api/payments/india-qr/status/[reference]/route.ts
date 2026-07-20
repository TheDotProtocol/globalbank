import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { tryDemoAutoCompleteInboundPayment } from '@/lib/payment-rails/inbound-credit';
import { getDemoAutoCompleteMs, isDemoPaymentRail } from '@/lib/payment-rails/config';

export const GET = requireAuth(async (
  request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) => {
  try {
    const { reference } = await params;
    const user = (request as any).user;

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        reference,
        userId: user.id,
        paymentMethod: 'INDIA_UPI',
      },
      include: {
        account: {
          select: { id: true, accountNumber: true, accountType: true, balance: true },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    const demoResult = await tryDemoAutoCompleteInboundPayment(payment, 'IN');

    if (demoResult.expired) {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: 'EXPIRED',
          amount: payment.amount,
          reference: payment.reference,
          message: 'Payment expired. Generate a new QR code.',
        },
      });
    }

    if (demoResult.completed) {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: 'COMPLETED',
          amount: payment.amount,
          reference: payment.reference,
          completedAt: new Date(),
          transactionId: demoResult.transactionId,
          message: demoResult.message,
        },
      });
    }

    const remainingMs = isDemoPaymentRail()
      ? Math.max(0, getDemoAutoCompleteMs() - (Date.now() - payment.createdAt.getTime()))
      : null;

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.reference,
        createdAt: payment.createdAt,
        demoMode: isDemoPaymentRail(),
        demoAutoCompleteInMs: remainingMs,
        message:
          payment.status === 'COMPLETED'
            ? 'Payment completed'
            : isDemoPaymentRail()
              ? demoResult.message || 'Payment pending — demo auto-complete in progress'
              : 'Payment pending — awaiting bank confirmation',
      },
    });
  } catch (error: unknown) {
    console.error('India UPI status error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
});
