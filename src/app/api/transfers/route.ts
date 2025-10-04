import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    
    const { 
      fromAccountId, 
      toAccountId, 
      amount, 
      description, 
      targetCurrency,
      reference 
    } = body;
    
    if (!fromAccountId || !amount || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get source account
    const fromAccount = await prisma.account.findFirst({
      where: {
        id: fromAccountId,
        userId: user.id,
        isActive: true
      }
    });
    
    if (!fromAccount) {
      return NextResponse.json(
        { error: 'Source account not found' },
        { status: 404 }
      );
    }

    // Check sufficient balance
    if (fromAccount.balance.toNumber() < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate transaction fee (1% for cross-currency transfers)
    const isCrossCurrency = targetCurrency && targetCurrency !== fromAccount.currency;
    const transactionFee = isCrossCurrency ? amount * 0.01 : 0; // 1% fee for cross-currency
    const totalAmount = amount + transactionFee;

    // Check if user has enough balance including fee
    if (fromAccount.balance.toNumber() < totalAmount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance including transaction fee',
          details: {
            requestedAmount: amount,
            transactionFee: transactionFee,
            totalRequired: totalAmount,
            availableBalance: fromAccount.balance.toNumber()
          }
        },
        { status: 400 }
      );
    }

    // Get destination account if provided
    let toAccount = null;
    if (toAccountId) {
      toAccount = await prisma.account.findFirst({
        where: {
          id: toAccountId,
          isActive: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });
    }

    // Calculate converted amount if cross-currency
    let convertedAmount = amount;
    let exchangeRate = 1;
    
    if (isCrossCurrency && targetCurrency) {
      // In a real implementation, you would fetch live exchange rates
      // For now, we'll use mock rates
      const mockRates: { [key: string]: number } = {
        'EUR': 0.85,
        'GBP': 0.73,
        'JPY': 110.0,
        'CAD': 1.25,
        'AUD': 1.35,
        'CHF': 0.92,
        'CNY': 6.45,
        'INR': 74.5,
        'THB': 35.5,
        'SGD': 1.35,
        'HKD': 7.78,
        'NZD': 1.42,
        'SEK': 8.65,
        'NOK': 8.85,
        'DKK': 6.25,
        'PLN': 3.85,
        'CZK': 21.5,
        'HUF': 305.0
      };
      
      exchangeRate = mockRates[targetCurrency] || 1;
      convertedAmount = amount * exchangeRate;
    }

    // Process the transfer through K Bank corporate account
    let transferTransaction;
    
    if (toAccount) {
      // Internal transfer to another account
      transferTransaction = await corporateBankService.processInternalTransfer(
        user.id,
        fromAccountId,
        toAccountId,
        amount,
        convertedAmount,
        description,
        reference || `TRF-${Date.now()}`,
        {
          isCrossCurrency,
          transactionFee,
          exchangeRate,
          sourceCurrency: fromAccount.currency,
          targetCurrency: targetCurrency || toAccount.currency
        }
      );
    } else {
      // External transfer (to account number/IBAN)
      transferTransaction = await corporateBankService.processExternalTransfer(
        user.id,
        fromAccountId,
        amount,
        convertedAmount,
        description,
        reference || `TRF-${Date.now()}`,
        {
          isCrossCurrency,
          transactionFee,
          exchangeRate,
          sourceCurrency: fromAccount.currency,
          targetCurrency: targetCurrency || 'USD'
        }
      );
    }

    return NextResponse.json({
      success: true,
      transfer: {
        id: transferTransaction.id,
        type: transferTransaction.type,
        amount: transferTransaction.amount,
        convertedAmount: convertedAmount,
        description: transferTransaction.description,
        reference: transferTransaction.reference,
        status: transferTransaction.status,
        createdAt: transferTransaction.createdAt,
        transactionFee: transactionFee,
        exchangeRate: exchangeRate,
        isCrossCurrency: isCrossCurrency,
        sourceCurrency: fromAccount.currency,
        targetCurrency: targetCurrency || (toAccount?.currency || 'USD'),
        sourceAccount: {
          accountNumber: fromAccount.accountNumber,
          accountType: fromAccount.accountType,
          currency: fromAccount.currency
        },
        destinationAccount: toAccount ? {
          accountNumber: toAccount.accountNumber,
          accountType: toAccount.accountType,
          currency: toAccount.currency,
          accountHolder: `${toAccount.user.firstName} ${toAccount.user.lastName}`
        } : null
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process transfer' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { 
      userId: user.id,
      type: 'TRANSFER'
    };
    
    if (accountId) {
      where.OR = [
        { accountId: accountId },
        { sourceAccountId: accountId },
        { destinationAccountId: accountId }
      ];
    }

    const [transfers, totalCount] = await Promise.all([
      prisma.transaction.findMany({
        where,
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
      prisma.transaction.count({ where })
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
    console.error('Get transfers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transfers' },
      { status: 500 }
    );
  }
}); 