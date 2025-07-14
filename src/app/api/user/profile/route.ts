import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    // Get user with accounts
    const userWithAccounts = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        accounts: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        }
      }
    });

    if (!userWithAccounts) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user profile without sensitive data
    return NextResponse.json({
      user: {
        id: userWithAccounts.id,
        email: userWithAccounts.email,
        firstName: userWithAccounts.firstName,
        lastName: userWithAccounts.lastName,
        phone: userWithAccounts.phone,
        kycStatus: userWithAccounts.kycStatus,
        createdAt: userWithAccounts.createdAt,
        accounts: userWithAccounts.accounts.map(account => ({
          id: account.id,
          accountNumber: account.accountNumber,
          accountType: account.accountType,
          balance: account.balance,
          currency: account.currency,
          isActive: account.isActive,
          createdAt: account.createdAt,
          recentTransactions: account.transactions.map(transaction => ({
            id: transaction.id,
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            status: transaction.status,
            createdAt: transaction.createdAt
          }))
        }))
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { firstName, lastName, phone } = await request.json();

    // Validate input
    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName,
        lastName,
        phone: phone || null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        kycStatus: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 