import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    // Test database connection
    try {
      await prisma.$connect();
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { email, password, firstName, lastName, phone } = await request.json();

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create user with email verification required
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        kycStatus: 'PENDING',
        emailVerified: false,
        emailVerificationToken: verificationToken
      }
    });

    // Create default savings account
    const accountNumber = `050611${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber,
        accountType: 'SAVINGS',
        balance: 0,
        currency: 'USD'
      }
    });

    // Send verification email
    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
      
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Global Dot Bank - Verify Your Email',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Welcome to Global Dot Bank!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for registering with Global Dot Bank! Your account has been created successfully.</p>
            <p><strong>Account Number:</strong> ${account.accountNumber}</p>
            <p>To complete your registration and access your account, please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6b7280;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>After verifying your email, you'll be able to:</p>
            <ul>
              <li>Access your dashboard</li>
              <li>Complete KYC verification</li>
              <li>Create cards and manage your account</li>
            </ul>
            <p>Best regards,<br>The Global Dot Bank Team</p>
          </div>
        `
      });
      console.log('Verification email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { 
        message: 'Registration successful! Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: false
        },
        account: {
          accountNumber: account.accountNumber,
          accountType: account.accountType
        },
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Log more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Always disconnect from database
    await prisma.$disconnect();
  }
} 