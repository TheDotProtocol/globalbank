import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/jwt';
import { auditUserAction } from '@/lib/regulatory/audit-log';

export async function POST(request: NextRequest) {
  try {
    const { email, password, totpCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await auditUserAction(request, { id: user.id, email }, 'LOGIN_FAILED', 'User', user.id, {
        reason: 'invalid_password',
      });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    if (user.kycStatus === 'PENDING') {
      return NextResponse.json(
        {
          error: 'KYC verification required',
          requiresKYC: true,
          message: 'Please complete your KYC verification before logging in',
        },
        { status: 403 }
      );
    }

    if (user.kycStatus === 'REJECTED') {
      return NextResponse.json(
        {
          error: 'KYC verification rejected',
          kycRejected: true,
          message: 'Your KYC verification was rejected. Please contact support.',
        },
        { status: 403 }
      );
    }

    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return NextResponse.json(
          { requires2FA: true, message: 'Two-factor authentication code required' },
          { status: 403 }
        );
      }
      if (!user.twoFactorSecret) {
        return NextResponse.json({ error: '2FA misconfigured' }, { status: 500 });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: totpCode,
        window: 2,
      });
      if (!verified) {
        await auditUserAction(request, { id: user.id, email }, 'LOGIN_2FA_FAILED', 'User', user.id);
        return NextResponse.json({ error: 'Invalid 2FA code' }, { status: 401 });
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    await auditUserAction(request, { id: user.id, email }, 'LOGIN_SUCCESS', 'User', user.id);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        kycStatus: user.kycStatus,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        accounts: user.accounts.map((account) => ({
          id: account.id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          currency: account.currency,
        })),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
