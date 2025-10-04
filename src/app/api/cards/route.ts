import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    console.log('Fetching cards for user:', user.id);

    const cards = await prisma.card.findMany({
      where: {
        userId: user.id
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

    console.log('Found cards:', cards.length);

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
