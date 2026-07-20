/** Payment rail mode: demo = auto-complete after delay; live = bank API/webhook only */
export type PaymentRailMode = 'demo' | 'live';

export function getPaymentRailMode(): PaymentRailMode {
  const mode = process.env.PAYMENT_RAIL_MODE?.toLowerCase();
  return mode === 'live' ? 'live' : 'demo';
}

export function isDemoPaymentRail(): boolean {
  return getPaymentRailMode() !== 'live';
}

/** Milliseconds before demo auto-completes inbound QR payments (default 2 min) */
export function getDemoAutoCompleteMs(): number {
  const parsed = parseInt(process.env.PAYMENT_DEMO_AUTO_COMPLETE_MS || '120000', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 120000;
}

export const THAILAND_CORPORATE = {
  bankName: process.env.THAILAND_CORPORATE_BANK_NAME || 'Kasikorn Bank',
  accountNumber: process.env.THAILAND_CORPORATE_ACCOUNT_NUMBER || '198-1-64757-9',
  accountName: process.env.THAILAND_CORPORATE_ACCOUNT_NAME || 'The Dotprotocol Co., Ltd',
  swiftCode: process.env.THAILAND_CORPORATE_SWIFT || 'KASITHBK',
  bicCode: process.env.THAILAND_CORPORATE_BIC || 'KASITHBKXXX',
  currency: 'THB' as const,
};

export const INDIA_CORPORATE = {
  bankName: process.env.INDIA_CORPORATE_BANK_NAME || 'Pending — configure with your bank',
  accountNumber: process.env.INDIA_CORPORATE_ACCOUNT_NUMBER || '',
  accountName: process.env.INDIA_CORPORATE_ACCOUNT_NAME || 'The Dotprotocol Co., Ltd',
  ifsc: process.env.INDIA_CORPORATE_IFSC || '',
  swiftCode: process.env.INDIA_CORPORATE_SWIFT || '',
  upiVpa: process.env.INDIA_UPI_VPA || '',
  currency: 'INR' as const,
};

export function getKBankApiConfig() {
  return {
    consumerId: process.env.KBANK_CONSUMER_ID || '',
    consumerSecret: process.env.KBANK_CONSUMER_SECRET || '',
    baseUrl: process.env.KBANK_API_BASE_URL || 'https://apiportal.kasikornbank.com',
  };
}
