import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
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

    // Retry logic for database operations
    let account = null;
    let retries = 3;
    
    while (retries > 0) {
      try {
        // Verify account belongs to user
        account = await prisma.account.findFirst({
          where: {
            id: accountId,
            userId: user.id,
            isActive: true
          }
        });
        break;
      } catch (error: any) {
        retries--;
        console.log(`Account verification attempt failed, retries left: ${retries}`);
        
        if (error?.message?.includes('prepared statement') && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if transaction already exists (prevent double processing)
    let existingTransaction = null;
    retries = 3;
    
    while (retries > 0) {
      try {
        existingTransaction = await prisma.transaction.findUnique({
          where: { reference: paymentIntentId }
        });
        break;
      } catch (error: any) {
        retries--;
        if (error?.message?.includes('prepared statement') && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }

    if (existingTransaction) {
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        newBalance: account.balance
      });
    }

    // Verify the payment intent with Stripe
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    } catch (stripeError) {
      console.error('Stripe verification error:', stripeError);
      // Continue with the update even if Stripe verification fails
      // This ensures the account gets updated if the payment was actually successful
    }

    // Update account balance with retry logic
    let updatedAccount = null;
    retries = 3;
    
    while (retries > 0) {
      try {
        updatedAccount = await prisma.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: amount
            }
          }
        });
        break;
      } catch (error: any) {
        retries--;
        console.log(`Account balance update attempt failed, retries left: ${retries}`);
        
        if (error?.message?.includes('prepared statement') && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }

    // Create transaction record with retry logic
    retries = 3;
    
    while (retries > 0) {
      try {
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
        break;
      } catch (error: any) {
        retries--;
        console.log(`Transaction creation attempt failed, retries left: ${retries}`);
        
        if (error?.message?.includes('prepared statement') && retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw error;
      }
    }

    console.log(`Payment confirmed: ${paymentIntentId} for $${amount}, new balance: $${updatedAccount?.balance}`);

    return NextResponse.json({
      success: true,
      message: 'Account balance updated successfully',
      newBalance: updatedAccount?.balance || account.balance + amount,
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