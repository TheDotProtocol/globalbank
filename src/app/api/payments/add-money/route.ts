import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { amount, accountId, paymentMethodId } = await request.json();

    // Validate input
    if (!amount || !accountId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { user: true }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      metadata: {
        accountId,
        userId: account.userId,
        type: 'deposit'
      }
    });

    if (paymentIntent.status === 'succeeded') {
      // Update account balance
      await prisma.account.update({
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
          userId: account.userId,
          accountId,
          type: 'DEPOSIT',
          amount,
          description: 'Card deposit',
          status: 'COMPLETED',
          reference: paymentIntent.id
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Payment successful',
        paymentIntent: paymentIntent.id,
        newBalance: account.balance + amount
      });
    } else {
      return NextResponse.json(
        { error: 'Payment failed', status: paymentIntent.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Add money error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
} 