import en from '@/locales/en.json';
import th from '@/locales/th.json';
import fr from '@/locales/fr.json';
import hi from '@/locales/hi.json';
import ta from '@/locales/ta.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';

const translations = {
  en,
  th,
  fr,
  hi,
  ta,
  zh,
  ja,
};

export type Locale = keyof typeof translations;

export const locales: Locale[] = ['en', 'th', 'fr', 'hi', 'ta', 'zh', 'ja'];

export const localeNames = {
  en: 'English',
  th: 'ไทย',
  fr: 'Français',
  hi: 'हिंदी',
  ta: 'தமிழ்',
  zh: '中文',
  ja: '日本語',
};

// Language detection based on browser locale
export function detectLanguage(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language.split('-')[0];
  const supportedLang = locales.find(locale => locale === browserLang);
  
  return supportedLang || 'en';
}

// Get translation for a specific key
export function t(locale: Locale, key: string, params?: Record<string, string>): string {
  const keys = key.split('.');
  let value: any = translations[locale] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key; // Return key if translation not found
  }
  
  // Replace parameters
  if (params) {
    return Object.entries(params).reduce((str, [key, val]) => {
      return str.replace(new RegExp(`{{${key}}}`, 'g'), val);
    }, value);
  }
  
  return value;
}

// Get all translations for a specific key
export function getAllTranslations(key: string): Record<Locale, string> {
  const result: Partial<Record<Locale, string>> = {};
  
  locales.forEach(locale => {
    result[locale] = t(locale as Locale, key);
  });
  
  return result as Record<Locale, string>;
}

// Hook for React components
export function useTranslation(locale: Locale) {
  return {
    t: (key: string, params?: Record<string, string>) => t(locale, key, params),
    locale,
    locales,
    localeNames,
  };
}

// Get locale from URL or localStorage
export function getCurrentLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  try {
    // Check URL first (for Next.js i18n)
    const pathname = window.location.pathname;
    const localeFromUrl = pathname.split('/')[1];
    
    if (locales.includes(localeFromUrl as Locale)) {
      return localeFromUrl as Locale;
    }
    
    // Check localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      return savedLocale;
    }
    
    // Detect from browser
    return detectLanguage();
  } catch (error) {
    // Fallback to default locale if any error occurs
    console.warn('Error getting current locale:', error);
    return 'en';
  }
}

// Set locale and save to localStorage
export function setLocale(locale: Locale) {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('locale', locale);
  
  // Update URL if needed
  const currentPath = window.location.pathname;
  const currentLocale = getCurrentLocale();
  
  if (currentLocale !== locale) {
    const newPath = currentPath.replace(`/${currentLocale}`, `/${locale}`);
    window.history.replaceState({}, '', newPath);
  }
}

// Format currency based on locale
export function formatCurrency(amount: number, currency: string = 'USD', locale: Locale = 'en'): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    th: 'th-TH',
    fr: 'fr-FR',
    hi: 'hi-IN',
    ta: 'ta-IN',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };
  
  try {
    return new Intl.NumberFormat(localeMap[locale], {
      style: 'currency',
      currency: currency,
    }).format(amount);
  } catch {
    // Fallback to basic formatting
    return `${currency} ${amount.toFixed(2)}`;
  }
}

// Format date based on locale
export function formatDate(date: Date, locale: Locale = 'en'): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    th: 'th-TH',
    fr: 'fr-FR',
    hi: 'hi-IN',
    ta: 'ta-IN',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };
  
  try {
    return new Intl.DateTimeFormat(localeMap[locale], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    // Fallback to basic formatting
    return date.toLocaleDateString();
  }
}

// Format number based on locale
export function formatNumber(number: number, locale: Locale = 'en'): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    th: 'th-TH',
    fr: 'fr-FR',
    hi: 'hi-IN',
    ta: 'ta-IN',
    zh: 'zh-CN',
    ja: 'ja-JP',
  };
  
  try {
    return new Intl.NumberFormat(localeMap[locale]).format(number);
  } catch {
    // Fallback to basic formatting
    return number.toString();
  }
} 