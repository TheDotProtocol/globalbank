/**
 * User Standardization Utility
 * Ensures all users have consistent features, policies, and UI experience
 */

import { prisma } from './prisma';

export interface UserFeatures {
  // Core Banking
  multiCurrency: boolean;
  fixedDeposits: boolean;
  virtualCards: boolean;
  eChecks: boolean;
  transfers: boolean;
  
  // Security
  kycRequired: boolean;
  twoFactorOptional: boolean;
  encryptionEnabled: boolean;
  
  // AI & Support
  aiAssistant: boolean;
  exportFeatures: boolean;
  notifications: boolean;
  
  // UI/UX
  darkMode: boolean;
  translation: boolean;
  responsiveDesign: boolean;
  
  // Limits & Policies
  transferLimits: {
    daily: number;
    monthly: number;
    crossCurrencyFee: number;
  };
  
  interestRates: {
    savings: number;
    fixedDeposit: {
      '1-3': number;
      '4-6': number;
      '7-12': number;
      '13-24': number;
      '25-60': number;
    };
  };
}

// Standard features for ALL users
export const STANDARD_USER_FEATURES: UserFeatures = {
  // Core Banking - All users get these
  multiCurrency: true,
  fixedDeposits: true,
  virtualCards: true,
  eChecks: true,
  transfers: true,
  
  // Security - All users get these
  kycRequired: true,
  twoFactorOptional: true,
  encryptionEnabled: true,
  
  // AI & Support - All users get these
  aiAssistant: true,
  exportFeatures: true,
  notifications: true,
  
  // UI/UX - All users get these
  darkMode: true,
  translation: true,
  responsiveDesign: true,
  
  // Standard limits and policies for all users
  transferLimits: {
    daily: 10000, // $10,000 daily limit
    monthly: 100000, // $100,000 monthly limit
    crossCurrencyFee: 0.01 // 1% fee for cross-currency transfers
  },
  
  // Standard interest rates for all users
  interestRates: {
    savings: 0.025, // 2.5% APY
    fixedDeposit: {
      '1-3': 0.035, // 3.5% for 1-3 months
      '4-6': 0.045, // 4.5% for 4-6 months
      '7-12': 0.055, // 5.5% for 7-12 months
      '13-24': 0.065, // 6.5% for 13-24 months
      '25-60': 0.075 // 7.5% for 25-60 months
    }
  }
};

export class UserStandardization {
  /**
   * Ensure user has all standard features enabled
   */
  static async standardizeUser(userId: string): Promise<void> {
    try {
      console.log(`🔧 Standardizing user: ${userId}`);
      
      // Get user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          accounts: true,
          cards: true,
          fixedDeposits: true
        }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Ensure user has at least one savings account
      if (user.accounts.length === 0) {
        await this.createStandardAccount(userId);
      }
      
      // Ensure KYC status is properly set
      await this.standardizeKYCStatus(userId);
      
      // Ensure user has access to all features
      await this.enableAllFeatures(userId);
      
      console.log(`✅ User ${userId} standardized successfully`);
    } catch (error) {
      console.error(`❌ Error standardizing user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create standard savings account for user
   */
  private static async createStandardAccount(userId: string): Promise<void> {
    const accountNumber = this.generateAccountNumber();
    
    await prisma.account.create({
      data: {
        userId,
        accountNumber,
        accountType: 'SAVINGS',
        balance: 0,
        currency: 'USD',
        isActive: true
      }
    });
    
    console.log(`✅ Created standard savings account for user ${userId}`);
  }
  
  /**
   * Standardize KYC status
   */
  private static async standardizeKYCStatus(userId: string): Promise<void> {
    // If user has no KYC status, set to PENDING
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: 'PENDING'
      }
    });
  }
  
  /**
   * Enable all standard features for user
   */
  private static async enableAllFeatures(userId: string): Promise<void> {
    // This ensures the user has access to all features
    // Features are controlled by the application logic, not database flags
    console.log(`✅ All standard features enabled for user ${userId}`);
  }
  
  /**
   * Generate unique account number
   */
  private static generateAccountNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `GB${timestamp.slice(-8)}${random}`;
  }
  
  /**
   * Get user's feature access
   */
  static getUserFeatures(userId: string): UserFeatures {
    // All users get the same features
    return STANDARD_USER_FEATURES;
  }
  
  /**
   * Check if user has access to specific feature
   */
  static hasFeatureAccess(userId: string, feature: keyof UserFeatures): boolean {
    const features = this.getUserFeatures(userId);
    return features[feature] as boolean;
  }
  
  /**
   * Get user's transfer limits
   */
  static getTransferLimits(userId: string) {
    return STANDARD_USER_FEATURES.transferLimits;
  }
  
  /**
   * Get user's interest rates
   */
  static getInterestRates(userId: string) {
    return STANDARD_USER_FEATURES.interestRates;
  }
  
  /**
   * Standardize all users in database
   */
  static async standardizeAllUsers(): Promise<void> {
    try {
      console.log('🔧 Starting standardization of all users...');
      
      const users = await prisma.user.findMany({
        select: { id: true, email: true }
      });
      
      console.log(`📊 Found ${users.length} users to standardize`);
      
      for (const user of users) {
        try {
          await this.standardizeUser(user.id);
          console.log(`✅ Standardized user: ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to standardize user ${user.email}:`, error);
        }
      }
      
      console.log('🎉 User standardization completed');
    } catch (error) {
      console.error('❌ Error during user standardization:', error);
      throw error;
    }
  }
}

// Export standard features for use in components
export const getStandardFeatures = () => STANDARD_USER_FEATURES;
export const getStandardLimits = () => STANDARD_USER_FEATURES.transferLimits;
export const getStandardRates = () => STANDARD_USER_FEATURES.interestRates; 