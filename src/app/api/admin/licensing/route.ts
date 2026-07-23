import { NextRequest, NextResponse } from 'next/server';
import { requireComplianceAccess } from '@/lib/admin-auth';
import { getLicensingOverview } from '@/lib/regulatory/governance';

export const GET = requireComplianceAccess(async () => {
  try {
    const overview = await getLicensingOverview();
    return NextResponse.json({ success: true, ...overview });
  } catch (error) {
    console.error('Licensing overview error:', error);
    return NextResponse.json({ error: 'Failed to load licensing data' }, { status: 500 });
  }
});
