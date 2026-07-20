import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, assertMakerChecker } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';
import { auditAdminAction } from '@/lib/regulatory/audit-log';
import { recordSettlement } from '@/lib/regulatory/settlement-ledger';

export const POST = requireSuperAdmin(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const admin = (request as any).admin;
    const { id } = await params;
    const { action, notes } = await request.json();

    const entry = await prisma.pendingManualEntry.findUnique({ where: { id } });
    if (!entry) {
      return NextResponse.json({ error: 'Pending entry not found' }, { status: 404 });
    }

    if (entry.status !== 'PENDING_APPROVAL') {
      return NextResponse.json({ error: 'Entry already processed' }, { status: 400 });
    }

    if (action === 'REJECT') {
      const rejected = await prisma.pendingManualEntry.update({
        where: { id },
        data: { status: 'REJECTED', approvedBy: admin.username, approvedAt: new Date() },
      });
      await auditAdminAction(request, admin, 'MANUAL_ENTRY_REJECTED', 'PendingManualEntry', id, null, rejected);
      return NextResponse.json({ success: true, entry: rejected });
    }

    if (action !== 'APPROVE') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!assertMakerChecker(entry.createdBy, admin.username)) {
      return NextResponse.json(
        { error: 'Maker-checker violation: approver cannot be the same as creator' },
        { status: 403 }
      );
    }

    const payload = entry.payload as {
      userId: string;
      accountId: string;
      amount: number;
      type: string;
      description: string;
      adminNote?: string;
    };

    let transaction;
    const ref = `ADMIN-${Date.now()}`;
    const desc = `Admin Manual Entry: ${payload.description}${payload.adminNote ? ` (${payload.adminNote})` : ''}`;

    if (payload.type === 'CREDIT') {
      transaction = await corporateBankService.processCreditTransaction(
        payload.userId,
        payload.accountId,
        payload.amount,
        desc,
        ref
      );
    } else {
      transaction = await corporateBankService.processDebitTransaction(
        payload.userId,
        payload.accountId,
        payload.amount,
        desc,
        ref
      );
    }

    await recordSettlement({
      type: 'MANUAL',
      amount: payload.amount,
      transactionId: transaction.id,
      reference: ref,
      status: 'SETTLED',
      createdBy: admin.username,
      metadata: { pendingEntryId: id, approvedBy: admin.username },
      lines:
        payload.type === 'CREDIT'
          ? [
              { accountCode: '1100', debit: payload.amount, credit: 0, description: desc },
              { accountCode: '2100', debit: 0, credit: payload.amount, description: desc },
            ]
          : [
              { accountCode: '2100', debit: payload.amount, credit: 0, description: desc },
              { accountCode: '1100', debit: 0, credit: payload.amount, description: desc },
            ],
    });

    const updated = await prisma.pendingManualEntry.update({
      where: { id },
      data: {
        status: 'EXECUTED',
        approvedBy: admin.username,
        approvedAt: new Date(),
        executedAt: new Date(),
        notes: notes || entry.notes,
      },
    });

    await auditAdminAction(
      request,
      admin,
      'MANUAL_ENTRY_APPROVED',
      'PendingManualEntry',
      id,
      entry,
      { transactionId: transaction.id, approvedBy: admin.username }
    );

    return NextResponse.json({
      success: true,
      entry: updated,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        reference: transaction.reference,
      },
    });
  } catch (error: unknown) {
    console.error('Manual entry approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});
