'use client';

import { useState, useEffect } from 'react';

interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
];

export function useLanguageDetection() {
  const [userLanguage, setUserLanguage] = useState<string>('en');
  const [showTranslationPrompt, setShowTranslationPrompt] = useState(false);
  const [translationEnabled, setTranslationEnabled] = useState(false);

  useEffect(() => {
    // Detect browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    setUserLanguage(langCode);

    // Check if user's language is not English
    if (langCode !== 'en') {
      // Check if translation is already enabled
      const translationState = localStorage.getItem('translationEnabled');
      if (translationState === null) {
        // Show prompt for first-time users
        setShowTranslationPrompt(true);
      } else {
        setTranslationEnabled(translationState === 'true');
      }
    }
  }, []);

  const enableTranslation = () => {
    setTranslationEnabled(true);
    setShowTranslationPrompt(false);
    localStorage.setItem('translationEnabled', 'true');
    
    // Trigger browser translation
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('translate', 'yes');
    }
  };

  const disableTranslation = () => {
    setTranslationEnabled(false);
    setShowTranslationPrompt(false);
    localStorage.setItem('translationEnabled', 'false');
    
    // Disable browser translation
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('translate', 'no');
    }
  };

  const getLanguageInfo = (code: string): LanguageInfo | undefined => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  };

  const getCurrentLanguageInfo = (): LanguageInfo => {
    return getLanguageInfo(userLanguage) || SUPPORTED_LANGUAGES[0];
  };

  return {
    userLanguage,
    showTranslationPrompt,
    translationEnabled,
    enableTranslation,
    disableTranslation,
    getLanguageInfo,
    getCurrentLanguageInfo,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };
} 