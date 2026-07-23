import { NextRequest, NextResponse } from 'next/server';
import { currencyFromCountry } from '@/lib/local-currency';

async function countryFromIp(request: NextRequest): Promise<string | null> {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
  if (!ip || ip === '127.0.0.1' || ip === '::1') return null;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.countryCode ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  let country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-country-code') ||
    request.nextUrl.searchParams.get('country');

  if (!country) {
    country = await countryFromIp(request);
  }

  let currency = currencyFromCountry(country);

  if (!currency) {
    const acceptLang = request.headers.get('accept-language') || '';
    const primary = acceptLang.split(',')[0]?.trim();
    if (primary) {
      const region = primary.split('-')[1]?.toUpperCase();
      currency = currencyFromCountry(region);
    }
  }

  return NextResponse.json({
    success: true,
    country: country?.toUpperCase() ?? null,
    currency: currency ?? 'USD',
  });
}
