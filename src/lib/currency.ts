// Currency utilities for multi-currency support

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: Date;
}

// Supported currencies
export const SUPPORTED_CURRENCIES: Currency[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' }
];

// Default exchange rates (fallback when API is unavailable)
const DEFAULT_RATES: Record<string, number> = {
  'EUR': 0.85,
  'GBP': 0.73,
  'JPY': 110.0,
  'CAD': 1.25,
  'AUD': 1.35,
  'CHF': 0.92,
  'CNY': 6.45,
  'INR': 74.5,
  'BRL': 5.25,
  'MXN': 20.5,
  'SGD': 1.35,
  'HKD': 7.78,
  'NZD': 1.42,
  'SEK': 8.65,
  'NOK': 8.85,
  'DKK': 6.25,
  'PLN': 3.85,
  'CZK': 21.5,
  'HUF': 305.0
};

// Cache for exchange rates
let exchangeRateCache: Record<string, ExchangeRate> = {};
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function getCurrencyByCode(code: string): Currency | undefined {
  return SUPPORTED_CURRENCIES.find(currency => currency.code === code);
}

export function formatCurrency(amount: number, currencyCode: string, locale?: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  try {
    return new Intl.NumberFormat(locale || 'en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

export function formatCurrencyCompact(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) {
    return `${amount.toFixed(2)} ${currencyCode}`;
  }

  if (amount >= 1000000) {
    return `${currency.symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${currency.symbol}${(amount / 1000).toFixed(1)}K`;
  } else {
    return `${currency.symbol}${amount.toFixed(2)}`;
  }
}

export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const now = Date.now();

  // Check cache first
  if (exchangeRateCache[cacheKey] && (now - lastCacheUpdate) < CACHE_DURATION) {
    return exchangeRateCache[cacheKey].rate;
  }

  try {
    // Try to fetch from exchange rate API
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    
    if (response.ok) {
      const data = await response.json();
      const rate = data.rates[toCurrency];
      
      if (rate) {
        // Update cache
        exchangeRateCache[cacheKey] = {
          from: fromCurrency,
          to: toCurrency,
          rate: rate,
          lastUpdated: new Date()
        };
        lastCacheUpdate = now;
        
        return rate;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch exchange rate from API, using fallback:', error);
  }

  // Fallback to default rates
  if (fromCurrency === 'USD') {
    return DEFAULT_RATES[toCurrency] || 1;
  } else if (toCurrency === 'USD') {
    return 1 / (DEFAULT_RATES[fromCurrency] || 1);
  } else {
    // Convert through USD
    const usdToFrom = 1 / (DEFAULT_RATES[fromCurrency] || 1);
    const usdToTo = DEFAULT_RATES[toCurrency] || 1;
    return usdToTo * usdToFrom;
  }
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string, rate?: number): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const exchangeRate = rate || DEFAULT_RATES[toCurrency] || 1;
  return amount * exchangeRate;
}

export function detectUserCurrency(): string {
  // Try to detect from browser locale
  const locale = navigator.language || 'en-US';
  const country = locale.split('-')[1] || 'US';
  
  // Map common countries to currencies
  const countryToCurrency: Record<string, string> = {
    'US': 'USD',
    'CA': 'CAD',
    'GB': 'GBP',
    'DE': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'ES': 'EUR',
    'JP': 'JPY',
    'AU': 'AUD',
    'CH': 'CHF',
    'CN': 'CNY',
    'IN': 'INR',
    'BR': 'BRL',
    'MX': 'MXN',
    'SG': 'SGD',
    'HK': 'HKD',
    'NZ': 'NZD',
    'SE': 'SEK',
    'NO': 'NOK',
    'DK': 'DKK',
    'PL': 'PLN',
    'CZ': 'CZK',
    'HU': 'HUF'
  };

  return countryToCurrency[country] || 'USD';
}

export function getCurrencyDisplayName(currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  return currency ? `${currency.flag} ${currency.name} (${currency.code})` : currencyCode;
}

export function validateCurrencyCode(code: string): boolean {
  return SUPPORTED_CURRENCIES.some(currency => currency.code === code);
} 