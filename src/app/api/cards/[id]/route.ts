import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    const card = await prisma.card.findFirst({
      where: {
        id: id,
        userId: user.id
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
            balance: true
          }
        }
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      card: {
        id: card.id,
        cardNumber: card.cardNumber,
        cardType: card.cardType,
        status: card.status,
        expiryDate: card.expiryDate,
        isVirtual: card.isVirtual,
        isActive: card.isActive,
        dailyLimit: card.dailyLimit,
        monthlyLimit: card.monthlyLimit,
        createdAt: card.createdAt,
        account: card.account
      }
    });

  } catch (error) {
    console.error('Error fetching card:', error);
    return NextResponse.json(
      { error: 'Failed to fetch card' },
      { status: 500 }
    );
  }
});

export const PUT = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;
    const { action, dailyLimit, monthlyLimit } = await request.json();

    const card = await prisma.card.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    let updateData: any = {};

    if (action === 'block') {
      updateData.isActive = false;
      updateData.status = 'BLOCKED';
    } else if (action === 'unblock') {
      updateData.isActive = true;
      updateData.status = 'ACTIVE';
    } else if (action === 'update-limits') {
      if (dailyLimit && dailyLimit > 0) {
        updateData.dailyLimit = dailyLimit;
      }
      if (monthlyLimit && monthlyLimit > 0) {
        updateData.monthlyLimit = monthlyLimit;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const updatedCard = await prisma.card.update({
      where: { id: id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      card: updatedCard,
      message: `Card ${action === 'block' ? 'blocked' : action === 'unblock' ? 'unblocked' : 'updated'} successfully`
    });

  } catch (error) {
    console.error('Error updating card:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
});

export const DELETE = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    const card = await prisma.card.findFirst({
      where: {
        id: id,
        userId: user.id
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }

    // Soft delete - mark as inactive
    await prisma.card.update({
      where: { id: id },
      data: {
        isActive: false,
        status: 'EXPIRED'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Card deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating card:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate card' },
      { status: 500 }
    );
  }
}); 