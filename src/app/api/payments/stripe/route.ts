import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import Stripe from 'stripe';
import QRCode from 'qrcode';

// Initialize Stripe with proper error handling
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe payments will not work.');
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Create payment intent for deposit
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 }
      );
    }

    const user = (request as any).user;
    const { amount, currency = 'usd', type = 'deposit', accountId, paymentMethod = 'card' } = await request.json();

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

    if (paymentMethod === 'card') {
      // Create payment intent for card payments with 3D Secure support
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirm: false, // Don't confirm immediately, let frontend handle it
        metadata: {
          userId: user.id,
          accountId: account.id,
          type: type,
          paymentMethod: 'card'
        },
        description: `${type === 'deposit' ? 'Account Deposit' : 'Account Withdrawal'} - ${account.accountNumber}`,
        setup_future_usage: 'off_session',
        // Remove problematic payment_method_options that can cause authentication issues
        // Let Stripe handle 3D Secure automatically based on card type
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requiresAction: paymentIntent.status === 'requires_action'
      });
    } else if (paymentMethod === 'bank_transfer') {
      // Create payment intent for bank transfers
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency,
        payment_method_types: ['us_bank_account'],
        payment_method_data: {
          type: 'us_bank_account',
        },
        metadata: {
          userId: user.id,
          accountId: account.id,
          type: type,
          paymentMethod: 'bank_transfer'
        },
        description: `Bank Transfer - ${account.accountNumber}`,
      });

      // Generate transfer details
      const transferDetails = {
        accountNumber: '1234567890', // This would be your bank account number
        routingNumber: '021000021', // This would be your routing number
        amount: amount,
        reference: `GB${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        description: `Global Dot Bank Transfer - ${account.accountNumber}`,
        bankName: 'Global Dot Bank',
        accountName: 'Global Dot Bank Business Account'
      };

      // Generate QR code for bank transfer
      const qrCodeData = {
        type: 'bank_transfer',
        accountNumber: transferDetails.accountNumber,
        routingNumber: transferDetails.routingNumber,
        amount: transferDetails.amount,
        reference: transferDetails.reference,
        description: transferDetails.description,
        bankName: transferDetails.bankName
      };

      const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        qrCode: qrCodeUrl,
        transferDetails: transferDetails,
        requiresAction: false
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Stripe payment error:', error);
    return NextResponse.json(
      { error: 'Payment processing error' },
      { status: 500 }
    );
  }
});

// Handle webhook events - Changed from PUT to POST for Stripe compatibility
export async function PUT(request: NextRequest) {
  return handleWebhook(request);
}

// Add POST method for webhook handling
export async function POST(request: NextRequest) {
  return handleWebhook(request);
}

async function handleWebhook(request: NextRequest) {
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
}

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