import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, kycStatus } = await request.json();

    // Validate input
    if (!email || !kycStatus) {
      return NextResponse.json(
        { error: 'Email and KYC status are required' },
        { status: 400 }
      );
    }

    // Validate KYC status
    const validStatuses = ['PENDING', 'VERIFIED', 'REJECTED', 'REVIEW'];
    if (!validStatuses.includes(kycStatus)) {
      return NextResponse.json(
        { error: 'Invalid KYC status' },
        { status: 400 }
      );
    }

    // Update user KYC status
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        kycStatus: kycStatus as any,
        emailVerified: kycStatus === 'VERIFIED' ? true : false, // Auto-verify email when KYC is approved
        emailVerifiedAt: kycStatus === 'VERIFIED' ? new Date() : null
      },
      include: {
        accounts: true
      }
    });

    // Send notification email based on status
    try {
      if (kycStatus === 'VERIFIED') {
        // Send KYC approved email
        await fetch('/api/email/kyc-approved', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName
          }),
        });
      } else if (kycStatus === 'REJECTED') {
        // Send KYC rejected email
        await fetch('/api/email/kyc-rejected', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName
          }),
        });
      }
    } catch (emailError) {
      console.error('Failed to send KYC status email:', emailError);
      // Don't fail the update if email fails
    }

    return NextResponse.json({
      message: 'KYC status updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        kycStatus: updatedUser.kycStatus,
        emailVerified: updatedUser.emailVerified,
        accounts: updatedUser.accounts.map(account => ({
          id: account.id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          currency: account.currency
        }))
      }
    });

  } catch (error) {
    console.error('KYC status update error:', error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 