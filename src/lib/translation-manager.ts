import { Locale } from './i18n';

// Google Translate API integration
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

interface TranslationCache {
  [key: string]: {
    [locale: string]: {
      text: string;
      timestamp: number;
    };
  };
}

class TranslationManager {
  private cache: TranslationCache = {};
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  // Translate text using Google Translate API
  async translateText(text: string, targetLocale: Locale, sourceLocale: Locale = 'en'): Promise<string> {
    if (!GOOGLE_TRANSLATE_API_KEY) {
      console.warn('Google Translate API key not found, using fallback');
      return text;
    }

    const cacheKey = `${text}_${sourceLocale}_${targetLocale}`;
    const cached = this.cache[cacheKey];
    
    if (cached && cached[targetLocale] && (Date.now() - cached[targetLocale].timestamp) < this.CACHE_DURATION) {
      return cached[targetLocale].text;
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLocale,
          target: targetLocale,
          format: 'text'
        }),
      });

      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations[0]) {
        const translatedText = data.data.translations[0].translatedText;
        
        // Cache the result
        this.cache[cacheKey] = {
          [targetLocale]: {
            text: translatedText,
            timestamp: Date.now()
          }
        };
        
        return translatedText;
      }
    } catch (error) {
      console.error('Translation API error:', error);
    }

    return text; // Fallback to original text
  }

  // Batch translate multiple texts
  async translateBatch(texts: string[], targetLocale: Locale, sourceLocale: Locale = 'en'): Promise<string[]> {
    const results: string[] = [];
    
    for (const text of texts) {
      const translated = await this.translateText(text, targetLocale, sourceLocale);
      results.push(translated);
    }
    
    return results;
  }

  // Get all translation keys from a component or page
  extractTranslationKeys(obj: any, prefix = ''): string[] {
    const keys: string[] = [];
    
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'string') {
        keys.push(value);
      } else if (typeof value === 'object' && value !== null) {
        keys.push(...this.extractTranslationKeys(value, fullKey));
      }
    }
    
    return keys;
  }

  // Generate comprehensive translation files
  async generateTranslations(sourceTexts: string[], locales: Locale[]): Promise<Record<Locale, Record<string, string>>> {
    const translations: Record<Locale, Record<string, string>> = {} as any;
    
    for (const locale of locales) {
      translations[locale] = {};
      
      for (const text of sourceTexts) {
        if (locale === 'en') {
          translations[locale][text] = text;
        } else {
          const translated = await this.translateText(text, locale);
          translations[locale][text] = translated;
        }
      }
    }
    
    return translations;
  }
}

export const translationManager = new TranslationManager(); 