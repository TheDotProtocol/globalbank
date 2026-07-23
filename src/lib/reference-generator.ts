/**
 * Reference and UTR number generators for Global Dot Bank
 * UTR = Unique Transaction Reference (bank settlement ID)
 * Standard length: 13–21 numeric digits (NEFT/RTGS/IMPS convention)
 */

export function generateReference(prefix: string): string {
  const random = Math.random().toString(36).substring(2, 11).toUpperCase();
  return `${prefix}-${Date.now()}-${random}`;
}

/** Generate a numeric UTR between 13 and 21 digits (default 16) */
export function generateUTR(digitCount = 16): string {
  const length = Math.min(21, Math.max(13, digitCount));
  let utr = '';
  for (let i = 0; i < length; i++) {
    utr += Math.floor(Math.random() * 10).toString();
  }
  if (utr[0] === '0') {
    utr = '1' + utr.slice(1);
  }
  return utr;
}

/** Validate UTR format — accepts new numeric (13–21) and legacy GDB-prefixed codes */
export function isValidUTR(utr: string): boolean {
  const cleaned = normalizeUTR(utr);
  if (/^\d{13,21}$/.test(cleaned)) return true;
  if (/^GDB[A-Z0-9]{9,15}$/i.test(cleaned)) return true;
  return false;
}

export function normalizeUTR(utr: string): string {
  return utr.replace(/-FEE$/i, '').replace(/F$/i, '').trim();
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
