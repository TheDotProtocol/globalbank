'use client';

import { useEffect, useMemo, useState } from 'react';
import { detectLocalCurrency, getCurrencyMeta } from '@/lib/local-currency';

interface CurrencyBalanceGridProps {
  usdAmount: number;
  className?: string;
}

const BASE_CURRENCIES = ['USD', 'EUR', 'GBP', 'THB'];

function formatAmount(amount: number, code: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: code === 'JPY' || code === 'KRW' ? 0 : 2,
    }).format(amount);
  } catch {
    const meta = getCurrencyMeta(code);
    return `${meta.symbol}${amount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  }
}

export default function CurrencyBalanceGrid({ usdAmount, className = '' }: CurrencyBalanceGridProps) {
  const [rates, setRates] = useState<Record<string, number>>({ USD: 1 });
  const [localCurrency, setLocalCurrency] = useState<string | null>(null);
  const [localLabel, setLocalLabel] = useState('Your location');

  useEffect(() => {
    detectLocalCurrency().then(({ currency, country, source }) => {
      setLocalCurrency(currency);
      if (country) setLocalLabel(`Your location (${country})`);
      else if (source === 'locale') setLocalLabel('Your locale');
    });

    fetch('/api/exchange-rates')
      .then((r) => r.json())
      .then((data) => setRates(data.rates ?? { USD: 1 }))
      .catch(() => undefined);
  }, []);

  const currencies = useMemo(() => {
    const codes = [...BASE_CURRENCIES];
    if (localCurrency && !codes.includes(localCurrency)) {
      codes.unshift(localCurrency);
    } else if (localCurrency) {
      // Move local to front
      const filtered = codes.filter((c) => c !== localCurrency);
      return [localCurrency, ...filtered];
    }
    return codes;
  }, [localCurrency]);

  return (
    <div
      className={className}
      style={{
        marginTop: '1.5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '1rem',
      }}
    >
      {currencies.map((code, index) => {
        const rate = rates[code] ?? 1;
        const amount = usdAmount * rate;
        const meta = getCurrencyMeta(code);
        const isLocal = index === 0 && localCurrency === code;

        return (
          <div
            key={code}
            style={{
              padding: '0.75rem',
              border: isLocal ? '2px solid rgba(255,255,255,0.6)' : '1px solid rgba(255,255,255,0.2)',
              borderRadius: isLocal ? '4px' : undefined,
              background: isLocal ? 'rgba(255,255,255,0.08)' : undefined,
            }}
          >
            <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
              {isLocal ? `${meta.flag} ${localLabel}` : `${meta.flag} ${code}`}
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatAmount(amount, code)}</div>
            {isLocal && code !== 'USD' && (
              <div style={{ fontSize: '0.75rem', opacity: 0.75, marginTop: '0.25rem' }}>
                ≈ {formatAmount(usdAmount, 'USD')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
