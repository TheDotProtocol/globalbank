/**
 * Reference and UTR number generators for Global Dot Bank
 * UTR = Unique Transaction Reference (bank settlement ID, generated internally)
 */

export function generateReference(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 11).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

/** 12-character alphanumeric UTR (NEFT/RTGS/IMPS style) */
export function generateUTR(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let utr = 'GDB'; // Global Dot Bank prefix
  for (let i = 0; i < 9; i++) {
    utr += chars[Math.floor(Math.random() * chars.length)];
  }
  return utr;
}

export function generateInternationalReference(): string {
  return generateReference('INTL');
}

export function generateTransferReference(): string {
  return generateReference('TRF');
}

export function generateTransactionReference(): string {
  return generateReference('TXN');
}
