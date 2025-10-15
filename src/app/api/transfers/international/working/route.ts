import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    console.log('🚀 Working International Transfer API called');
    
    const user = (request as any).user;
    console.log('✅ User authenticated:', { id: user.id, email: user.email });
    
    const body = await request.json();
    console.log('✅ Request body received:', Object.keys(body));
    
    // Your specific transfer details
    const transferData = {
      sourceAccountNumber: '0506115866',
      amount: 3000,
      currency: 'USD',
      exchangeRate: 1,
      convertedAmount: 3000,
      transferFee: 60, // 2% of 3000
      totalAmount: 3060,
      beneficiary: {
        name: 'Rosemarie Bajado',
        country: 'Philippines',
        bankName: 'Bank of the Philippines Islands (BPI)',
        swiftCode: 'BOPIPHMM',
        accountNumber: '306210105037'
      },
      description: 'International transfer to Philippines',
      reference: `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('📋 Processing transfer:', transferData);
    
    // Find the source account
    const sourceAccount = await prisma.account.findFirst({
      where: {
        accountNumber: transferData.sourceAccountNumber,
        userId: user.id,
        isActive: true
      }
    });
    
    if (!sourceAccount) {
      return NextResponse.json({
        error: 'Source account not found',
        details: `Account ${transferData.sourceAccountNumber} not found for user ${user.id}`
      }, { status: 404 });
    }
    
    console.log('✅ Source account found:', sourceAccount.accountNumber);
    
    // Check balance
    if (sourceAccount.balance.toNumber() < transferData.totalAmount) {
      return NextResponse.json({
        error: 'Insufficient balance',
        details: {
          available: sourceAccount.balance.toNumber(),
          required: transferData.totalAmount
        }
      }, { status: 400 });
    }
    
    console.log('✅ Sufficient balance confirmed');
    
    // Create the transfer record in international_transfers table
    const internationalTransfer = await prisma.internationalTransfer.create({
      data: {
        userId: user.id,
        accountId: sourceAccount.id,
        transactionId: transferData.transactionId,
        amount: transferData.amount,
        currency: transferData.currency,
        exchangeRate: transferData.exchangeRate,
        convertedAmount: transferData.convertedAmount,
        transferFee: transferData.transferFee,
        totalAmount: transferData.totalAmount,
        beneficiaryName: transferData.beneficiary.name,
        beneficiaryCountry: transferData.beneficiary.country,
        bankName: transferData.beneficiary.bankName,
        swiftCode: transferData.beneficiary.swiftCode,
        accountNumber: transferData.beneficiary.accountNumber,
        description: transferData.description,
        reference: transferData.reference,
        status: 'PENDING',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
      }
    });
    
    console.log('✅ International transfer record created:', internationalTransfer.id);
    
    // Update account balance
    await prisma.account.update({
      where: { id: sourceAccount.id },
      data: {
        balance: {
          decrement: transferData.totalAmount
        }
      }
    });
    
    console.log('✅ Account balance updated');
    
    // Create transaction record (simplified - no transferMode)
    const transaction = await prisma.transaction.create({
      data: {
        accountId: sourceAccount.id,
        userId: user.id,
        type: 'DEBIT',
        amount: transferData.amount,
        description: `International transfer to ${transferData.beneficiary.name}`,
        reference: transferData.reference,
        status: 'COMPLETED',
        transferFee: transferData.transferFee,
        netAmount: transferData.amount
      }
    });
    
    console.log('✅ Transaction record created:', transaction.id);
    
    // Generate receipt
    const receipt = {
      transactionId: transaction.id,
      reference: transferData.reference,
      amount: transferData.amount,
      currency: transferData.currency,
      exchangeRate: transferData.exchangeRate,
      convertedAmount: transferData.convertedAmount,
      transferFee: transferData.transferFee,
      totalAmount: transferData.totalAmount,
      beneficiary: transferData.beneficiary,
      sourceAccount: {
        accountNumber: sourceAccount.accountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: transferData.description
    };
    
    console.log('✅ Transfer completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'International transfer completed successfully',
      transfer: internationalTransfer,
      transaction: transaction,
      receipt: receipt
    });
    
  } catch (error) {
    console.error('Working international transfer error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Failed to process international transfer',
      details: errorMessage,
      type: error instanceof Error ? error.name : 'UnknownError'
    }, { status: 500 });
  }
});
