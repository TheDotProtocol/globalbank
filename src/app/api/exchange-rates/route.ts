import { NextRequest, NextResponse } from 'next/server';

// Mock exchange rates - in production, this would fetch from a real API
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  JPY: 110.5,
  AUD: 1.35,
  CAD: 1.25,
  CHF: 0.92,
  CNY: 6.45,
  INR: 74.5,
  THB: 33.2,
  SGD: 1.35,
  HKD: 7.78,
  NZD: 1.42,
  SEK: 8.65,
  NOK: 8.45,
  DKK: 6.25,
  PLN: 3.85,
  CZK: 21.5,
  HUF: 305.5,
  BRL: 5.25,
  MXN: 20.15,
  ZAR: 14.85,
  KRW: 1150.5,
  TRY: 8.65,
  RUB: 75.5,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.30,
  BHD: 0.38,
  OMR: 0.38,
  JOD: 0.71,
  LBP: 1507.5,
  EGP: 15.65,
  NGN: 410.5,
  KES: 108.5,
  GHS: 6.05,
  UGX: 3550.5,
  TZS: 2300.5,
  ZMW: 18.5,
  MWK: 815.5,
  BWP: 10.85,
  NAD: 14.85,
  MUR: 40.5,
  SCR: 13.5,
  MAD: 9.05,
  TND: 2.75,
  DZD: 135.5,
  LYD: 4.55,
  SDG: 55.5,
  ETB: 45.5,
  SOS: 580.5,
  DJF: 177.5,
  KMF: 435.5,
  MGA: 3950.5,
  MZN: 63.5,
  ZWL: 85.5,
  BIF: 1980.5,
  RWF: 1000.5,
  CDF: 2000.5,
  XAF: 550.5,
  XOF: 550.5,
  XPF: 110.5,
  CLP: 750.5,
  ARS: 95.5,
  COP: 3750.5,
  PEN: 4.05,
  UYU: 42.5,
  PYG: 6850.5,
  BOB: 6.85,
  VES: 4.55,
  GTQ: 7.75,
  HNL: 24.5,
  NIO: 35.5,
  CRC: 625.5,
  PAB: 1.00,
  DOP: 58.5,
  JMD: 155.5,
  TTD: 6.75,
  BBD: 2.00,
  XCD: 2.70,
  BZD: 2.00,
  GYD: 208.5,
  SRD: 21.5,
  FJD: 2.05,
  WST: 2.55,
  TOP: 2.25,
  VUV: 110.5,
  SBD: 8.05,
  PGK: 3.45,
  KID: 1.25,
  TVD: 1.25,
  NPR: 118.5,
  BDT: 85.5,
  PKR: 155.5,
  LKR: 198.5,
  MMK: 1650.5,
  KHR: 4050.5,
  LAK: 9500.5,
  VND: 23000.5,
  IDR: 14250.5,
  MYR: 4.15,
  PHP: 50.5,
  TWD: 28.5,
  MNT: 2850.5,
  KZT: 425.5,
  UZS: 10500.5,
  KGS: 84.5,
  TJS: 11.5,
  TMT: 3.50,
  AZN: 1.70,
  GEL: 3.15,
  AMD: 485.5,
  BYN: 2.55,
  MDL: 17.5,
  UAH: 27.5,
  RSD: 100.5,
  BGN: 1.65,
  HRK: 6.25,
  ALL: 105.5,
  MKD: 51.5,
  BAM: 1.65
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const baseCurrency = searchParams.get('base') || 'USD';
    
    // In a real application, you would fetch live rates from an API
    // For now, we'll use mock data
    const rates = { ...EXCHANGE_RATES };
    
    // If base currency is not USD, convert all rates
    if (baseCurrency !== 'USD' && rates[baseCurrency as keyof typeof rates]) {
      const baseRate = rates[baseCurrency as keyof typeof rates];
      Object.keys(rates).forEach(currency => {
        if (currency !== baseCurrency) {
          rates[currency as keyof typeof rates] = rates[currency as keyof typeof rates] / baseRate;
        }
      });
      rates[baseCurrency as keyof typeof rates] = 1;
    }

    return NextResponse.json({
      success: true,
      base: baseCurrency,
      rates,
      timestamp: new Date().toISOString(),
      disclaimer: 'Rates are for demonstration purposes only'
    });
  } catch (error) {
    console.error('Exchange rates error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exchange rates' },
      { status: 500 }
    );
  }
} 