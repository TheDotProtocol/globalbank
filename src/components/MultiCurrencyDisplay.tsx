'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Globe, Settings } from 'lucide-react';

interface MultiCurrencyDisplayProps {
  usdAmount: number;
  className?: string;
  showSettings?: boolean;
  onCurrencyChange?: (currency: string) => void;
}

interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', flag: '🇨🇿' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', flag: '🇭🇺' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', flag: '🇸🇦' },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'ر.ق', flag: '🇶🇦' },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'د.ك', flag: '🇰🇼' },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: '.د.ب', flag: '🇧🇭' },
  { code: 'OMR', name: 'Omani Rial', symbol: 'ر.ع.', flag: '🇴🇲' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.ا', flag: '🇯🇴' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل', flag: '🇱🇧' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'ج.م', flag: '🇪🇬' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', flag: '🇳🇬' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', flag: '🇰🇪' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', flag: '🇬🇭' },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', flag: '🇺🇬' },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', flag: '🇹🇿' },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'ZK', flag: '🇿🇲' },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', flag: '🇲🇼' },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', flag: '🇧🇼' },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', flag: '🇳🇦' },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', flag: '🇲🇺' },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: '₨', flag: '🇸🇨' },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.', flag: '🇲🇦' },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'د.ت', flag: '🇹🇳' },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'د.ج', flag: '🇩🇿' },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'ل.د', flag: '🇱🇾' },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'ج.س.', flag: '🇸🇩' },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', flag: '🇪🇹' },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', flag: '🇸🇴' },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', flag: '🇩🇯' },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', flag: '🇰🇲' },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', flag: '🇲🇬' },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', flag: '🇲🇿' },
  { code: 'ZWL', name: 'Zimbabwean Dollar', symbol: '$', flag: '🇿🇼' },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', flag: '🇧🇮' },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', flag: '🇨🇩' },
  { code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', flag: '🇨🇫' },
  { code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', flag: '🇨🇮' },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', flag: '🇵🇫' },
  { code: 'CLP', name: 'Chilean Peso', symbol: '$', flag: '🇨🇱' },
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', flag: '🇦🇷' },
  { code: 'COP', name: 'Colombian Peso', symbol: '$', flag: '🇨🇴' },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', flag: '🇵🇪' },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$', flag: '🇺🇾' },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', flag: '🇵🇾' },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs.', flag: '🇧🇴' },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', flag: '🇻🇪' },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', flag: '🇬🇹' },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', flag: '🇭🇳' },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', flag: '🇳🇮' },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', flag: '🇨🇷' },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', flag: '🇵🇦' },
  { code: 'DOP', name: 'Dominican Peso', symbol: '$', flag: '🇩🇴' },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: '$', flag: '🇯🇲' },
  { code: 'TTD', name: 'Trinidad and Tobago Dollar', symbol: '$', flag: '🇹🇹' },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: '$', flag: '🇧🇧' },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: '$', flag: '🇦🇬' },
  { code: 'BZD', name: 'Belize Dollar', symbol: '$', flag: '🇧🇿' },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: '$', flag: '🇬🇾' },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: '$', flag: '🇸🇷' },
  { code: 'FJD', name: 'Fijian Dollar', symbol: '$', flag: '🇫🇯' },
  { code: 'WST', name: 'Samoan Tālā', symbol: 'T', flag: '🇼🇸' },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', flag: '🇹🇴' },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', flag: '🇻🇺' },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: '$', flag: '🇸🇧' },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', flag: '🇵🇬' },
  { code: 'KID', name: 'Kiribati Dollar', symbol: '$', flag: '🇰🇮' },
  { code: 'TVD', name: 'Tuvaluan Dollar', symbol: '$', flag: '🇹🇻' },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: '₨', flag: '🇳🇵' },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', flag: '🇧🇩' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: '₨', flag: '🇱🇰' },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', flag: '🇲🇲' },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', flag: '🇰🇭' },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', flag: '🇱🇦' },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', flag: '🇻🇳' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', flag: '🇹🇼' },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', flag: '🇲🇳' },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', flag: '🇰🇿' },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: 'so\'m', flag: '🇺🇿' },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', flag: '🇰🇬' },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'ЅM', flag: '🇹🇯' },
  { code: 'TMT', name: 'Turkmenistan Manat', symbol: 'T', flag: '🇹🇲' },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', flag: '🇦🇿' },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', flag: '🇬🇪' },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', flag: '🇦🇲' },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', flag: '🇧🇾' },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', flag: '🇲🇩' },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', flag: '🇺🇦' },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин.', flag: '🇷🇸' },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв.', flag: '🇧🇬' },
  { code: 'HRK', name: 'Croatian Kuna', symbol: 'kn', flag: '🇭🇷' },
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', flag: '🇦🇱' },
  { code: 'MKD', name: 'North Macedonian Denar', symbol: 'ден', flag: '🇲🇰' },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', flag: '🇧🇦' },
];

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
  const [allRates, setAllRates] = useState<{[key: string]: number}>({});

  useEffect(() => {
    // Detect user's preferred currency on component mount
    const userCurrency = detectUserCurrency();
    if (userCurrency !== 'USD') {
      setSelectedCurrency(userCurrency);
    }
    fetchAllExchangeRates();
  }, []);

  useEffect(() => {
    if (selectedCurrency === 'USD') {
      setConvertedAmount(usdAmount);
      setExchangeRate(1);
      return;
    }

    const rate = allRates[selectedCurrency] || 1;
    setExchangeRate(rate);
    setConvertedAmount(usdAmount * rate);
  }, [usdAmount, selectedCurrency, allRates]);

  const fetchAllExchangeRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exchange-rates');
      if (response.ok) {
        const data = await response.json();
        setAllRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSelectedCurrency(currencyCode);
    setShowCurrencySelector(false);
    onCurrencyChange?.(currencyCode);
  };

  const refreshExchangeRate = async () => {
    await fetchAllExchangeRates();
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
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>{selectedCurrency}</span>
              <span>{selectedCurrencyInfo?.flag}</span>
            </button>

            {showCurrencySelector && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Select Currency</h3>
                </div>
                <div className="p-2">
                  {CURRENCIES.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                        selectedCurrency === currency.code ? 'bg-blue-50 text-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{currency.flag}</span>
                        <div className="text-left">
                          <div className="font-medium">{currency.name}</div>
                          <div className="text-sm text-gray-500">{currency.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(usdAmount * (allRates[currency.code] || 1), currency.code)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Rate: {(allRates[currency.code] || 1).toFixed(4)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper functions
function detectUserCurrency(): string {
  if (typeof window === 'undefined') return 'USD';
  
  // Try to get from localStorage
  const saved = localStorage.getItem('preferredCurrency');
  if (saved) return saved;
  
  // Try to detect from browser locale
  const locale = navigator.language || 'en-US';
  const currencyMap: {[key: string]: string} = {
    'en-US': 'USD',
    'en-GB': 'GBP',
    'en-CA': 'CAD',
    'en-AU': 'AUD',
    'de-DE': 'EUR',
    'fr-FR': 'EUR',
    'es-ES': 'EUR',
    'it-IT': 'EUR',
    'pt-BR': 'BRL',
    'ja-JP': 'JPY',
    'ko-KR': 'KRW',
    'zh-CN': 'CNY',
    'zh-TW': 'TWD',
    'th-TH': 'THB',
    'vi-VN': 'VND',
    'id-ID': 'IDR',
    'ms-MY': 'MYR',
    'tl-PH': 'PHP',
    'hi-IN': 'INR',
    'bn-IN': 'INR',
    'te-IN': 'INR',
    'ta-IN': 'INR',
    'mr-IN': 'INR',
    'gu-IN': 'INR',
    'kn-IN': 'INR',
    'ml-IN': 'INR',
    'pa-IN': 'INR',
    'or-IN': 'INR',
    'as-IN': 'INR',
    'ne-NP': 'NPR',
    'bn-BD': 'BDT',
    'ur-PK': 'PKR',
    'si-LK': 'LKR',
    'my-MM': 'MMK',
    'km-KH': 'KHR',
    'lo-LA': 'LAK',
    'ar-SA': 'SAR',
    'ar-AE': 'AED',
    'ar-QA': 'QAR',
    'ar-KW': 'KWD',
    'ar-BH': 'BHD',
    'ar-OM': 'OMR',
    'ar-JO': 'JOD',
    'ar-LB': 'LBP',
    'ar-EG': 'EGP',
    'ar-SD': 'SDG',
    'ar-LY': 'LYD',
    'ar-DZ': 'DZD',
    'ar-TN': 'TND',
    'ar-MA': 'MAD',
    'ar-ET': 'ETB',
    'ar-SO': 'SOS',
    'ar-DJ': 'DJF',
    'ar-KM': 'KMF',
    'ar-MG': 'MGA',
    'ar-MZ': 'MZN',
    'ar-ZW': 'ZWL',
    'ar-BI': 'BIF',
    'ar-RW': 'RWF',
    'ar-CD': 'CDF',
    'ar-CF': 'XAF',
    'ar-CI': 'XOF',
    'ar-PF': 'XPF',
    'ar-CL': 'CLP',
    'ar-AR': 'ARS',
    'ar-CO': 'COP',
    'ar-PE': 'PEN',
    'ar-UY': 'UYU',
    'ar-PY': 'PYG',
    'ar-BO': 'BOB',
    'ar-VE': 'VES',
    'ar-GT': 'GTQ',
    'ar-HN': 'HNL',
    'ar-NI': 'NIO',
    'ar-CR': 'CRC',
    'ar-PA': 'PAB',
    'ar-DO': 'DOP',
    'ar-JM': 'JMD',
    'ar-TT': 'TTD',
    'ar-BB': 'BBD',
    'ar-AG': 'XCD',
    'ar-BZ': 'BZD',
    'ar-GY': 'GYD',
    'ar-SR': 'SRD',
    'ar-FJ': 'FJD',
    'ar-WS': 'WST',
    'ar-TO': 'TOP',
    'ar-VU': 'VUV',
    'ar-SB': 'SBD',
    'ar-PG': 'PGK',
    'ar-KI': 'KID',
    'ar-TV': 'TVD',
    'ar-NP': 'NPR',
    'ar-BD': 'BDT',
    'ar-PK': 'PKR',
    'ar-LK': 'LKR',
    'ar-MM': 'MMK',
    'ar-KH': 'KHR',
    'ar-LA': 'LAK',
    'ar-VN': 'VND',
    'ar-ID': 'IDR',
    'ar-MY': 'MYR',
    'ar-PH': 'PHP',
    'ar-TW': 'TWD',
    'ar-MN': 'MNT',
    'ar-KZ': 'KZT',
    'ar-UZ': 'UZS',
    'ar-KG': 'KGS',
    'ar-TJ': 'TJS',
    'ar-TM': 'TMT',
    'ar-AZ': 'AZN',
    'ar-GE': 'GEL',
    'ar-AM': 'AMD',
    'ar-BY': 'BYN',
    'ar-MD': 'MDL',
    'ar-UA': 'UAH',
    'ar-RS': 'RSD',
    'ar-BG': 'BGN',
    'ar-HR': 'HRK',
    'ar-AL': 'ALL',
    'ar-MK': 'MKD',
    'ar-BA': 'BAM',
  };
  
  return currencyMap[locale] || 'USD';
}

function getCurrencyByCode(code: string): CurrencyInfo | undefined {
  return CURRENCIES.find(currency => currency.code === code);
}

function formatCurrency(amount: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return `${amount.toFixed(2)} ${currencyCode}`;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Currency Converter Component
export function CurrencyConverter({ 
  amount, 
  fromCurrency, 
  toCurrency 
}: { 
  amount: number; 
  fromCurrency: string; 
  toCurrency: string; 
}) {
  const [rates, setRates] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRates();
  }, []);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exchange-rates');
      if (response.ok) {
        const data = await response.json();
        setRates(data.rates);
      }
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const convertedAmount = amount * (rates[toCurrency] || 1);

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(amount, fromCurrency)}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <div className="text-2xl font-bold text-blue-600">
            {loading ? 'Loading...' : formatCurrency(convertedAmount, toCurrency)}
          </div>
        </div>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Exchange Rate: 1 {fromCurrency} = {(rates[toCurrency] || 1).toFixed(4)} {toCurrency}
      </div>
    </div>
  );
} 