import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/cardUtils';

export async function POST(request: NextRequest) {
  try {
    const { userId, cardType, accountId } = await request.json();

    // Validate input
    if (!userId || !cardType || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Generate card details
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDateString = generateExpiryDate();
    
    // Convert MM/YY string to DateTime
    const [month, year] = expiryDateString.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1, 1);

    // Create card record
    const card = await prisma.card.create({
      data: {
        userId,
        accountId,
        cardNumber: cardNumber.slice(-4), // Store only last 4 digits
        cardType,
        status: 'ACTIVE',
        expiryDate,
        cvv: cvv, // In production, this should be encrypted
        isVirtual: cardType === 'VIRTUAL',
        dailyLimit: 1000,
        monthlyLimit: 5000
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Card created successfully',
      card: {
        id: card.id,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
        cardType,
        expiryDate: expiryDateString,
        cvv,
        status: card.status,
        isVirtual: card.isVirtual
      }
    });

  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
} 