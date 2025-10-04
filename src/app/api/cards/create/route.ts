import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';
import { generateCardNumber, generateCVV, generateExpiryDate } from '@/lib/cardUtils';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { cardType, accountId } = await request.json();

    // Validate input
    if (!cardType || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate card type
    const validCardTypes = ['DEBIT', 'CREDIT', 'VIRTUAL'];
    if (!validCardTypes.includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId: user.id }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient KYC status for card generation
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { kycStatus: true, firstName: true, lastName: true }
    });

    if (userProfile?.kycStatus !== 'VERIFIED') {
      return NextResponse.json(
        { error: 'KYC verification required for card generation' },
        { status: 400 }
      );
    }

    // Generate unique card number
    let cardNumber: string = "";
    let isUnique = false;
    
    // Ensure card number is unique
    while (!isUnique) {
      cardNumber = generateCardNumber();
      const existingCard = await prisma.card.findUnique({
        where: { cardNumber }
      });
      if (!existingCard) {
        isUnique = true;
      }
    }

    // Generate CVV (3 digits)
    const cvv = generateCVV();

    // Set expiry date (3 years from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    // Create card
    const newCard = await prisma.card.create({
      data: {
        userId: user.id,
        accountId,
        cardNumber,
        cardType,
        expiryDate,
        cvv,
        isVirtual: cardType === 'VIRTUAL',
        isActive: true,
        dailyLimit: 1000,
        monthlyLimit: 5000
      }
    });

    // Format expiry date for display
    const formattedExpiryDate = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;

    // Card holder name
    const cardHolderName = `${userProfile.firstName} ${userProfile.lastName}`;

    return NextResponse.json({
      success: true,
      message: 'Card created successfully',
      card: {
        id: newCard.id,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
        cardType: newCard.cardType,
        expiryDate: formattedExpiryDate,
        cvv: newCard.cvv, // Only show CVV once during creation
        isActive: newCard.isActive,
        dailyLimit: newCard.dailyLimit,
        monthlyLimit: newCard.monthlyLimit,
        createdAt: newCard.createdAt,
        cardHolderName,
        isVirtual: newCard.isVirtual
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}); 