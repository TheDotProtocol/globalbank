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

    // Create user with email verification required but KYC pending
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

    // Send welcome email (but don't require verification for now)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Global Dot Bank - Complete Your KYC',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1f2937;">Welcome to Global Dot Bank!</h2>
            <p>Hi ${user.firstName},</p>
            <p>Thank you for registering with Global Dot Bank! Your account has been created successfully.</p>
            <p><strong>Account Number:</strong> ${account.accountNumber}</p>
            <p>To complete your registration and access your account, please complete your KYC verification.</p>
            <p>You will be redirected to our secure KYC verification system where you can:</p>
            <ul>
              <li>Upload your identity documents</li>
              <li>Complete identity verification</li>
              <li>Get verified within minutes</li>
            </ul>
            <p>After KYC verification, you'll be able to:</p>
            <ul>
              <li>Access your dashboard</li>
              <li>Create cards and manage your account</li>
              <li>Make transactions and transfers</li>
            </ul>
            <p>Best regards,<br>The Global Dot Bank Team</p>
          </div>
        `
      });
      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { 
        message: 'Registration successful! Please complete your KYC verification.',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: false,
          kycStatus: 'PENDING'
        },
        account: {
          accountNumber: account.accountNumber,
          accountType: account.accountType
        },
        requiresKYC: true,
        redirectTo: '/kyc/verification'
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