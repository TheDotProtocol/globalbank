import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Simple admin authentication check
async function authenticateAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  // For now, check if it's a valid admin session token
  // In production, you'd want proper admin authentication
  if (token && token.length > 10) {
    return { isAdmin: true };
  }
  
  return null;
}

export const POST = async (request: NextRequest) => {
  try {
    // Authenticate admin
    const admin = await authenticateAdmin(request);
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      );
    }

    const { userId, accountId, amount, type, description, adminNote } = await request.json();

    // Validate input
    if (!userId || !accountId || !amount || !type || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Validate transaction type
    if (!['CREDIT', 'DEBIT'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: userId
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or does not belong to user' },
        { status: 404 }
      );
    }

    // Create transaction with admin note in description
    const fullDescription = adminNote ? `${description} (Admin Note: ${adminNote})` : description;
    
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        accountId,
        type,
        amount: numericAmount,
        description: fullDescription,
        status: 'COMPLETED',
        reference: `ADMIN-${Date.now()}`
      }
    });

    // Update account balance
    const balanceChange = type === 'CREDIT' ? numericAmount : -numericAmount;
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Manual entry created successfully',
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: transaction.amount,
        description: transaction.description,
        status: transaction.status,
        reference: transaction.reference,
        createdAt: transaction.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Manual entry error:', error);
    return NextResponse.json(
      { error: 'Failed to create manual entry' },
      { status: 500 }
    );
  }
}; 