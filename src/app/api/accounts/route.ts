import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get user accounts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const accounts = await prisma.account.findMany({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new account
export async function POST(request: NextRequest) {
  try {
    const { userId, accountType, initialBalance = 0 } = await request.json();

    if (!userId || !accountType) {
      return NextResponse.json(
        { error: 'User ID and account type are required' },
        { status: 400 }
      );
    }

    // Generate unique account number
    const accountNumber = `050611${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    const account = await prisma.account.create({
      data: {
        userId,
        accountNumber,
        accountType,
        balance: initialBalance,
        currency: 'USD'
      }
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 