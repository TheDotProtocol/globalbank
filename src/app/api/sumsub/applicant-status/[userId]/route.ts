import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        kycStatus: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get applicant status from Sumsub
    const response = await fetch(
      `${process.env.SUMSUB_BASE_URL}/resources/applicants/${user.id}/status`, 
      {
        method: 'GET',
        headers: {
          'X-App-Token': process.env.SUMSUB_APP_TOKEN!,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If applicant doesn't exist in Sumsub, return current status
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          status: user.kycStatus,
          message: 'Applicant not yet created in Sumsub'
        });
      }

      const errorData = await response.json();
      console.error('Sumsub API error:', errorData);
      return NextResponse.json({ 
        error: 'Failed to get applicant status from Sumsub',
        details: errorData 
      }, { status: response.status });
    }

    const statusData = await response.json();

    // Update user status in database if it changed
    if (statusData.reviewResult?.reviewAnswer !== user.kycStatus) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          kycStatus: statusData.reviewResult?.reviewAnswer || 'PENDING'
        }
      });
    }

    return NextResponse.json({
      success: true,
      status: statusData.reviewResult?.reviewAnswer || 'PENDING',
      reviewResult: statusData.reviewResult,
      applicantData: statusData
    });

  } catch (error) {
    console.error('Error getting Sumsub applicant status:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 