import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia'
});

// Create payment intent for deposit
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { amount, currency = 'usd', type = 'deposit', accountId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get user's account
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: user.id,
        accountId: account.id,
        type: type
      },
      description: `${type === 'deposit' ? 'Account Deposit' : 'Account Withdrawal'} - ${account.accountNumber}`
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Stripe payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing error' },
      { status: 500 }
    );
  }
});

// Handle webhook events
export const PUT = async (request: NextRequest) => {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(failedPayment);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
};

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { userId, accountId, type } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100; // Convert from cents

  try {
    // Update account balance
    if (type === 'deposit') {
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
          accountId,
          userId,
          type: 'CREDIT',
          amount,
          description: 'Account Deposit via Stripe',
          status: 'COMPLETED',
          reference: paymentIntent.id
        }
      });
    }

    console.log(`Payment succeeded: ${paymentIntent.id} for ${amount}`);
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId, accountId, type } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100;

  try {
    // Create failed transaction record
    await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: type === 'deposit' ? 'CREDIT' : 'DEBIT',
        amount,
        description: `Failed ${type} via Stripe`,
        status: 'FAILED',
        reference: paymentIntent.id
      }
    });

    console.log(`Payment failed: ${paymentIntent.id}`);
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
} 