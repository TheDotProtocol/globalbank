/** Canonical Global Dot Bank branding for documents, slips, and statements */

export const BANK_BRANDING = {
  legalName: 'Global Dot Bank LLC',
  shortName: 'Global Dot Bank',
  tagline: 'Banking Beyond Borders',
  subsidiary: 'A Dot Protocol Company',
  address: '1075 Terra Bella Ave, Mountain View, CA 94043, United States',
  website: 'https://globaldotbank.com',
  websiteDisplay: 'globaldotbank.com',
  email: 'banking@globaldotbank.org',
  supportEmail: 'support@globaldotbank.org',
  phone: '+1 (650) 338-8168',
  swift: 'GDBKUS33',
  defaultIfsc: 'GDBK0000001',
  primaryColor: [30, 64, 175] as [number, number, number],
  accentColor: [59, 130, 246] as [number, number, number],
};

export function getTransferVerifyUrl(utr: string, baseUrl?: string): string {
  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : BANK_BRANDING.website);
  const cleaned = utr.replace(/-FEE$/i, '').replace(/F$/i, '');
  return `${origin}/verify/transfer/${encodeURIComponent(cleaned)}`;
}

export function resolveBankCodes(branchCountry?: string | null): { ifsc: string; swift: string } {
  const country = (branchCountry || '').toLowerCase();
  if (country.includes('india')) {
    return {
      ifsc: process.env.INDIA_CORPORATE_IFSC || BANK_BRANDING.defaultIfsc,
      swift: process.env.INDIA_CORPORATE_SWIFT || 'GDBKINBB',
    };
  }
  if (country.includes('thailand')) {
    return {
      ifsc: 'N/A',
      swift: process.env.THAILAND_CORPORATE_SWIFT || 'KASITHBK',
    };
  }
  return {
    ifsc: 'N/A (International USD Account)',
    swift: BANK_BRANDING.swift,
  };
}
