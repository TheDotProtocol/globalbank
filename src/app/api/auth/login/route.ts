import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check KYC status instead of email verification
    if (user.kycStatus === 'PENDING') {
      return NextResponse.json(
        { 
          error: 'KYC verification required',
          requiresKYC: true,
          message: 'Please complete your KYC verification before logging in'
        },
        { status: 403 }
      );
    }

    if (user.kycStatus === 'REJECTED') {
      return NextResponse.json(
        { 
          error: 'KYC verification rejected',
          kycRejected: true,
          message: 'Your KYC verification was rejected. Please contact support.'
        },
        { status: 403 }
      );
    }

    if (user.kycStatus === 'REVIEW') {
      return NextResponse.json(
        { 
          error: 'KYC verification under review',
          kycReview: true,
          message: 'Your KYC verification is under review. You will be notified once it\'s completed.'
        },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Return user data with token (without password)
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        accounts: user.accounts.map(account => ({
          id: account.id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          currency: account.currency
        }))
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 