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
      // Create payment intent for card payments
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency,
        payment_method_types: ['card'],
        capture_method: 'automatic',
        confirm: false,
        metadata: {
          userId: user.id,
          accountId: account.id,
          type: type,
          paymentMethod: 'card'
        },
        description: `${type === 'deposit' ? 'Account Deposit' : 'Account Withdrawal'} - ${account.accountNumber}`,
        setup_future_usage: 'off_session',
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        requiresAction: paymentIntent.status === 'requires_action'
      });
    } else if (paymentMethod === 'bank_transfer') {
      // Create payment intent for bank transfers
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
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
        accountNumber: '1234567890',
        routingNumber: '021000021',
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
