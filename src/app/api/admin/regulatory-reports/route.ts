import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { submitRegulatoryReport } from '@/lib/regulatory/regulatory-reports';
import { auditAdminAction } from '@/lib/regulatory/audit-log';

export const GET = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const jurisdiction = searchParams.get('jurisdiction');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);

    const where: Record<string, unknown> = {};
    if (jurisdiction) where.jurisdiction = jurisdiction;
    if (status) where.status = status;

    const reports = await prisma.regulatoryReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch regulatory reports' }, { status: 500 });
  }
});

export const PATCH = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { reportId, action } = await request.json();

    if (!reportId || action !== 'SUBMIT') {
      return NextResponse.json({ error: 'reportId and action SUBMIT required' }, { status: 400 });
    }

    const report = await submitRegulatoryReport(reportId, admin.username);

    await auditAdminAction(
      request,
      admin,
      'REGULATORY_REPORT_SUBMITTED',
      'RegulatoryReport',
      reportId,
      null,
      report
    );

    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
});
