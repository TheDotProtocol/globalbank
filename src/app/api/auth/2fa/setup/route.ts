import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

// Setup 2FA for user
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { action } = await request.json();

    if (action === 'generate') {
      // Generate secret for TOTP
      const secret = speakeasy.generateSecret({
        name: `GlobalBank (${user.email})`,
        issuer: 'GlobalBank'
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret temporarily (in production, encrypt this)
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          twoFactorSecret: secret.base32,
          twoFactorEnabled: false
        }
      });

      return NextResponse.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauthUrl: secret.otpauth_url
      });
    }

    if (action === 'verify') {
      const { token } = await request.json();

      // Get user's 2FA secret
      const userWithSecret = await prisma.user.findUnique({
        where: { id: user.id },
        select: { twoFactorSecret: true }
      });

      if (!userWithSecret?.twoFactorSecret) {
        return NextResponse.json(
          { error: '2FA not set up' },
          { status: 400 }
        );
      }

      // Verify TOTP token
      const verified = speakeasy.totp.verify({
        secret: userWithSecret.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps for clock skew
      });

      if (verified) {
        // Enable 2FA
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            twoFactorEnabled: true,
            twoFactorVerifiedAt: new Date()
          }
        });

        return NextResponse.json({
          message: '2FA enabled successfully',
          enabled: true
        });
      } else {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Disable 2FA
export const DELETE = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { token } = await request.json();

    // Get user's 2FA secret
    const userWithSecret = await prisma.user.findUnique({
      where: { id: user.id },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!userWithSecret?.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA not enabled' },
        { status: 400 }
      );
    }

    // Verify TOTP token before disabling
    const verified = speakeasy.totp.verify({
      secret: userWithSecret.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (verified) {
      // Disable 2FA
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorVerifiedAt: null
        }
      });

      return NextResponse.json({
        message: '2FA disabled successfully',
        enabled: false
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 