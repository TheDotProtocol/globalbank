import { NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { seedRegulatoryFoundation } from '@/lib/regulatory/governance';

export const GET = requireComplianceAccess(async () => {
  try {
    await seedRegulatoryFoundation();
    const accounts = await prisma.safeguardingAccount.findMany({
      where: { isActive: true },
      orderBy: { jurisdiction: 'asc' },
    });

    const customerTotal = await prisma.account.aggregate({
      _sum: { balance: true },
      where: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      accounts,
      totalCustomerLiabilities: Number(customerTotal._sum.balance ?? 0),
    });
  } catch (error) {
    console.error('Safeguarding read error:', error);
    return NextResponse.json({ error: 'Failed to load safeguarding data' }, { status: 500 });
  }
});
