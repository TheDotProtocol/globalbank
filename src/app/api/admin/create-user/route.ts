import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const POST = async (request: NextRequest) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      balance = 0,
      transactions = [],
      fixedDeposits = []
    } = await request.json();

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        kycStatus: 'COMPLETED',
        kycVerified: true,
        isActive: true,
        role: 'USER'
      }
    });

    // Create account
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        accountNumber: `GB${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        accountType: 'PERSONAL',
        balance: balance,
        currency: 'USD',
        isActive: true
      }
    });

    // Create debit card
    const card = await prisma.card.create({
      data: {
        userId: user.id,
        accountId: account.id,
        cardNumber: generateCardNumber(),
        cardType: 'DEBIT',
        cardBrand: 'VISA',
        expiryMonth: 12,
        expiryYear: 2028,
        cvv: generateCVV(),
        isActive: true,
        dailyLimit: 5000,
        monthlyLimit: 50000
      }
    });

    // Create transactions
    const createdTransactions = [];
    for (const transaction of transactions) {
      const createdTransaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: account.id,
          type: transaction.type || 'CREDIT',
          amount: transaction.amount,
          description: transaction.description,
          status: 'COMPLETED',
          reference: transaction.reference || `TXN-${Date.now()}`,
          createdAt: transaction.date ? new Date(transaction.date) : new Date()
        }
      });
      createdTransactions.push(createdTransaction);
    }

    // Create fixed deposits
    const createdFixedDeposits = [];
    for (const fd of fixedDeposits) {
      const fixedDeposit = await prisma.fixedDeposit.create({
        data: {
          userId: user.id,
          accountId: account.id,
          amount: fd.amount,
          interestRate: fd.interestRate || 5.5,
          maturityDate: new Date(fd.maturityDate),
          status: 'ACTIVE',
          certificateNumber: `FD-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
        }
      });
      createdFixedDeposits.push(fixedDeposit);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        kycStatus: user.kycStatus,
        kycVerified: user.kycVerified
      },
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        balance: account.balance,
        accountType: account.accountType
      },
      card: {
        id: card.id,
        cardNumber: maskCardNumber(card.cardNumber),
        cardType: card.cardType,
        cardBrand: card.cardBrand,
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear
      },
      transactions: createdTransactions,
      fixedDeposits: createdFixedDeposits
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
};

function generateCardNumber(): string {
  // Generate a valid VISA card number (starts with 4)
  const prefix = '4';
  const middle = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + middle;
}

function generateCVV(): string {
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
}

function maskCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(\d{8})(\d{4})/, '$1 **** **** $3');
} 