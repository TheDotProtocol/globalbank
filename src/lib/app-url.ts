/** Production site URL for Global Dot Bank */
export const PRODUCTION_APP_URL = 'https://globaldotbank.com';

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || PRODUCTION_APP_URL;
}
