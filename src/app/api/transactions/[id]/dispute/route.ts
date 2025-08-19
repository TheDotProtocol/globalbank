import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json(
        { error: 'Dispute reason is required' },
        { status: 400 }
      );
    }

    // Check if transaction exists and belongs to user
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction with dispute information
    const updatedTransaction = await prisma.transaction.update({
      where: { id: id },
      data: {
        isDisputed: true,
        disputeReason: reason,
        disputeStatus: 'PENDING',
        disputeCreatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      transaction: updatedTransaction,
      message: 'Dispute filed successfully'
    });

  } catch (error) {
    console.error('Error filing dispute:', error);
    return NextResponse.json(
      { error: 'Failed to file dispute' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    // Get transaction with dispute information
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        isDisputed: true,
        disputeReason: true,
        disputeStatus: true,
        disputeCreatedAt: true,
        disputeResolvedAt: true,
        disputeResolution: true,
        createdAt: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      transaction
    });

  } catch (error) {
    console.error('Error fetching dispute:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dispute information' },
      { status: 500 }
    );
  }
}); 