import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { kycStatus: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: user.kycStatus,
      userId: params.userId
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC status' },
      { status: 500 }
    );
  }
} 