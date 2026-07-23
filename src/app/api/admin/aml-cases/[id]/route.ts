import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { updateAmlCaseStatus } from '@/lib/aml/aml-cases';
import { prisma } from '@/lib/prisma';
import type { AmlCaseStatus } from '@prisma/client';

export const PATCH = requireComplianceAccess(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const { status, resolution, assignee } = await request.json();

    const updated = await updateAmlCaseStatus(id, status as AmlCaseStatus, resolution, assignee);

    if (status === 'SAR_FILED') {
      const amlCase = await prisma.amlCase.findUnique({ where: { id } });
      if (amlCase?.userId) {
        await prisma.regulatoryReport.create({
          data: {
            reportType: 'SAR',
            jurisdiction: 'BVI',
            status: 'SUBMITTED',
            reference: `SAR-${Date.now()}`,
            userId: amlCase.userId,
            filedBy: assignee ?? 'COMPLIANCE',
            filedAt: new Date(),
            content: {
              amlCaseId: id,
              resolution,
              transactionId: amlCase.transactionId,
            },
          },
        });
      }
    }

    return NextResponse.json({ success: true, amlCase: updated });
  } catch (error) {
    console.error('AML case update error:', error);
    return NextResponse.json({ error: 'Failed to update AML case' }, { status: 500 });
  }
});
