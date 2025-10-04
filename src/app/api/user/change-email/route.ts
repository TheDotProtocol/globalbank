import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { requireAuth } from '@/lib/auth-server';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { newEmail, password } = await request.json();

    // Validate input
    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and current password are required' },
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

    // Check if new email is different from current
    if (newEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'New email must be different from current email' },
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

    // Verify current password
    const currentUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, currentUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Generate email change verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the pending email change
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken
      }
    });

    // Send verification email to new address
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email-change?token=${verificationToken}&email=${encodeURIComponent(newEmail)}`;
    
    await sendEmail({
      to: newEmail,
      subject: 'Verify Your New Email Address - Global Dot Bank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Email Change Request</h2>
          <p>Hi ${user.firstName},</p>
          <p>You've requested to change your email address from <strong>${user.email}</strong> to <strong>${newEmail}</strong>.</p>
          <p>To complete this change, please click the button below to verify your new email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify New Email</a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
          <p><strong>Important:</strong> This link will expire in 24 hours.</p>
          <p>If you didn't request this change, please ignore this email and contact our support team immediately.</p>
          <p>Best regards,<br>The Global Dot Bank Team</p>
        </div>
      `
    });

    return NextResponse.json({
      message: 'Verification email sent to your new email address. Please check your inbox and click the verification link to complete the change.'
    });

  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Verify email change
export const PUT = async (request: NextRequest) => {
  try {
    const { token, email } = await request.json();

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Verification token and email are required' },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: token }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user's email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: email.toLowerCase(),
        emailVerified: true,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null
      }
    });

    // Send confirmation email to old address
    try {
      await sendEmail({
        to: user.email,
        subject: 'Email Address Changed - Global Dot Bank',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Email Address Changed</h2>
            <p>Hi ${user.firstName},</p>
            <p>Your email address has been successfully changed from <strong>${user.email}</strong> to <strong>${email}</strong>.</p>
            <p>You can now log in using your new email address.</p>
            <p>If you didn't make this change, please contact our support team immediately.</p>
            <p>Best regards,<br>The Global Dot Bank Team</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    return NextResponse.json({
      message: 'Email address changed successfully! You can now log in with your new email address.'
    });

  } catch (error) {
    console.error('Verify email change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}; 