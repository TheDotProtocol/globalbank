import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const authUser = (request as any).user;
    const { userId, levelName = 'basic' } = await request.json();

    if (userId && userId !== authUser.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const targetUserId = userId || authUser.id;

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create applicant in Sumsub
    const applicantData = {
      externalUserId: user.id,
      email: user.email,
      phone: user.phone || '',
      info: {
        firstName: user.firstName,
        lastName: user.lastName,
        country: 'US', // Default country
        city: '', // Default empty city
      },
      levelName: levelName,
    };

    const response = await fetch(`${process.env.SUMSUB_BASE_URL}/resources/applicants`, {
      method: 'POST',
      headers: {
        'X-App-Token': process.env.SUMSUB_APP_TOKEN!,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(applicantData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Sumsub API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to create applicant in Sumsub',
        details: errorData 
      }, { status: response.status });
    }

    const applicant = await response.json();

    // Update user with Sumsub applicant ID
    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        kycStatus: 'PENDING',
        sumsubApplicantId: applicant.id,
      },
    });

    return NextResponse.json({
      success: true,
      applicantId: applicant.id,
      applicant: applicant,
    });
  } catch (error) {
    console.error('Error creating Sumsub applicant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});