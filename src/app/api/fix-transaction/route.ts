import { NextRequest, NextResponse } from 'next/server';
import { blockIfProductionDisabled } from '@/lib/regulatory/production-guard';

export const POST = async (request: NextRequest) => {
  const blocked = blockIfProductionDisabled();
  if (blocked) return blocked;

  return NextResponse.json(
    { error: 'This endpoint is disabled. Use admin manual entry with maker-checker approval.' },
    { status: 403 }
  );
};
