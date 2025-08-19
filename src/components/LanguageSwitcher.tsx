'use client';

import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, getCurrentLocale, setLocale, type Locale } from '@/lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'buttons';
}

export default function LanguageSwitcher({ className = '', variant = 'dropdown' }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const { t, locales, localeNames } = useTranslation(currentLocale);

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
    setIsOpen(false);
    
    // Reload the page to apply the new locale
    window.location.reload();
  };

  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              currentLocale === locale
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {localeNames[locale]}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <Globe className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {localeNames[currentLocale]}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-600 dark:text-gray-400 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  currentLocale === locale
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span>{localeNames[locale]}</span>
                {currentLocale === locale && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 