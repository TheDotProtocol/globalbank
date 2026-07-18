import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireComplianceAccess } from '@/lib/admin-auth';

export const POST = requireComplianceAccess(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const admin = (request as any).admin;
    const { id } = await params;
    const { action, notes } = await request.json();

    const validActions = ['APPROVE', 'HOLD', 'REJECT', 'REPORT', 'ESCALATE'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const statusMap: Record<string, string> = {
      APPROVE: 'APPROVED',
      HOLD: 'ON_HOLD',
      REJECT: 'REJECTED',
      REPORT: 'REPORTED',
      ESCALATE: 'UNDER_REVIEW',
    };

    const updated = await prisma.$transaction(async (tx) => {
      await tx.complianceReview.create({
        data: {
          transactionId: id,
          action: action as any,
          notes: notes || null,
          reviewedBy: admin.username,
          reviewerRole: admin.role,
        },
      });

      return tx.transaction.update({
        where: { id },
        data: {
          complianceStatus: statusMap[action] as any,
          reviewedAt: new Date(),
          reviewedBy: admin.username,
          reviewNotes: notes || null,
          status: action === 'REJECT' ? 'FAILED' : transaction.status,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${action.toLowerCase()}d`,
      transaction: {
        id: updated.id,
        complianceStatus: updated.complianceStatus,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt,
      },
    });
  } catch (error) {
    console.error('Compliance review error:', error);
    return NextResponse.json({ error: 'Failed to process review' }, { status: 500 });
  }
});

export const PATCH = requireComplianceAccess(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const admin = (request as any).admin;
    const { id } = await params;
    const { flagReason } = await request.json();

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        complianceStatus: 'FLAGGED',
        complianceFlag: 'MANUAL_FLAG',
        flagReason: flagReason || 'Manually flagged by admin',
        flaggedAt: new Date(),
        flaggedBy: admin.username,
        riskScore: 60,
      },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to flag transaction' }, { status: 500 });
  }
});
