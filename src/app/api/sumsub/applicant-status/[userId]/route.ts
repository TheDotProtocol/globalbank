import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { syncUserKycFromSumsub } from '@/lib/sumsub-sync';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ userId: string }> }) => {
  try {
    const authUser = (request as any).user;
    const { userId } = await params;

    if (userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { kycStatus, applicant } = await syncUserKycFromSumsub(userId);

    const reviewAnswer = applicant?.review?.reviewResult?.reviewAnswer ?? null;
    const reviewStatus = applicant?.review?.reviewStatus ?? null;

    return NextResponse.json({
      userId,
      status: kycStatus,
      sumsubApplicantId: applicant?.id ?? null,
      reviewStatus,
      reviewAnswer,
      message:
        kycStatus === 'VERIFIED'
          ? 'KYC approved by Sumsub'
          : kycStatus === 'REJECTED'
            ? 'KYC rejected by Sumsub'
            : 'KYC verification in progress',
      applicant: applicant
        ? {
            id: applicant.id,
            reviewStatus: applicant.review?.reviewStatus,
            reviewAnswer: applicant.review?.reviewResult?.reviewAnswer,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error('Error fetching applicant status:', error);
    const err = error as Error & { details?: unknown };
    return NextResponse.json(
      {
        error: 'Failed to fetch applicant status from Sumsub',
        details: err.message,
        sumsub: err.details,
      },
      { status: 500 }
    );
  }
});
