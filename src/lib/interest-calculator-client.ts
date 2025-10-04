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
   * Get all available interest rates
   */
  static getAllInterestRates(): InterestRate[] {
    return INTEREST_RATES;
  }

  /**
   * Calculate projected interest for a given balance and account type
   */
  static calculateProjectedInterest(
    balance: number, 
    accountType: string, 
    months: number
  ): number {
    const rate = INTEREST_RATES.find(r => r.accountType === accountType);
    if (!rate) return 0;
    
    if (balance < rate.minimumBalance) return 0;
    
    // Simple interest calculation: balance * rate * time
    return balance * (rate.monthlyRate / 100) * months;
  }

  /**
   * Get interest rate for a specific account type
   */
  static getInterestRate(accountType: string): InterestRate | null {
    return INTEREST_RATES.find(r => r.accountType === accountType) || null;
  }

  /**
   * Calculate monthly interest for a specific balance and account type
   */
  static calculateMonthlyInterest(balance: number, accountType: string): number {
    return this.calculateProjectedInterest(balance, accountType, 1);
  }

  /**
   * Calculate annual interest for a specific balance and account type
   */
  static calculateAnnualInterest(balance: number, accountType: string): number {
    return this.calculateProjectedInterest(balance, accountType, 12);
  }
}
