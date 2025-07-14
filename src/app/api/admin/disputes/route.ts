import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// List all disputes (admin only)
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    // TODO: Add admin role check
    // For now, we'll allow any authenticated user to view disputes
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: any = {
      isDisputed: true
    };

    if (status && status !== 'ALL') {
      where.disputeStatus = status;
    }

    // Get disputed transactions
    const disputes = await prisma.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: { disputeCreatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    // Get total count
    const totalCount = await prisma.transaction.count({ where });

    return NextResponse.json({
      disputes: disputes.map(dispute => ({
        id: dispute.id,
        type: dispute.type,
        amount: dispute.amount,
        description: dispute.description,
        reference: dispute.reference,
        createdAt: dispute.createdAt,
        isDisputed: dispute.isDisputed,
        disputeReason: dispute.disputeReason,
        disputeStatus: dispute.disputeStatus,
        disputeCreatedAt: dispute.disputeCreatedAt,
        disputeResolvedAt: dispute.disputeResolvedAt,
        disputeResolution: dispute.disputeResolution,
        user: {
          id: dispute.user.id,
          name: `${dispute.user.firstName} ${dispute.user.lastName}`,
          email: dispute.user.email
        },
        account: {
          accountNumber: dispute.account.accountNumber,
          accountType: dispute.account.accountType
        }
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get disputes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Resolve dispute (admin only)
export const PUT = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { transactionId, status, resolution } = await request.json();

    // Validate input
    if (!transactionId || !status || !resolution) {
      return NextResponse.json(
        { error: 'Transaction ID, status, and resolution are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid dispute status' },
        { status: 400 }
      );
    }

    // TODO: Add admin role check
    // For now, we'll allow any authenticated user to resolve disputes

    // Find disputed transaction
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        isDisputed: true
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Disputed transaction not found' },
        { status: 404 }
      );
    }

    // Update dispute status
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        disputeStatus: status,
        disputeResolution: resolution,
        disputeResolvedAt: new Date()
      }
    });

    return NextResponse.json({
      message: 'Dispute resolved successfully',
      dispute: {
        id: updatedTransaction.id,
        disputeStatus: updatedTransaction.disputeStatus,
        disputeResolution: updatedTransaction.disputeResolution,
        disputeResolvedAt: updatedTransaction.disputeResolvedAt
      }
    });
  } catch (error) {
    console.error('Resolve dispute error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 