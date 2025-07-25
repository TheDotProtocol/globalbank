import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: { reference: string } }) => {
  try {
    const { reference } = params;
    const user = (request as any).user;

    console.log('🔍 Checking Thai QR payment status:', { reference, userId: user.id });

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        reference: reference,
        userId: user.id,
        paymentMethod: 'THAI_QR'
      },
      include: {
        account: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            balance: true
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment is still pending and has expired
    if (payment.status === 'PENDING') {
      const expiresAt = new Date(payment.createdAt.getTime() + 30 * 60 * 1000); // 30 minutes
      if (new Date() > expiresAt) {
        // Update payment status to expired
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'EXPIRED' }
        });
        
        return NextResponse.json({
          success: true,
          payment: {
            id: payment.id,
            status: 'EXPIRED',
            amount: payment.amount,
            reference: payment.reference,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
            message: 'Payment has expired. Please generate a new QR code.'
          }
        });
      }
    }

    // For demo purposes, simulate payment completion after 2 minutes
    // In production, this would check the actual K Bank API
    if (payment.status === 'PENDING') {
      const timeSinceCreation = Date.now() - payment.createdAt.getTime();
      const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds
      
      if (timeSinceCreation > twoMinutes) {
        // Simulate payment completion
        console.log('🎯 Simulating payment completion for demo purposes');
        
        try {
          // Update payment status to completed
          await prisma.payment.update({
            where: { id: payment.id },
            data: { 
              status: 'COMPLETED',
              completedAt: new Date()
            }
          });

          // Add money to user account using corporate bank service
          const transaction = await corporateBankService.processCreditTransaction(
            user.id,
            payment.accountId,
            payment.amount.toNumber(),
            `Thai QR Payment - ${payment.reference}`,
            payment.reference
          );

          console.log('✅ Thai QR payment completed:', {
            paymentId: payment.id,
            transactionId: transaction.id,
            amount: payment.amount
          });

          return NextResponse.json({
            success: true,
            payment: {
              id: payment.id,
              status: 'COMPLETED',
              amount: payment.amount,
              reference: payment.reference,
              createdAt: payment.createdAt,
              completedAt: new Date(),
              transactionId: transaction.id,
              message: 'Payment completed successfully! Money has been added to your account.'
            }
          });

        } catch (error) {
          console.error('❌ Error completing payment:', error);
          return NextResponse.json({
            success: true,
            payment: {
              id: payment.id,
              status: 'PENDING',
              amount: payment.amount,
              reference: payment.reference,
              createdAt: payment.createdAt,
              updatedAt: payment.updatedAt,
              message: 'Payment is being processed. Please wait a moment and check again.'
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.reference,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        message: payment.status === 'COMPLETED' 
          ? 'Payment completed successfully!' 
          : payment.status === 'EXPIRED'
          ? 'Payment has expired. Please generate a new QR code.'
          : 'Payment is pending. Please complete the transfer using the QR code.'
      }
    });

  } catch (error: any) {
    console.error('❌ Check payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
}); 