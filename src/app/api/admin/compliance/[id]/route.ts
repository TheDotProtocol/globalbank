import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { auditAdminAction } from '@/lib/regulatory/audit-log';
import {
  createStrFromTransaction,
  inferJurisdictionFromBranchCountry,
} from '@/lib/regulatory/regulatory-reports';

export const POST = requireComplianceAccess(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const admin = (request as any).admin;
    const { id } = await params;
    const { action, notes, jurisdiction } = await request.json();

    const validActions = ['APPROVE', 'HOLD', 'REJECT', 'REPORT', 'ESCALATE'];
    if (!action || !validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { branch: { select: { country: true } } },
    });
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

    const beforeState = {
      complianceStatus: transaction.complianceStatus,
      status: transaction.status,
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

    let regulatoryReport = null;
    if (action === 'REPORT') {
      const j =
        jurisdiction ||
        inferJurisdictionFromBranchCountry(transaction.branch?.country);
      regulatoryReport = await createStrFromTransaction(
        id,
        admin.username,
        j as 'IN' | 'TH',
        notes
      );
    }

    await auditAdminAction(
      request,
      admin,
      `COMPLIANCE_${action}`,
      'Transaction',
      id,
      beforeState,
      {
        complianceStatus: updated.complianceStatus,
        regulatoryReportId: regulatoryReport?.id,
      },
      { notes }
    );

    return NextResponse.json({
      success: true,
      message: `Transaction ${action.toLowerCase()}d`,
      transaction: {
        id: updated.id,
        complianceStatus: updated.complianceStatus,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt,
      },
      regulatoryReport,
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

    const before = await prisma.transaction.findUnique({ where: { id } });
    if (!before) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        complianceStatus: 'FLAGGED',
        complianceFlag: 'MANUAL_FLAG',
        flagReason: flagReason || 'Manually flagged by compliance officer',
        flaggedAt: new Date(),
        flaggedBy: admin.username,
        riskScore: 60,
      },
    });

    await auditAdminAction(
      request,
      admin,
      'COMPLIANCE_MANUAL_FLAG',
      'Transaction',
      id,
      before,
      updated
    );

    return NextResponse.json({ success: true, transaction: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to flag transaction' }, { status: 500 });
  }
});
