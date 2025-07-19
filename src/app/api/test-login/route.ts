import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Test login: Attempting login for email:', email);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true
      }
    });

    console.log('Test login: User found:', !!user);
    console.log('Test login: User ID:', user?.id);

    if (!user) {
      console.log('Test login: User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Test login: Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Test login: Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });

    console.log('Test login: Token generated successfully');
    console.log('Test login: Token preview:', token.substring(0, 20) + '...');

    // Test token verification
    const { verifyToken } = await import('@/lib/jwt');
    const payload = verifyToken(token);
    console.log('Test login: Token verification test:', !!payload);
    console.log('Test login: Payload user ID:', payload?.userId);

    return NextResponse.json({
      success: true,
      message: 'Login test successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kycStatus: user.kycStatus,
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
    console.error('Test login error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 