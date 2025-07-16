import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Get card details
export const GET = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const cardId = params.id;

    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: user.id
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or not accessible' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        cardType: card.cardType,
        expiryDate: card.expiryDate,
        isActive: card.isActive,
        dailyLimit: card.dailyLimit,
        monthlyLimit: card.monthlyLimit,
        createdAt: card.createdAt
      }
    });
  } catch (error) {
    console.error('Get card details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Update card (activate/deactivate, update limits)
export const PUT = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const cardId = params.id;
    const { isActive, dailyLimit, monthlyLimit } = await request.json();

    // Find card and verify ownership
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: user.id
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or not accessible' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    if (dailyLimit && dailyLimit > 0) {
      updateData.dailyLimit = dailyLimit;
    }
    
    if (monthlyLimit && monthlyLimit > 0) {
      updateData.monthlyLimit = monthlyLimit;
    }

    // Update card
    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData
    });

    return NextResponse.json({
      message: 'Card updated successfully',
      card: {
        id: updatedCard.id,
        cardNumber: updatedCard.cardNumber,
        cardType: updatedCard.cardType,
        expiryDate: updatedCard.expiryDate,
        isActive: updatedCard.isActive,
        dailyLimit: updatedCard.dailyLimit,
        monthlyLimit: updatedCard.monthlyLimit,
        createdAt: updatedCard.createdAt
      }
    });
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Deactivate card
export const DELETE = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const cardId = params.id;

    // Find card and verify ownership
    const card = await prisma.card.findFirst({
      where: {
        id: cardId,
        userId: user.id
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found or not accessible' },
        { status: 404 }
      );
    }

    // Deactivate card (soft delete)
    await prisma.card.update({
      where: { id: cardId },
      data: { isActive: false }
    });

    return NextResponse.json({
      message: 'Card deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate card error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 