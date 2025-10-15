import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    console.log('🚀 International transfer API called');
    
    const user = (request as any).user;
    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    
    const body = await request.json();
    console.log('✅ Request body parsed:', Object.keys(body));
    
    console.log('International transfer request:', { userId: user.id, body });
    
    // Test database connectivity
    console.log('🔍 Testing database connection...');
    const dbTest = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true }
    });
    console.log('✅ Database connection successful:', dbTest ? 'Yes' : 'No');
    
    const { 
      sourceAccountId, 
      amount, 
      currency,
      description,
      beneficiary
    } = body;
    
    if (!sourceAccountId || !amount || !currency || !beneficiary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get source account
    const sourceAccount = await prisma.account.findFirst({
      where: {
        id: sourceAccountId,
        userId: user.id,
        isActive: true
      }
    });
    
    if (!sourceAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }

    // Calculate fees (2% for international transfers)
    const transferFee = amount * 0.02;
    const totalAmount = amount + transferFee;

    // Check sufficient balance
    if (sourceAccount.balance.toNumber() < totalAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance including international transfer fee',
          details: {
            requestedAmount: amount,
            transferFee: transferFee,
            totalRequired: totalAmount,
            availableBalance: sourceAccount.balance.toNumber()
          }
        },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const transactionRef = `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Simulate exchange rate (in production, this would come from a real API)
    const exchangeRate = currency === 'USD' ? 1 : 0.85; // Simulate EUR rate
    const convertedAmount = amount * exchangeRate;

    // Create international transfer record
    console.log('Creating international transfer with data:', {
      userId: user.id,
      accountId: sourceAccountId,
      amount,
      currency,
      beneficiary
    });
    
    const result = await prisma.$transaction(async (tx) => {
      // Deduct from source account
      const updatedSourceAccount = await tx.account.update({
        where: { id: sourceAccountId },
        data: {
          balance: {
            decrement: totalAmount
          }
        }
      });

      // Create debit transaction for the transfer
      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: sourceAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount: amount,
          description: `International transfer to ${beneficiary.name} - ${description || 'International Transfer'}`,
          reference: transactionRef,
          status: 'COMPLETED',
          transferMode: 'INTERNATIONAL_TRANSFER',
          sourceAccountId: sourceAccountId,
          sourceAccountNumber: sourceAccount.accountNumber,
          sourceAccountHolder: `${user.firstName} ${user.lastName}`,
          destinationAccountNumber: beneficiary.accountNumber,
          destinationAccountHolder: beneficiary.name,
          transferFee: transferFee,
          netAmount: amount
        }
      });

      // Create fee transaction
      const feeTransaction = await tx.transaction.create({
        data: {
          accountId: sourceAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount: transferFee,
          description: `International transfer fee for ${transactionRef}`,
          reference: `${transactionRef}-FEE`,
          status: 'COMPLETED'
        }
      });

      // Create international transfer record
      console.log('Creating internationalTransfer record...');
      const internationalTransfer = await tx.internationalTransfer.create({
        data: {
          userId: user.id,
          accountId: sourceAccountId,
          transactionId: debitTransaction.id,
          amount: amount,
          currency: currency,
          exchangeRate: exchangeRate,
          convertedAmount: convertedAmount,
          transferFee: transferFee,
          totalAmount: totalAmount,
          beneficiaryName: beneficiary.name,
          beneficiaryAddress: beneficiary.address,
          beneficiaryCity: beneficiary.city,
          beneficiaryCountry: beneficiary.country,
          bankName: beneficiary.bankName,
          bankAddress: beneficiary.bankAddress,
          swiftCode: beneficiary.swiftCode,
          accountNumber: beneficiary.accountNumber,
          routingNumber: beneficiary.routingNumber,
          description: description,
          reference: transactionRef,
          status: 'PENDING',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        }
      });

      return {
        sourceAccount: updatedSourceAccount,
        debitTransaction,
        feeTransaction,
        internationalTransfer
      };
    });

    // Generate receipt data
    const receiptData = {
      transactionId: result.debitTransaction.id,
      reference: result.debitTransaction.reference,
      amount: amount,
      currency: currency,
      exchangeRate: exchangeRate,
      convertedAmount: convertedAmount,
      transferFee: transferFee,
      totalAmount: totalAmount,
      beneficiary: beneficiary,
      sourceAccount: {
        accountNumber: sourceAccount.accountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'International transfer initiated successfully',
      transaction: result.debitTransaction,
      internationalTransfer: result.internationalTransfer,
      receipt: receiptData
    });

  } catch (error) {
    console.error('International transfer error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', {
      message: errorMessage,
      stack: errorStack,
      name: errorName
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process international transfer',
        details: errorMessage,
        type: errorName
      },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [transfers, totalCount] = await Promise.all([
      prisma.internationalTransfer.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          account: {
            select: {
              accountNumber: true,
              accountType: true,
              currency: true
            }
          }
        }
      }),
      prisma.internationalTransfer.count({ where: { userId: user.id } })
    ]);

    return NextResponse.json({
      transfers,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Get international transfers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch international transfers' },
      { status: 500 }
    );
  }
});
