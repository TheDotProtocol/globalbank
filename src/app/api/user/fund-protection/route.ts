import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async () => {
  try {
    const customerTotal = await prisma.account.aggregate({
      _sum: { balance: true },
      where: { isActive: true },
    });

    const safeguarding = await prisma.safeguardingAccount.findMany({
      where: { purpose: 'CUSTOMER_FUNDS', isActive: true },
      select: {
        jurisdiction: true,
        bankName: true,
        accountName: true,
        currency: true,
      },
    });

    return NextResponse.json({
      success: true,
      disclosure: {
        title: 'Customer fund safeguarding',
        summary:
          'Global Dot Bank is applying for full banking licenses in BVI and Labuan. Customer funds are intended to be held in segregated safeguarding accounts, separate from operational funds.',
        jurisdictions: ['BVI', 'Labuan'],
        expansionRoadmap: ['Thailand', 'India'],
        licenseStatus: 'Application in progress — not yet a licensed deposit-taking bank in all jurisdictions',
        safeguardingAccounts: safeguarding,
        totalDeposits: Number(customerTotal._sum.balance ?? 0),
        insuranceNote:
          'Deposit insurance coverage will be disclosed per jurisdiction upon license grant. Do not rely on FDIC or equivalent until formally enrolled.',
      },
    });
  } catch (error) {
    console.error('Fund protection disclosure error:', error);
    return NextResponse.json({ error: 'Failed to load disclosure' }, { status: 500 });
  }
});
