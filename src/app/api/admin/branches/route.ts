import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

export const GET = requireAdminAuth(async () => {
  try {
    const branches = await prisma.branch.findMany({
      where: { isActive: true },
      orderBy: [{ isHQ: 'desc' }, { country: 'asc' }],
      include: {
        _count: { select: { users: true, transactions: true } },
      },
    });

    return NextResponse.json({
      branches: branches.map((b) => ({
        id: b.id,
        name: b.name,
        country: b.country,
        city: b.city,
        address: b.address,
        region: b.region,
        isHQ: b.isHQ,
        userCount: b._count.users,
        transactionCount: b._count.transactions,
      })),
    });
  } catch (error) {
    console.error('Branches error:', error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
});
