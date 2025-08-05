import { prisma } from '@/lib/prisma';

export interface InterestRate {
  accountType: string;
  annualRate: number; // Annual interest rate as percentage
  monthlyRate: number; // Monthly interest rate
  minimumBalance: number; // Minimum balance to earn interest
}

// Interest rates for different account types
export const INTEREST_RATES: InterestRate[] = [
  {
    accountType: 'SAVINGS',
    annualRate: 2.5, // 2.5% annual
    monthlyRate: 2.5 / 12, // Monthly rate
    minimumBalance: 50 // $50 minimum
  },
  {
    accountType: 'CHECKING',
    annualRate: 1.0, // 1% annual
    monthlyRate: 1.0 / 12, // Monthly rate
    minimumBalance: 100 // $100 minimum
  },
  {
    accountType: 'BUSINESS',
    annualRate: 1.8, // 1.8% annual
    monthlyRate: 1.8 / 12, // Monthly rate
    minimumBalance: 500 // $500 minimum
  }
];

export class InterestCalculator {
  /**
   * Calculate monthly interest for all accounts
   * This should be run on the last working day of each month
   */
  static async calculateMonthlyInterest(): Promise<void> {
    console.log('🏦 Starting monthly interest calculation...');
    
    try {
      // Get all active accounts with balances
      const accounts = await prisma.account.findMany({
        where: {
          isActive: true,
          balance: {
            gt: 0 // Only accounts with positive balances
          }
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

      console.log(`📊 Found ${accounts.length} active accounts for interest calculation`);

      let totalInterestPaid = 0;
      let accountsWithInterest = 0;

      for (const account of accounts) {
        try {
          const interestAmount = await this.calculateAccountInterest(account);
          
          if (interestAmount > 0) {
            await this.applyInterestToAccount(account.id, interestAmount);
            totalInterestPaid += interestAmount;
            accountsWithInterest++;
            
            console.log(`💰 Applied $${interestAmount.toFixed(2)} interest to account ${account.accountNumber}`);
          } else {
            console.log(`⚠️ No interest for account ${account.accountNumber} (balance: $${account.balance}, type: ${account.accountType})`);
          }
        } catch (error) {
          console.error(`❌ Error processing account ${account.id}:`, error);
          // Continue with other accounts even if one fails
        }
      }

      console.log(`✅ Monthly interest calculation completed:`);
      console.log(`   - Total interest paid: $${totalInterestPaid.toFixed(2)}`);
      console.log(`   - Accounts with interest: ${accountsWithInterest}`);
      console.log(`   - Date: ${new Date().toISOString()}`);

      // Log the interest calculation
      await this.logInterestCalculation({
        totalAccounts: accounts.length,
        accountsWithInterest,
        totalInterestPaid,
        calculationDate: new Date()
      });

    } catch (error) {
      console.error('❌ Error calculating monthly interest:', error);
      throw error;
    }
  }

  /**
   * Calculate interest for a specific account
   */
  static async calculateAccountInterest(account: any): Promise<number> {
    const balance = parseFloat(account.balance.toString());
    const accountType = account.accountType;
    
    // Find interest rate for this account type
    let rateConfig = INTEREST_RATES.find(rate => rate.accountType === accountType);
    
    // If no specific rate found, use a default rate
    if (!rateConfig) {
      console.log(`⚠️ No specific rate for account type: ${accountType}, using default rate`);
      rateConfig = {
        accountType: 'DEFAULT',
        annualRate: 1.5, // 1.5% annual default
        monthlyRate: 1.5 / 12, // Monthly rate
        minimumBalance: 50 // $50 minimum
      };
    }

    // Check minimum balance requirement
    if (balance < rateConfig.minimumBalance) {
      console.log(`⚠️ Account ${account.accountNumber} has insufficient balance (${balance}) for interest (minimum: ${rateConfig.minimumBalance})`);
      return 0;
    }

    // Calculate monthly interest
    const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
    
    // Round to 2 decimal places
    const roundedInterest = Math.round(monthlyInterest * 100) / 100;
    
    console.log(`📊 Interest calculation for account ${account.accountNumber}:`);
    console.log(`   - Balance: $${balance}`);
    console.log(`   - Account Type: ${accountType}`);
    console.log(`   - Annual Rate: ${rateConfig.annualRate}%`);
    console.log(`   - Monthly Rate: ${rateConfig.monthlyRate}%`);
    console.log(`   - Calculated Interest: $${roundedInterest}`);
    
    return roundedInterest;
  }

  /**
   * Apply interest to an account
   */
  static async applyInterestToAccount(accountId: string, interestAmount: number): Promise<void> {
    if (interestAmount <= 0) return;

    try {
      await prisma.$transaction(async (tx) => {
        // Get account details first
        const account = await tx.account.findUnique({ 
          where: { id: accountId },
          select: { userId: true, accountNumber: true, balance: true }
        });

        if (!account) {
          throw new Error(`Account ${accountId} not found`);
        }

        // Update account balance
        const newBalance = parseFloat(account.balance.toString()) + interestAmount;
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: newBalance
          }
        });

        // Create interest transaction with minimal required fields
        await tx.transaction.create({
          data: {
            id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            accountId,
            userId: account.userId,
            type: 'CREDIT',
            amount: interestAmount,
            description: 'Monthly Interest Payment',
            reference: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            status: 'COMPLETED'
          }
        });

        console.log(`💰 Applied $${interestAmount.toFixed(2)} interest to account ${account.accountNumber} (New balance: $${newBalance.toFixed(2)})`);
      });
    } catch (error) {
      console.error(`❌ Error applying interest to account ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Log interest calculation for audit purposes
   */
  static async logInterestCalculation(data: {
    totalAccounts: number;
    accountsWithInterest: number;
    totalInterestPaid: number;
    calculationDate: Date;
  }): Promise<void> {
    // You can create a separate table for this or use a logging service
    console.log('📝 Interest calculation log:', {
      ...data,
      calculationDate: data.calculationDate.toISOString()
    });
  }

  /**
   * Get interest rate for an account type
   */
  static getInterestRate(accountType: string): InterestRate | undefined {
    return INTEREST_RATES.find(rate => rate.accountType === accountType);
  }

  /**
   * Calculate projected interest for an account
   */
  static calculateProjectedInterest(balance: number, accountType: string, months: number = 12): number {
    const rateConfig = this.getInterestRate(accountType);
    
    if (!rateConfig || balance < rateConfig.minimumBalance) {
      return 0;
    }

    const monthlyInterest = balance * (rateConfig.monthlyRate / 100);
    return monthlyInterest * months;
  }

  /**
   * Get all interest rates for display
   */
  static getAllInterestRates(): InterestRate[] {
    return INTEREST_RATES;
  }
}

// Export a function to manually trigger interest calculation (for testing)
export async function triggerMonthlyInterestCalculation(): Promise<void> {
  console.log('🚀 Manually triggering monthly interest calculation...');
  await InterestCalculator.calculateMonthlyInterest();
} 