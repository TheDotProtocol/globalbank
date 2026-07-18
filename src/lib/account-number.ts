export const ACCOUNT_NUMBER_PREFIX = '170309';
export const LEGACY_ACCOUNT_NUMBER_PREFIX = '050611';

/** Generate a new account number: 170309 + 4 random digits */
export function generateAccountNumber(): string {
  const suffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${ACCOUNT_NUMBER_PREFIX}${suffix}`;
}

/** Generate e-check number: 5-digit prefix + 170309 suffix */
export function generateCheckNumber(): string {
  const prefix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}${ACCOUNT_NUMBER_PREFIX}`;
}

/** Migrate legacy 050611 prefix to 170309, keeping the suffix */
export function migrateAccountNumber(accountNumber: string): string {
  if (accountNumber.startsWith(LEGACY_ACCOUNT_NUMBER_PREFIX)) {
    return `${ACCOUNT_NUMBER_PREFIX}${accountNumber.slice(LEGACY_ACCOUNT_NUMBER_PREFIX.length)}`;
  }
  return accountNumber;
}

/** Migrate legacy check numbers ending in 050611 */
export function migrateCheckNumber(checkNumber: string): string {
  if (checkNumber.endsWith(LEGACY_ACCOUNT_NUMBER_PREFIX)) {
    return `${checkNumber.slice(0, -LEGACY_ACCOUNT_NUMBER_PREFIX.length)}${ACCOUNT_NUMBER_PREFIX}`;
  }
  return checkNumber;
}
