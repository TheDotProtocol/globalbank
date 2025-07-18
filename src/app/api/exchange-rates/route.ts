import { NextResponse } from 'next/server';

// Mock exchange rates - in production, use a real API like Fixer.io, ExchangeRate-API, or CurrencyLayer
const EXCHANGE_RATES = {
  USD: 1.0000,
  EUR: 0.9200,
  GBP: 0.7900,
  JPY: 150.0000,
  AUD: 1.5200,
  CAD: 1.3500,
  CHF: 0.8800,
  CNY: 7.2000,
  INR: 83.0000,
  THB: 35.5000,
  SGD: 1.3400,
  HKD: 7.8200,
  NZD: 1.6300,
  SEK: 10.4000,
  NOK: 10.8000,
  DKK: 6.8500,
  PLN: 4.0500,
  CZK: 23.2000,
  HUF: 360.0000,
  BRL: 4.9500,
  MXN: 17.2000,
  ZAR: 18.8000,
  KRW: 1350.0000,
  TRY: 31.2000,
  RUB: 95.0000,
  AED: 3.6700,
  SAR: 3.7500,
  QAR: 3.6400,
  KWD: 0.3080,
  BHD: 0.3770,
  OMR: 0.3850,
  JOD: 0.7090,
  LBP: 89000.0000,
  EGP: 31.0000,
  NGN: 1600.0000,
  KES: 160.0000,
  GHS: 12.5000,
  UGX: 3800.0000,
  TZS: 2500.0000,
  ZMW: 25.0000,
  MWK: 1700.0000,
  BWP: 13.5000,
  NAD: 18.8000,
  MUR: 45.0000,
  SCR: 13.5000,
  MAD: 10.2000,
  TND: 3.1500,
  DZD: 135.0000,
  LYD: 4.8500,
  SDG: 600.0000,
  ETB: 56.0000,
  SOS: 570.0000,
  DJF: 177.7000,
  KMF: 460.0000,
  MGA: 4500.0000,
  MZN: 64.0000,
  ZWL: 32000.0000,
  BIF: 2800.0000,
  RWF: 1300.0000,
  CDF: 2700.0000,
  XAF: 600.0000,
  XOF: 600.0000,
  XPF: 110.0000,
  CLP: 950.0000,
  ARS: 850.0000,
  COP: 3900.0000,
  PEN: 3.7000,
  UYU: 39.0000,
  PYG: 7300.0000,
  BOB: 6.9000,
  VES: 35.0000,
  GTQ: 7.8000,
  HNL: 24.7000,
  NIO: 36.8000,
  CRC: 520.0000,
  PAB: 1.0000,
  DOP: 58.5000,
  JMD: 155.0000,
  TTD: 6.7500,
  BBD: 2.0000,
  XCD: 2.7000,
  BZD: 2.0000,
  GYD: 209.0000,
  SRD: 38.0000,
  FJD: 2.2500,
  WST: 2.7500,
  TOP: 2.3500,
  VUV: 120.0000,
  SBD: 8.4000,
  PGK: 3.6500,
  KID: 1.2500,
  TVD: 1.2500,
  NPR: 133.0000,
  BDT: 110.0000,
  PKR: 280.0000,
  LKR: 320.0000,
  MMK: 2100.0000,
  KHR: 4100.0000,
  LAK: 21000.0000,
  VND: 24500.0000,
  IDR: 15800.0000,
  MYR: 4.7500,
  PHP: 56.0000,
  TWD: 32.0000,
  MNT: 3400.0000,
  KZT: 460.0000,
  UZS: 12500.0000,
  KGS: 88.0000,
  TJS: 11.0000,
  TMT: 3.5000,
  AZN: 1.7000,
  GEL: 2.6500,
  AMD: 400.0000,
  BYN: 3.2500,
  MDL: 18.0000,
  UAH: 38.0000,
  RSD: 108.0000,
  BGN: 1.8000,
  HRK: 6.9500,
  ALL: 95.0000,
  MKD: 56.5000,
  BAM: 1.8000,
};

export async function GET() {
  try {
    // In production, fetch from a real API
    // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    // const data = await response.json();
    
    // For now, return mock data with some randomization to simulate real-time rates
    const mockRates = { ...EXCHANGE_RATES };
    
    // Add small random variations to simulate real-time fluctuations
    Object.keys(mockRates).forEach(currency => {
      if (currency !== 'USD') {
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        mockRates[currency] = mockRates[currency] * (1 + variation);
      }
    });

    return NextResponse.json({
      success: true,
      base: 'USD',
      rates: mockRates,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch exchange rates',
        rates: EXCHANGE_RATES // Fallback to static rates
      },
      { status: 500 }
    );
  }
} 