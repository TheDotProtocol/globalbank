import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createAccessToken, getDefaultLevelName } from '@/lib/sumsub-client';
import { prepareSumsubApplicant } from '@/lib/sumsub-sync';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const authUser = (request as any).user;
    const body = await request.json().catch(() => ({}));
    const levelName = body.levelName || getDefaultLevelName();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        kycStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prepareSumsubApplicant({
      externalUserId: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      levelName,
    });

    const { token, userId } = await createAccessToken(user.id, levelName);

    return NextResponse.json({
      success: true,
      token,
      userId,
      levelName,
    });
  } catch (error: unknown) {
    console.error('Sumsub access token error:', error);
    const err = error as Error & { details?: unknown };
    return NextResponse.json(
      {
        error: 'Failed to create Sumsub access token',
        details: err.message,
        sumsub: err.details,
      },
      { status: 500 }
    );
  }
});
