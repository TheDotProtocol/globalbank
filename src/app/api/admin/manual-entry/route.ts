import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, assertMakerChecker } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { auditAdminAction } from '@/lib/regulatory/audit-log';

export const POST = requireSuperAdmin(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { userId, accountId, amount, type, description, adminNote } = await request.json();

    if (!userId || !accountId || !amount || !type || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validTypes = ['CREDIT', 'DEBIT'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
    }

    const transactionAmount = parseFloat(amount);
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found or inactive' }, { status: 404 });
    }

    const pending = await prisma.pendingManualEntry.create({
      data: {
        createdBy: admin.username,
        entryType: type,
        payload: {
          userId,
          accountId,
          amount: transactionAmount,
          type,
          description,
          adminNote: adminNote || null,
        },
        notes: adminNote || null,
      },
    });

    await auditAdminAction(
      request,
      admin,
      'MANUAL_ENTRY_REQUESTED',
      'PendingManualEntry',
      pending.id,
      null,
      { type, amount: transactionAmount, accountId, userId }
    );

    return NextResponse.json({
      success: true,
      message: 'Manual entry submitted for maker-checker approval',
      pendingEntry: {
        id: pending.id,
        status: pending.status,
        createdBy: pending.createdBy,
        createdAt: pending.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error('Admin manual entry error:', error);
    return NextResponse.json(
      { error: 'Failed to submit manual entry', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});
