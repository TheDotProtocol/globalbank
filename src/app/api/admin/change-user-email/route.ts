import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { currentEmail, newEmail, adminPassword } = await request.json();

    // Simple admin authentication (in production, use proper admin auth)
    if (adminPassword !== process.env.ADMIN_PASSWORD || !process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate input
    if (!currentEmail || !newEmail) {
      return NextResponse.json(
        { error: 'Current email and new email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if new email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email address is already registered' },
        { status: 409 }
      );
    }

    // Find and update user
    const user = await prisma.user.findUnique({
      where: { email: currentEmail.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user's email
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: newEmail.toLowerCase(),
        emailVerified: true,
        emailVerifiedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        emailVerified: true
      }
    });

    console.log(`✅ Admin email change: ${currentEmail} → ${newEmail}`);

    return NextResponse.json({
      message: 'Email changed successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Admin email change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 