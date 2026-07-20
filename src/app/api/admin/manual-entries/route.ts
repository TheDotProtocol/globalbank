import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export const GET = requireSuperAdmin(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'PENDING_APPROVAL';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    const entries = await prisma.pendingManualEntry.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ entries });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pending entries' }, { status: 500 });
  }
});
