import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const accountId = params.id;

    // Get account details
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
        isActive: true
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        currency: account.currency,
        isActive: account.isActive,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        transactions: account.transactions.map(t => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          reference: t.reference,
          status: t.status,
          createdAt: t.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Account details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify user authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.userId;
    const accountId = params.id;
    const body = await request.json();

    // Verify account belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId,
        isActive: true
      }
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Update account (only allow certain fields to be updated)
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        currency: body.currency || existingAccount.currency,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      account: {
        id: updatedAccount.id,
        accountNumber: updatedAccount.accountNumber,
        accountType: updatedAccount.accountType,
        balance: updatedAccount.balance,
        currency: updatedAccount.currency,
        isActive: updatedAccount.isActive,
        createdAt: updatedAccount.createdAt,
        updatedAt: updatedAccount.updatedAt
      }
    });

  } catch (error) {
    console.error('Account update error:', error);
    return NextResponse.json(
      { error: 'Failed to update account' },
      { status: 500 }
    );
  }
} 