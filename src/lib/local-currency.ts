/** Map ISO 3166-1 alpha-2 country codes to primary currency codes */

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  US: 'USD', GB: 'GBP', EU: 'EUR', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
  IN: 'INR', TH: 'THB', SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', VN: 'VND',
  JP: 'JPY', KR: 'KRW', CN: 'CNY', TW: 'TWD', HK: 'HKD', AU: 'AUD', NZ: 'NZD',
  CA: 'CAD', MX: 'MXN', BR: 'BRL', ZA: 'ZAR', AE: 'AED', SA: 'SAR', QA: 'QAR',
  KW: 'KW', BH: 'BHD', OM: 'OMR', JO: 'JOD', EG: 'EGP', NG: 'NGN', KE: 'KES',
  CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN', CZ: 'CZK', HU: 'HUF',
  TR: 'TRY', RU: 'RUB', UA: 'UAH', PK: 'PKR', BD: 'BDT', LK: 'LKR', NP: 'NPR',
  IL: 'ILS', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
};

const LOCALE_TO_CURRENCY: Record<string, string> = {
  'en-US': 'USD', 'en-GB': 'GBP', 'en-IN': 'INR', 'en-AU': 'AUD', 'en-CA': 'CAD',
  'en-SG': 'SGD', 'en-TH': 'THB', 'th-TH': 'THB', 'hi-IN': 'INR', 'ta-IN': 'INR',
  'te-IN': 'INR', 'de-DE': 'EUR', 'fr-FR': 'EUR', 'ja-JP': 'JPY', 'ko-KR': 'KRW',
  'zh-CN': 'CNY', 'zh-TW': 'TWD', 'ms-MY': 'MYR', 'id-ID': 'IDR', 'vi-VN': 'VND',
};

export function currencyFromCountry(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null;
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] ?? null;
}

export function currencyFromBrowserLocale(): string {
  if (typeof window === 'undefined') return 'USD';
  const saved = localStorage.getItem('localCurrency');
  if (saved) return saved;

  const locale = navigator.language || 'en-US';
  if (LOCALE_TO_CURRENCY[locale]) return LOCALE_TO_CURRENCY[locale];

  try {
    const region = new Intl.Locale(locale).region;
    if (region) {
      const fromRegion = currencyFromCountry(region);
      if (fromRegion) return fromRegion;
    }
  } catch {
    // Intl.Locale not supported in older browsers
  }

  const lang = locale.split('-')[1];
  if (lang) {
    const fromLang = currencyFromCountry(lang);
    if (fromLang) return fromLang;
  }

  return 'USD';
}

export async function detectLocalCurrency(): Promise<{
  currency: string;
  country?: string;
  source: 'cache' | 'geo' | 'locale';
}> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('localCurrency');
    if (cached) return { currency: cached, source: 'cache' };
  }

  try {
    const response = await fetch('/api/geo/local-currency');
    if (response.ok) {
      const data = await response.json();
      if (data.currency && (data.country || data.currency !== 'USD')) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('localCurrency', data.currency);
          if (data.country) localStorage.setItem('localCountry', data.country);
        }
        return { currency: data.currency, country: data.country, source: 'geo' };
      }
    }
  } catch {
    // fall through
  }

  const browserGeo = await detectFromBrowserGeolocation();
  if (browserGeo) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localCurrency', browserGeo.currency);
      if (browserGeo.country) localStorage.setItem('localCountry', browserGeo.country);
    }
    return { ...browserGeo, source: 'geo' };
  }

  const currency = currencyFromBrowserLocale();
  if (typeof window !== 'undefined') localStorage.setItem('localCurrency', currency);
  return { currency, source: 'locale' };
}

function detectFromBrowserGeolocation(): Promise<{ currency: string; country?: string } | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          if (!res.ok) {
            resolve(null);
            return;
          }
          const data = await res.json();
          const country = data.countryCode as string | undefined;
          const currency = currencyFromCountry(country);
          if (currency) {
            resolve({ currency, country });
            return;
          }
        } catch {
          // ignore
        }
        resolve(null);
      },
      () => resolve(null),
      { timeout: 8000, maximumAge: 600000 }
    );
  });
}

export function getCurrencyMeta(code: string): { symbol: string; flag: string; name: string } {
  const map: Record<string, { symbol: string; flag: string; name: string }> = {
    USD: { symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
    EUR: { symbol: '€', flag: '🇪🇺', name: 'Euro' },
    GBP: { symbol: '£', flag: '🇬🇧', name: 'British Pound' },
    INR: { symbol: '₹', flag: '🇮🇳', name: 'Indian Rupee' },
    THB: { symbol: '฿', flag: '🇹🇭', name: 'Thai Baht' },
    SGD: { symbol: 'S$', flag: '🇸🇬', name: 'Singapore Dollar' },
    JPY: { symbol: '¥', flag: '🇯🇵', name: 'Japanese Yen' },
    AUD: { symbol: 'A$', flag: '🇦🇺', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', flag: '🇨🇦', name: 'Canadian Dollar' },
    AED: { symbol: 'د.إ', flag: '🇦🇪', name: 'UAE Dirham' },
    MYR: { symbol: 'RM', flag: '🇲🇾', name: 'Malaysian Ringgit' },
  };
  return map[code] ?? { symbol: code, flag: '🌍', name: code };
}
