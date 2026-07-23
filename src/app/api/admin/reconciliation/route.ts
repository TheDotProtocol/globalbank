import { NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { runLedgerReconciliation } from '@/lib/regulatory/post-journal';
import { prisma } from '@/lib/prisma';

export const GET = requireComplianceAccess(async () => {
  try {
    const latest = await prisma.ledgerReconciliation.findFirst({
      orderBy: { runDate: 'desc' },
    });

    const customerLiabilities = await prisma.account.aggregate({
      _sum: { balance: true },
      where: { isActive: true },
    });

    const safeguarded = await prisma.safeguardingAccount.aggregate({
      _sum: { balance: true },
      where: { purpose: 'CUSTOMER_FUNDS', isActive: true },
    });

    return NextResponse.json({
      success: true,
      latest,
      customerLiabilities: Number(customerLiabilities._sum.balance ?? 0),
      safeguardedAssets: Number(safeguarded._sum.balance ?? 0),
      coverageRatio:
        Number(customerLiabilities._sum.balance ?? 0) > 0
          ? Number(safeguarded._sum.balance ?? 0) / Number(customerLiabilities._sum.balance ?? 1)
          : null,
    });
  } catch (error) {
    console.error('Reconciliation read error:', error);
    return NextResponse.json({ error: 'Failed to load reconciliation' }, { status: 500 });
  }
});

export const POST = requireComplianceAccess(async () => {
  try {
    const result = await runLedgerReconciliation();
    return NextResponse.json({ success: true, reconciliation: result });
  } catch (error) {
    console.error('Reconciliation run error:', error);
    return NextResponse.json({ error: 'Reconciliation failed' }, { status: 500 });
  }
});
