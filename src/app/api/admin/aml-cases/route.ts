import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { listAmlCases } from '@/lib/aml/aml-cases';
import type { AmlCaseStatus } from '@prisma/client';

export const GET = requireComplianceAccess(async (request: NextRequest) => {
  try {
    const statusParam = request.nextUrl.searchParams.get('status');
    const cases = await listAmlCases({
      status:
        statusParam && statusParam !== 'all' ? (statusParam as AmlCaseStatus) : undefined,
      limit: 100,
    });

    const stats = {
      open: cases.filter((c) => c.status === 'OPEN').length,
      investigating: cases.filter((c) => c.status === 'INVESTIGATING').length,
      escalated: cases.filter((c) => c.status === 'ESCALATED').length,
      sanctions: cases.filter((c) => c.sanctionsHit).length,
    };

    return NextResponse.json({ success: true, cases, stats });
  } catch (error) {
    console.error('AML cases list error:', error);
    return NextResponse.json({ error: 'Failed to load AML cases' }, { status: 500 });
  }
});
