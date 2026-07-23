import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { seedRegulatoryFoundation } from '@/lib/regulatory/governance';

export const GET = requireAuth(async () => {
  try {
    await seedRegulatoryFoundation();
    const products = await prisma.loanProduct.findMany({
      where: { isActive: true },
      orderBy: { jurisdiction: 'asc' },
    });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Loan products error:', error);
    return NextResponse.json({ error: 'Failed to load loan products' }, { status: 500 });
  }
});
