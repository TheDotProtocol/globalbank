import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// Initialize Stripe with proper error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Handle webhook events
export const POST = async (request: NextRequest) => {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

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
      
      case 'payment_intent.requires_action':
        const requiresActionPayment = event.data.object as Stripe.PaymentIntent;
        await handlePaymentRequiresAction(requiresActionPayment);
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
  const { userId, accountId, type, paymentMethod } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100;

  try {
    // Update account balance
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: type === 'deposit' ? amount : -amount
        }
      }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: type === 'deposit' ? 'CREDIT' : 'DEBIT',
        amount,
        description: `Successful ${type} via ${paymentMethod}`,
        status: 'COMPLETED',
        reference: paymentIntent.id
      }
    });

    console.log(`Payment succeeded: ${paymentIntent.id} via ${paymentMethod}`);
  } catch (error) {
    console.error('Error processing payment success:', error);
  }
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { userId, accountId, type, paymentMethod } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100;

  try {
    // Create failed transaction record
    await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: type === 'deposit' ? 'CREDIT' : 'DEBIT',
        amount,
        description: `Failed ${type} via ${paymentMethod}`,
        status: 'FAILED',
        reference: paymentIntent.id
      }
    });

    console.log(`Payment failed: ${paymentIntent.id} via ${paymentMethod}`);
  } catch (error) {
    console.error('Error processing payment failure:', error);
  }
}

async function handlePaymentRequiresAction(paymentIntent: Stripe.PaymentIntent) {
  const { userId, accountId, type, paymentMethod } = paymentIntent.metadata;
  const amount = paymentIntent.amount / 100;

  try {
    // Create pending transaction record
    await prisma.transaction.create({
      data: {
        accountId,
        userId,
        type: type === 'deposit' ? 'CREDIT' : 'DEBIT',
        amount,
        description: `Pending ${type} via ${paymentMethod} - Requires Action`,
        status: 'PENDING',
        reference: paymentIntent.id
      }
    });

    console.log(`Payment requires action: ${paymentIntent.id} via ${paymentMethod}`);
  } catch (error) {
    console.error('Error processing payment requires action:', error);
  }
} 