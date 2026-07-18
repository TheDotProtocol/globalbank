import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireComplianceAccess } from '@/lib/admin-auth';

export const GET = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');
    const country = searchParams.get('country');
    const city = searchParams.get('city');
    const status = searchParams.get('status') || 'FLAGGED';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (status !== 'all') where.complianceStatus = status;
    if (branchId) where.branchId = branchId;

    if (country || city) {
      where.branch = {};
      if (country) (where.branch as Record<string, unknown>).country = { contains: country, mode: 'insensitive' };
      if (city) (where.branch as Record<string, unknown>).city = { contains: city, mode: 'insensitive' };
    }

    const transactions = await prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          amount: true,
          description: true,
          reference: true,
          utr: true,
          status: true,
          complianceStatus: true,
          complianceFlag: true,
          flagReason: true,
          flaggedAt: true,
          flaggedBy: true,
          riskScore: true,
          reviewedAt: true,
          reviewedBy: true,
          reviewNotes: true,
          createdAt: true,
          account: { select: { accountNumber: true, accountType: true, currency: true } },
          branch: { select: { id: true, name: true, country: true, city: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        },
      });
    const totalCount = await prisma.transaction.count({ where });
    const stats = await prisma.transaction.groupBy({
      by: ['complianceStatus'],
      _count: { id: true },
    });

    return NextResponse.json({
      transactions: transactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amount: Number(tx.amount),
        description: tx.description,
        reference: tx.reference,
        utr: tx.utr,
        status: tx.status,
        complianceStatus: tx.complianceStatus,
        complianceFlag: tx.complianceFlag,
        flagReason: tx.flagReason,
        flaggedAt: tx.flaggedAt,
        flaggedBy: tx.flaggedBy,
        riskScore: tx.riskScore,
        reviewedAt: tx.reviewedAt,
        reviewedBy: tx.reviewedBy,
        reviewNotes: tx.reviewNotes,
        createdAt: tx.createdAt,
        account: tx.account,
        branch: tx.branch,
        user: tx.user,
        reviews: [],
      })),
      stats: stats.reduce((acc, s) => ({ ...acc, [s.complianceStatus]: s._count.id }), {}),
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    console.error('Compliance list error:', error);
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 });
  }
});
