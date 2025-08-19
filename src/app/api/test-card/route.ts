import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { accountId } = await request.json();

    console.log('Test card creation for user:', user.id);
    console.log('Account ID:', accountId);

    // Verify account exists and belongs to user
    const account = await prisma.account.findUnique({
      where: { id: accountId, userId: user.id }
    });

    if (!account) {
      console.log('Account not found');
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    console.log('Account found:', account.accountNumber);

    // Check user KYC status
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: { kycStatus: true, firstName: true, lastName: true }
    });

    console.log('User KYC status:', userProfile?.kycStatus);

    if (userProfile?.kycStatus !== 'VERIFIED') {
      console.log('KYC not verified');
      return NextResponse.json(
        { error: 'KYC verification required for card generation' },
        { status: 400 }
      );
    }

    // Generate simple card number
    const cardNumber = '4000' + Math.random().toString().slice(2, 18);
    const cvv = Math.random().toString().slice(2, 5);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);

    console.log('Generated card number:', cardNumber.slice(-4));

    // Create card
    const newCard = await prisma.card.create({
      data: {
        userId: user.id,
        accountId,
        cardNumber,
        cardType: 'DEBIT',
        expiryDate,
        cvv,
        isVirtual: false,
        isActive: true,
        dailyLimit: 1000,
        monthlyLimit: 5000
      }
    });

    console.log('Card created successfully:', newCard.id);

    return NextResponse.json({
      success: true,
      message: 'Card created successfully',
      card: {
        id: newCard.id,
        cardNumber: `**** **** **** ${cardNumber.slice(-4)}`,
        cardType: newCard.cardType,
        expiryDate: `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().slice(-2)}`,
        cvv: newCard.cvv,
        isActive: newCard.isActive,
        dailyLimit: newCard.dailyLimit,
        monthlyLimit: newCard.monthlyLimit,
        createdAt: newCard.createdAt,
        cardHolderName: `${userProfile.firstName} ${userProfile.lastName}`,
        isVirtual: newCard.isVirtual
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Test card creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create card', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}); 