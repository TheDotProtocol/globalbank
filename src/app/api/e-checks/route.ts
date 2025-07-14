import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

// Generate unique check number
function generateCheckNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `EC${timestamp.slice(-6)}${random}`;
}

// Get all user e-checks
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = { userId: user.id };
    if (status) {
      whereClause.status = status;
    }

    const eChecks = await prisma.eCheck.findMany({
      where: whereClause,
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const totalCount = await prisma.eCheck.count({
      where: whereClause
    });

    return NextResponse.json({
      eChecks: eChecks.map(check => ({
        id: check.id,
        checkNumber: check.checkNumber,
        payeeName: check.payeeName,
        amount: check.amount,
        memo: check.memo,
        status: check.status,
        clearedAt: check.clearedAt,
        createdAt: check.createdAt,
        account: check.account
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get e-checks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Create new e-check
export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { accountId, payeeName, amount, memo } = await request.json();

    // Validate input
    if (!accountId || !payeeName || !amount) {
      return NextResponse.json(
        { error: 'Account ID, payee name, and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or not accessible' },
        { status: 404 }
      );
    }

    // Check sufficient balance
    if (Number(account.balance) < Number(amount)) {
      return NextResponse.json(
        { error: 'Insufficient balance in account' },
        { status: 400 }
      );
    }

    // Generate unique check number
    let checkNumber: string = "";
    let isUnique = false;
    
    while (!isUnique) {
      checkNumber = generateCheckNumber();
      const existingCheck = await prisma.eCheck.findUnique({
        where: { checkNumber }
      });
      if (!existingCheck) {
        isUnique = true;
      }
    }

    // Create e-check
    const eCheck = await prisma.eCheck.create({
      data: {
        userId: user.id,
        accountId,
        checkNumber,
        payeeName,
        amount,
        memo: memo || null,
        status: 'PENDING'
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      }
    });

    // Deduct amount from account balance
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: Number(account.balance) - Number(amount) }
    });

    // Create transaction record
    await prisma.transaction.create({
      data: {
        accountId,
        userId: user.id,
        type: 'DEBIT',
        amount,
        description: `E-Check #${checkNumber} to ${payeeName}`,
        reference: `ECHECK${checkNumber}`,
        status: 'COMPLETED'
      }
    });

    return NextResponse.json({
      message: 'E-Check created successfully',
      eCheck: {
        id: eCheck.id,
        checkNumber: eCheck.checkNumber,
        payeeName: eCheck.payeeName,
        amount: eCheck.amount,
        memo: eCheck.memo,
        status: eCheck.status,
        createdAt: eCheck.createdAt,
        account: eCheck.account
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create e-check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 