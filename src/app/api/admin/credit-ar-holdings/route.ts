import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    console.log('🏦 Starting AR Holdings Group credit...');
    
    const user = (request as any).user;
    
    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // First, check current balance of account 0506115866
    const account = await prisma.account.findFirst({
      where: {
        accountNumber: '0506115866'
      },
      include: {
        user: true
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account 0506115866 not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found account:', account.accountNumber);
    console.log('👤 Account holder:', account.user.firstName, account.user.lastName);
    console.log('💰 Current balance: $' + account.balance.toLocaleString());

    // Credit the account with $500,000
    const creditAmount = 500000;
    const newBalance = Number(account.balance) + creditAmount;

    console.log('💳 Crediting account with $' + creditAmount.toLocaleString());
    console.log('💰 New balance will be: $' + newBalance.toLocaleString());

    // Update the account balance
    const updatedAccount = await prisma.account.update({
      where: {
        id: account.id
      },
      data: {
        balance: newBalance
      }
    });

    console.log('✅ Account balance updated successfully');

    // Create the credit transaction
    const transaction = await prisma.transaction.create({
      data: {
        accountId: account.id,
        userId: account.userId,
        type: 'CREDIT',
        amount: creditAmount,
        description: 'Deposit from AR Holdings Group',
        reference: `AR-HOLDINGS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: 'COMPLETED'
      }
    });

    console.log('✅ Transaction created:', transaction.reference);
    console.log('📄 Transaction ID:', transaction.id);

    // Get total bank balance
    const totalBalance = await prisma.account.aggregate({
      where: {
        isActive: true
      },
      _sum: {
        balance: true
      }
    });

    console.log('🏦 Total bank balance: $' + (totalBalance._sum.balance || 0).toLocaleString());

    return NextResponse.json({
      success: true,
      message: 'AR Holdings Group credit completed successfully',
      account: {
        accountNumber: account.accountNumber,
        accountHolder: `${account.user.firstName} ${account.user.lastName}`,
        previousBalance: account.balance,
        newBalance: updatedAccount.balance,
        creditAmount: creditAmount
      },
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        amount: transaction.amount,
        description: transaction.description
      },
      bankStats: {
        totalBalance: totalBalance._sum.balance || 0
      }
    });

  } catch (error) {
    console.error('❌ Error crediting AR Holdings Group:', error);
    return NextResponse.json(
      { 
        error: 'Failed to credit AR Holdings Group',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});
