import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const GET = async (request: NextRequest) => {
  try {
    console.log('🔍 Debug fixed deposit endpoint called');
    
    // Get the specific fixed deposit
    const fixedDepositId = 'fd_baby_tau_1752943528.373871';
    
    console.log('🔍 Looking for fixed deposit:', fixedDepositId);
    
    const fixedDeposit = await prisma.fixedDeposit.findUnique({
      where: { id: fixedDepositId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
    
    console.log('🔍 Fixed deposit found:', fixedDeposit ? 'Yes' : 'No');
    
    if (!fixedDeposit) {
      return NextResponse.json({
        error: 'Fixed deposit not found',
        searchedId: fixedDepositId
      }, { status: 404 });
    }
    
    console.log('🔍 Fixed deposit accountId:', fixedDeposit.accountId);
    
    // Get the account details
    const account = await prisma.account.findUnique({
      where: { id: fixedDeposit.accountId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true,
        userId: true
      }
    });
    
    console.log('🔍 Account found:', account ? 'Yes' : 'No');
    
    // Get all accounts for this user to see what's available
    const userAccounts = await prisma.account.findMany({
      where: { userId: fixedDeposit.userId },
      select: {
        id: true,
        accountNumber: true,
        accountType: true,
        balance: true
      }
    });
    
    console.log('🔍 User accounts found:', userAccounts.length);
    
    return NextResponse.json({
      success: true,
      message: 'Debug fixed deposit successful',
      fixedDeposit: {
        id: fixedDeposit.id,
        amount: fixedDeposit.amount,
        interestRate: fixedDeposit.interestRate,
        duration: fixedDeposit.duration,
        maturityDate: fixedDeposit.maturityDate,
        status: fixedDeposit.status,
        accountId: fixedDeposit.accountId,
        userId: fixedDeposit.userId
      },
      user: {
        id: fixedDeposit.user.id,
        firstName: fixedDeposit.user.firstName,
        lastName: fixedDeposit.user.lastName,
        email: fixedDeposit.user.email
      },
      associatedAccount: account ? {
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: account.balance,
        userId: account.userId
      } : null,
      allUserAccounts: userAccounts.map(acc => ({
        id: acc.id,
        accountNumber: acc.accountNumber,
        accountType: acc.accountType,
        balance: acc.balance
      }))
    });
    
  } catch (error: any) {
    console.error('❌ Debug fixed deposit error:', error);
    return NextResponse.json(
      { 
        error: 'Debug fixed deposit failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}; 