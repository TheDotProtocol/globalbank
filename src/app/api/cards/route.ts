import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    const cards = await prisma.card.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            balance: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      cards: cards
    });

  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
});
