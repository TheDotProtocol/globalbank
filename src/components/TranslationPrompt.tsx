'use client';

import React from 'react';
import { X, Globe, Check, XCircle } from 'lucide-react';
import { useLanguageDetection } from '@/hooks/useLanguageDetection';

export default function TranslationPrompt() {
  const { 
    showTranslationPrompt, 
    userLanguage, 
    getCurrentLanguageInfo,
    enableTranslation, 
    disableTranslation 
  } = useLanguageDetection();

  if (!showTranslationPrompt) return null;

  const currentLang = getCurrentLanguageInfo();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{currentLang.flag}</span>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Translate to {currentLang.nativeName}?
            </h3>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            We detected you're using {currentLang.nativeName}. Would you like to translate this page?
          </p>
          
          <div className="flex space-x-2">
            <button
              onClick={enableTranslation}
              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Check className="h-3 w-3" />
              <span>Yes, translate</span>
            </button>
            
            <button
              onClick={disableTranslation}
              className="flex items-center space-x-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <XCircle className="h-3 w-3" />
              <span>No, keep English</span>
            </button>
          </div>
        </div>
        
        <button
          onClick={disableTranslation}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
} 