import { NextRequest, NextResponse } from 'next/server';
import { locales, localeNames, detectLanguage, type Locale } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detectedLocale = searchParams.get('detect') === 'true' ? detectLanguage() : null;
    
    return NextResponse.json({
      locales,
      localeNames,
      detectedLocale,
      supportedLanguages: locales.map(locale => ({
        code: locale,
        name: localeNames[locale],
        nativeName: localeNames[locale]
      }))
    });
  } catch (error) {
    console.error('Language API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();
    
    if (!locale || !locales.includes(locale)) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Language preference updated',
      locale,
      localeName: localeNames[locale as Locale]
    });
  } catch (error) {
    console.error('Language change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 