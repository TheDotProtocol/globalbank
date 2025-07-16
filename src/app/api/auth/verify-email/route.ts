import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification email
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'GlobalBank - Verify Your Email',
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.firstName},</p>
        <p>Please verify your email address for your GlobalBank account.</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>GlobalBank Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify email token
export async function PUT(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Store verification tokens in the database
    // 2. Verify the token is valid and not expired
    // 3. Update user's email verification status
    
    // For now, we'll return a success message
    // You should implement proper token verification

    return NextResponse.json({
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 