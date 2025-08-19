'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation, getCurrentLocale, setLocale, type Locale } from '@/lib/i18n';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LanguageDemoPage() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');

  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  const { t } = useTranslation(currentLocale);

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale);
    setCurrentLocale(locale);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🌍 Language Demo
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Test the multi-language functionality of Global Dot Bank
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('language.selectLanguage')}
            </h2>
            <LanguageSwitcher />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Navigation
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Dashboard:</span>
                  <span className="font-medium">{t('navigation.dashboard')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Transactions:</span>
                  <span className="font-medium">{t('navigation.transactions')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Profile:</span>
                  <span className="font-medium">{t('navigation.profile')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Login:</span>
                  <span className="font-medium">{t('navigation.login')}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Common Actions
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Save:</span>
                  <span className="font-medium">{t('common.save')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Cancel:</span>
                  <span className="font-medium">{t('common.cancel')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Loading:</span>
                  <span className="font-medium">{t('common.loading')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Success:</span>
                  <span className="font-medium">{t('common.success')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            AI Assistant Demo
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-blue-900 dark:text-blue-100">
                <strong>Welcome Message:</strong> {t('ai.welcome')}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-green-900 dark:text-green-100">
                <strong>Subtitle:</strong> {t('ai.welcomeSubtitle')}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-purple-900 dark:text-purple-100">
                <strong>CTA:</strong> {t('ai.welcomeCTA')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Landing Page Demo
          </h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Hero Section
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Title:</strong> {t('landing.heroTitle')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Subtitle:</strong> {t('landing.heroSubtitle')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Button:</strong> {t('landing.openAccount')}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Features
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Title:</strong> {t('landing.featuresTitle')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Trust:</strong> {t('landing.trustTitle')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Compliance:</strong> {t('landing.globalCompliance')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Current Language: <strong>{currentLocale}</strong>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The language switcher in the top right allows you to change the interface language.
          </p>
        </div>
      </div>
    </div>
  );
} 