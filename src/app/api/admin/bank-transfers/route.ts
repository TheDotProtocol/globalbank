import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

// Get all bank transfers
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const transferType = searchParams.get('transferType') || '';

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (transferType && transferType !== 'all') {
      where.transferType = transferType.toUpperCase();
    }

    // Get bank transfers with pagination
    const [transfers, totalCount] = await Promise.all([
      prisma.bankTransfer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          corporateBank: {
            select: {
              id: true,
              bankName: true,
              accountNumber: true
            }
          },
          account: {
            select: {
              id: true,
              accountNumber: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          }
        }
      }),
      prisma.bankTransfer.count({ where })
    ]);

    return NextResponse.json({
      transfers: transfers.map(transfer => ({
        id: transfer.id,
        corporateBankId: transfer.corporateBankId,
        fromAccountId: transfer.fromAccountId,
        toAccountNumber: transfer.toAccountNumber,
        toAccountName: transfer.toAccountName,
        amount: transfer.amount,
        currency: transfer.currency,
        transferType: transfer.transferType,
        status: transfer.status,
        reference: transfer.reference,
        description: transfer.description,
        fee: transfer.fee,
        netAmount: transfer.netAmount,
        processedAt: transfer.processedAt,
        createdAt: transfer.createdAt,
        updatedAt: transfer.updatedAt,
        corporateBank: transfer.corporateBank,
        account: transfer.account
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin bank transfers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Create bank transfer (admin initiated)
export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const {
      corporateBankId,
      fromAccountId, // User's account ID (for outbound transfers)
      toAccountNumber,
      toAccountName,
      amount,
      currency = 'USD',
      transferType = 'INBOUND', // INBOUND (to user), OUTBOUND (from user)
      description = ''
    } = await request.json();

    // Validate required fields
    if (!corporateBankId || !toAccountNumber || !toAccountName || !amount) {
      return NextResponse.json(
        { error: 'Corporate bank ID, to account number, to account name, and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid transfer amount' },
        { status: 400 }
      );
    }

    // Get corporate bank
    const corporateBank = await prisma.corporateBank.findUnique({
      where: { id: corporateBankId }
    });

    if (!corporateBank) {
      return NextResponse.json(
        { error: 'Corporate bank not found' },
        { status: 404 }
      );
    }

    if (!corporateBank.isActive) {
      return NextResponse.json(
        { error: 'Corporate bank is not active' },
        { status: 400 }
      );
    }

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransfers = await prisma.bankTransfer.aggregate({
      where: {
        corporateBankId,
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: 'COMPLETED'
      },
      _sum: {
        amount: true
      }
    });

    const todayTotal = parseFloat(todayTransfers._sum.amount?.toString() || '0');
    if (todayTotal + transferAmount > parseFloat(corporateBank.dailyLimit.toString())) {
      return NextResponse.json(
        { error: `Transfer would exceed daily limit of $${corporateBank.dailyLimit}` },
        { status: 400 }
      );
    }

    // For outbound transfers, check user account balance
    if (transferType === 'OUTBOUND' && fromAccountId) {
      const userAccount = await prisma.account.findUnique({
        where: { id: fromAccountId }
      });

      if (!userAccount) {
        return NextResponse.json(
          { error: 'User account not found' },
          { status: 404 }
        );
      }

      const currentBalance = parseFloat(userAccount.balance.toString());
      if (currentBalance < transferAmount) {
        return NextResponse.json(
          { error: 'Insufficient balance in user account' },
          { status: 400 }
        );
      }
    }

    // Generate unique reference
    const reference = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create bank transfer
    const bankTransfer = await prisma.bankTransfer.create({
      data: {
        corporateBankId,
        fromAccountId,
        toAccountNumber,
        toAccountName,
        amount: transferAmount,
        currency,
        transferType: transferType as any,
        status: 'PENDING',
        reference,
        description,
        fee: parseFloat(corporateBank.transferFee.toString()),
        netAmount: transferAmount - parseFloat(corporateBank.transferFee.toString())
      },
      include: {
        corporateBank: {
          select: {
            bankName: true,
            accountNumber: true
          }
        },
        account: {
          select: {
            accountNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Bank transfer created successfully',
      transfer: {
        id: bankTransfer.id,
        reference: bankTransfer.reference,
        amount: bankTransfer.amount,
        status: bankTransfer.status,
        transferType: bankTransfer.transferType,
        createdAt: bankTransfer.createdAt,
        corporateBank: bankTransfer.corporateBank,
        account: bankTransfer.account
      }
    });
  } catch (error) {
    console.error('Admin bank transfer create error:', error);
    return NextResponse.json(
      { error: 'Failed to create bank transfer' },
      { status: 500 }
    );
  }
}); 