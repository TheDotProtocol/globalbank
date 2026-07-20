import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { getSettlementSummary } from '@/lib/regulatory/settlement-ledger';
import { prisma } from '@/lib/prisma';

export const GET = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    const where = status ? { status: status as any } : {};

    const [settlements, summary] = await Promise.all([
      prisma.settlementRecord.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: {
          entries: {
            include: { ledgerAccount: { select: { code: true, name: true } } },
          },
        },
      }),
      getSettlementSummary(),
    ]);

    return NextResponse.json({ settlements, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settlements' }, { status: 500 });
  }
});
