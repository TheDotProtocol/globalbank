import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { 
      accountId, 
      payeeName, 
      amount, 
      currency = 'USD',
      memo = '',
      selfieImage = null,
      checkType = 'ACCOUNT_ONLY' // ACCOUNT_ONLY, CASHIERS
    } = await request.json();

    console.log('🔍 E-Check creation request from user:', user.email);

    // Validate required fields
    if (!accountId || !payeeName || !amount) {
      return NextResponse.json(
        { error: 'Account ID, payee name, and amount are required' },
        { status: 400 }
      );
    }

    // Validate amount
    const checkAmount = parseFloat(amount);
    if (isNaN(checkAmount) || checkAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid check amount' },
        { status: 400 }
      );
    }

    // Get account and verify ownership
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or access denied' },
        { status: 404 }
      );
    }

    // Check sufficient balance
    const currentBalance = parseFloat(account.balance.toString());
    if (currentBalance < checkAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance in account' },
        { status: 400 }
      );
    }

    // Generate unique check number (format: xxxxx050611)
    const baseCheckNumber = '050611';
    const randomPrefix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    const checkNumber = `${randomPrefix}${baseCheckNumber}`;

    // Generate unique check ID
    const checkId = `CHK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create check record
    const check = await prisma.eCheck.create({
      data: {
        id: checkId,
        checkNumber,
        accountId,
        userId: user.id,
        payeeName,
        amount: checkAmount.toString(),
        currency,
        memo,
        status: 'PENDING'
      }
    });

    console.log('✅ E-Check created:', checkId);

    return NextResponse.json({
      success: true,
      message: 'E-Check created successfully and pending admin approval',
      check: {
        id: check.id,
        checkNumber: check.checkNumber,
        payeeName: check.payeeName,
        amount: check.amount,
        currency: check.currency,
        memo: check.memo,
        status: check.status,
        createdAt: check.createdAt
      }
    });

  } catch (error: any) {
    console.error('❌ E-Check creation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create E-Check', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');

    console.log('🔍 Fetching E-Checks for user:', user.email);

    const whereClause: any = { userId: user.id };
    if (status) {
      whereClause.status = status;
    }

    const checks = await prisma.eCheck.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true
          }
        }
      }
    });

    const totalCount = await prisma.eCheck.count({
      where: whereClause
    });

    return NextResponse.json({
      success: true,
      checks: checks.map(check => ({
        id: check.id,
        checkNumber: check.checkNumber,
        accountNumber: check.account.accountNumber,
        payeeName: check.payeeName,
        amount: check.amount,
        currency: check.currency,
        memo: check.memo,
        status: check.status,
        signatureUrl: check.signatureUrl,
        clearedAt: check.clearedAt,
        processedAt: check.processedAt,
        createdAt: check.createdAt
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching E-Checks:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch E-Checks', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 