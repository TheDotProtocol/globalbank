import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Create dispute
export const POST = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const transactionId = params.id;
    const { reason } = await request.json();

    // Validate input
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: 'Dispute reason is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Find transaction and verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or not accessible' },
        { status: 404 }
      );
    }

    // Check if transaction can be disputed
    if (transaction.isDisputed) {
      return NextResponse.json(
        { error: 'Transaction is already disputed' },
        { status: 400 }
      );
    }

    // Check if transaction is recent enough (within 60 days)
    const daysSinceTransaction = Math.floor((Date.now() - transaction.createdAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceTransaction > 60) {
      return NextResponse.json(
        { error: 'Transactions can only be disputed within 60 days' },
        { status: 400 }
      );
    }

    // Update transaction with dispute
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        isDisputed: true,
        disputeReason: reason,
        disputeStatus: 'PENDING',
        disputeCreatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Dispute created successfully',
      dispute: {
        id: updatedTransaction.id,
        isDisputed: updatedTransaction.isDisputed,
        disputeReason: updatedTransaction.disputeReason,
        disputeStatus: updatedTransaction.disputeStatus,
        disputeCreatedAt: updatedTransaction.disputeCreatedAt
      }
    });
  } catch (error) {
    console.error('Create dispute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Get dispute status
export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const transactionId = params.id;

    // Find transaction and verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found or not accessible' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dispute: {
        isDisputed: transaction.isDisputed,
        disputeReason: transaction.disputeReason,
        disputeStatus: transaction.disputeStatus,
        disputeCreatedAt: transaction.disputeCreatedAt,
        disputeResolvedAt: transaction.disputeResolvedAt,
        disputeResolution: transaction.disputeResolution
      }
    });
  } catch (error) {
    console.error('Get dispute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 