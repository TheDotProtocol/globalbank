'use client';

import React, { useState, useEffect } from 'react';
import { Globe, RefreshCw, Settings } from 'lucide-react';
import { 
  SUPPORTED_CURRENCIES, 
  getCurrencyByCode, 
  formatCurrency, 
  getExchangeRate,
  detectUserCurrency,
  type Currency 
} from '@/lib/currency';

interface MultiCurrencyDisplayProps {
  usdAmount: number;
  className?: string;
  showSettings?: boolean;
  onCurrencyChange?: (currency: string) => void;
}

export default function MultiCurrencyDisplay({ 
  usdAmount, 
  className = '',
  showSettings = true,
  onCurrencyChange 
}: MultiCurrencyDisplayProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(usdAmount);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);

  useEffect(() => {
    // Detect user's preferred currency on component mount
    const userCurrency = detectUserCurrency();
    if (userCurrency !== 'USD') {
      setSelectedCurrency(userCurrency);
    }
  }, []);

  useEffect(() => {
    if (selectedCurrency === 'USD') {
      setConvertedAmount(usdAmount);
      setExchangeRate(1);
      return;
    }

    const fetchExchangeRate = async () => {
      setLoading(true);
      try {
        const rate = await getExchangeRate('USD', selectedCurrency);
        setExchangeRate(rate);
        setConvertedAmount(usdAmount * rate);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
        // Fallback to USD display
        setSelectedCurrency('USD');
        setConvertedAmount(usdAmount);
        setExchangeRate(1);
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRate();
  }, [usdAmount, selectedCurrency]);

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencySelector(false);
    onCurrencyChange?.(currencyCode);
  };

  const refreshExchangeRate = async () => {
    if (selectedCurrency === 'USD') return;
    
    setLoading(true);
    try {
      const rate = await getExchangeRate('USD', selectedCurrency);
      setExchangeRate(rate);
      setConvertedAmount(usdAmount * rate);
    } catch (error) {
      console.error('Failed to refresh exchange rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrencyInfo = getCurrencyByCode(selectedCurrency);

  return (
    <div className={`relative ${className}`}>
      {/* Main Display */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(convertedAmount, selectedCurrency)}
            </span>
            {selectedCurrency !== 'USD' && (
              <span className="text-sm text-gray-500">
                ≈ {formatCurrency(usdAmount, 'USD')}
              </span>
            )}
          </div>
          {selectedCurrency !== 'USD' && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                1 USD = {exchangeRate.toFixed(4)} {selectedCurrency}
              </span>
              <button
                onClick={refreshExchangeRate}
                disabled={loading}
                className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>

        {/* Currency Selector */}
        {showSettings && (
          <div className="relative">
            <button
              onClick={() => setShowCurrencySelector(!showCurrencySelector)}
              className="flex items-center space-x-1 px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{selectedCurrencyInfo?.flag || selectedCurrency}</span>
              <Settings className="w-3 h-3" />
            </button>

            {/* Currency Dropdown */}
            {showCurrencySelector && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2 px-2">Select Currency</div>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`w-full flex items-center space-x-3 px-2 py-2 text-left rounded-md hover:bg-gray-50 transition-colors ${
                        selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{currency.flag}</span>
                      <div className="flex-1">
                        <div className="font-medium">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </div>
                      {selectedCurrency === currency.code && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
        </div>
      )}
    </div>
  );
}

// Currency Converter Component
interface CurrencyConverterProps {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  onAmountChange?: (amount: number) => void;
  onCurrencyChange?: (from: string, to: string) => void;
}

export function CurrencyConverter({ 
  amount, 
  fromCurrency, 
  toCurrency, 
  onAmountChange, 
  onCurrencyChange 
}: CurrencyConverterProps) {
  const [convertedAmount, setConvertedAmount] = useState(amount);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount);
      setExchangeRate(1);
      return;
    }

    const fetchRate = async () => {
      setLoading(true);
      try {
        const rate = await getExchangeRate(fromCurrency, toCurrency);
        setExchangeRate(rate);
        setConvertedAmount(amount * rate);
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [amount, fromCurrency, toCurrency]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* From Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="flex space-x-2">
            <select
              value={fromCurrency}
              onChange={(e) => onCurrencyChange?.(e.target.value, toCurrency)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange?.(parseFloat(e.target.value) || 0)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        </div>

        {/* To Currency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="flex space-x-2">
            <select
              value={toCurrency}
              onChange={(e) => onCurrencyChange?.(fromCurrency, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {SUPPORTED_CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.flag} {currency.code}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={convertedAmount.toFixed(2)}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
            />
          </div>
        </div>
      </div>

      {/* Exchange Rate Info */}
      {fromCurrency !== toCurrency && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Exchange Rate:</span> 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
          </div>
          {loading && (
            <div className="flex items-center space-x-2 mt-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-sm text-gray-500">Updating rates...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 