import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    const user = (request as any).user;
    const { userId } = await params;

    // This is a placeholder - in production, you would call Sumsub API
    // to get the actual applicant status
    return NextResponse.json({
      userId: userId,
      status: 'PENDING', // Placeholder status
      message: 'KYC status check is managed by Sumsub'
    });

  } catch (error) {
    console.error('Error fetching applicant status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applicant status' },
      { status: 500 }
    );
  }
}); 