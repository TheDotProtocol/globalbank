import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-server';

// Interest rate tiers for fixed deposits
const FIXED_DEPOSIT_RATES = {
  3: { rate: 6.5, minAmount: 100, name: '3 Months' },
  6: { rate: 7.5, minAmount: 100, name: '6 Months' },
  12: { rate: 9.0, minAmount: 100, name: '12 Months' },
  24: { rate: 10.0, minAmount: 100, name: '24 Months' }
};

// Savings account interest tiers
const SAVINGS_INTEREST_TIERS = {
  BASIC: { minBalance: 0, maxBalance: 500, rate: 4.5 },
  STANDARD: { minBalance: 500, maxBalance: 2000, rate: 5.5 },
  PREMIUM: { minBalance: 2000, maxBalance: null, rate: 6.0 }
};

// Get interest rates and calculate current savings interest
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    // Get user's savings account
    const savingsAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        accountType: 'SAVINGS',
        isActive: true
      }
    });

    let currentSavingsInterest = 0;
    let currentTier = null;
    let nextTier = null;

    if (savingsAccount) {
      const balance = Number(savingsAccount.balance);
      
      // Determine current tier
      if (balance >= 2000) {
        currentTier = SAVINGS_INTEREST_TIERS.PREMIUM;
        nextTier = null; // Already at highest tier
      } else if (balance >= 500) {
        currentTier = SAVINGS_INTEREST_TIERS.STANDARD;
        nextTier = SAVINGS_INTEREST_TIERS.PREMIUM;
      } else {
        currentTier = SAVINGS_INTEREST_TIERS.BASIC;
        nextTier = SAVINGS_INTEREST_TIERS.STANDARD;
      }

      // Calculate current interest earned (assuming monthly compounding)
      const now = new Date();
      const accountAge = (now.getTime() - savingsAccount.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
      currentSavingsInterest = balance * (currentTier.rate / 100) * accountAge;
    }

    // Get user's active fixed deposits
    const activeFixedDeposits = await prisma.fixedDeposit.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      }
    });

    // Calculate total fixed deposit interest
    let totalFixedDepositInterest = 0;
    const fixedDepositsWithInterest = activeFixedDeposits.map(deposit => {
      const now = new Date();
      const monthsElapsed = (now.getTime() - deposit.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
      const interestEarned = Number(deposit.amount) * Number(deposit.interestRate) / 100 * monthsElapsed / 12;
      totalFixedDepositInterest += interestEarned;

      return {
        id: deposit.id,
        amount: deposit.amount,
        interestRate: deposit.interestRate,
        duration: deposit.duration,
        maturityDate: deposit.maturityDate,
        interestEarned: Math.round(interestEarned * 100) / 100,
        currentValue: Math.round((Number(deposit.amount) + interestEarned) * 100) / 100
      };
    });

    return NextResponse.json({
      savingsAccount: savingsAccount ? {
        balance: savingsAccount.balance,
        currentTier: {
          name: Object.keys(SAVINGS_INTEREST_TIERS).find(key => 
            SAVINGS_INTEREST_TIERS[key as keyof typeof SAVINGS_INTEREST_TIERS] === currentTier
          ),
          rate: currentTier?.rate,
          minBalance: currentTier?.minBalance,
          maxBalance: currentTier?.maxBalance
        },
        nextTier: nextTier ? {
          name: Object.keys(SAVINGS_INTEREST_TIERS).find(key => 
            SAVINGS_INTEREST_TIERS[key as keyof typeof SAVINGS_INTEREST_TIERS] === nextTier
          ),
          rate: nextTier.rate,
          minBalance: nextTier.minBalance,
          maxBalance: nextTier.maxBalance,
          amountNeeded: nextTier.minBalance - Number(savingsAccount.balance)
        } : null,
        interestEarned: Math.round(currentSavingsInterest * 100) / 100
      } : null,
      fixedDeposits: {
        totalInterest: Math.round(totalFixedDepositInterest * 100) / 100,
        deposits: fixedDepositsWithInterest
      },
      availableRates: {
        savings: SAVINGS_INTEREST_TIERS,
        fixedDeposits: FIXED_DEPOSIT_RATES
      }
    });
  } catch (error) {
    console.error('Get interest rates error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 