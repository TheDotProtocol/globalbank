export function generateCardNumber(): string {
  // Generate a 16-digit card number (Visa format)
  const prefix = '4'; // Visa cards start with 4
  const middle = Array.from({ length: 14 }, () => Math.floor(Math.random() * 10)).join('');
  return prefix + middle;
}

export function generateCVV(): string {
  // Generate a 3-digit CVV
  return Array.from({ length: 3 }, () => Math.floor(Math.random() * 10)).join('');
}

export function generateExpiryDate(): string {
  // Generate expiry date (MM/YY format, 3 years from now)
  const now = new Date();
  const year = now.getFullYear() + 3;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const yearShort = String(year).slice(-2);
  return `${month}/${yearShort}`;
}

export function maskCardNumber(cardNumber: string): string {
  // Mask card number showing only last 4 digits
  return `**** **** **** ${cardNumber.slice(-4)}`;
} 