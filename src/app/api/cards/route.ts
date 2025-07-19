import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Generate unique 16-digit card number
function generateCardNumber(): string {
  let cardNumber = '4';
  for (let i = 0; i < 15; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

// Generate 3-digit CVV
function generateCVV(): string {
  return Math.floor(Math.random() * 1000).toString().padStart(3, '0');
}

// Get all user cards
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    const cards = await prisma.card.findMany({
      where: { 
        userId: user.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Generate virtual card
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { cardType, dailyLimit, monthlyLimit, isPhysical = false } = await request.json();

    if (!cardType) {
      return NextResponse.json(
        { error: 'Card type is required' },
        { status: 400 }
      );
    }

    const validCardTypes = ['DEBIT', 'CREDIT', 'VIRTUAL'];
    if (!validCardTypes.includes(cardType)) {
      return NextResponse.json(
        { error: 'Invalid card type' },
        { status: 400 }
      );
    }

    // Check KYC status
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

    // Get user account
    const userAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        isActive: true
      }
    });

    if (!userAccount) {
      return NextResponse.json(
        { error: 'No active account found for card creation' },
        { status: 400 }
      );
    }

    // Generate unique card number
    let cardNumber = "";
    let isUnique = false;
    while (!isUnique) {
      cardNumber = generateCardNumber();
      const existingCard = await prisma.card.findUnique({
        where: { cardNumber }
      });
      if (!existingCard) {
        isUnique = true;
      }
    }

    const cvv = generateCVV();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    // Create card with direct IDs
    const newCard = await prisma.card.create({
      data: {
        userId: user.id,
        accountId: userAccount.id,
        cardNumber,
        cardType,
        expiryDate,
        cvv,
        isActive: true,
        dailyLimit: dailyLimit || 1000,
        monthlyLimit: monthlyLimit || 5000
      }
    });

    const formattedExpiryDate = `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`;
    const cardHolderName = `${userProfile.firstName} ${userProfile.lastName}`;

    return NextResponse.json({
      message: isPhysical ? 'Physical card request submitted successfully' : 'Virtual card generated successfully',
      card: {
        id: newCard.id,
        cardNumber: newCard.cardNumber,
        cardType: newCard.cardType,
        expiryDate: formattedExpiryDate,
        cvv: newCard.cvv,
        isActive: newCard.isActive,
        dailyLimit: newCard.dailyLimit,
        monthlyLimit: newCard.monthlyLimit,
        createdAt: newCard.createdAt,
        cardHolderName,
        isPhysical
      },
      deliveryNotice: isPhysical ? {
        message: 'Physical card delivery',
        details: 'Your physical card will be delivered to your registered address within 21 working days.',
        estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toLocaleDateString()
      } : null
    }, { status: 201 });
  } catch (error) {
    console.error('Generate card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
