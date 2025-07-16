import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { paymentIntentId, amount, accountId } = await request.json();

    if (!paymentIntentId || !amount || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if transaction already exists (prevent double processing)
    const existingTransaction = await prisma.transaction.findUnique({
      where: { reference: paymentIntentId }
    });

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        newBalance: account.balance
      });
    }

    // Update account balance
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: amount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        userId: user.id,
        accountId,
        type: 'CREDIT',
        amount,
        description: 'Account Deposit via Stripe',
        status: 'COMPLETED',
        reference: paymentIntentId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Account balance updated successfully',
      newBalance: updatedAccount.balance,
      transactionId: paymentIntentId
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}); 