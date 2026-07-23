'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { BANK_BRANDING } from '@/lib/bank-branding';

interface VerifyResult {
  verified: boolean;
  authentic?: boolean;
  statusLabel?: string;
  utr?: string;
  reference?: string;
  amount?: number;
  currency?: string;
  beneficiaryName?: string;
  beneficiaryBank?: string;
  beneficiaryCountry?: string;
  senderName?: string;
  senderAccount?: string;
  completedAt?: string;
  createdAt?: string;
  description?: string;
  type?: string;
  message?: string;
  error?: string;
  bank?: { name: string; website: string };
}

export default function VerifyTransferPage({ params }: { params: Promise<{ utr: string }> }) {
  const [utr, setUtr] = useState('');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ utr: rawUtr }) => {
      const decoded = decodeURIComponent(rawUtr);
      setUtr(decoded);
      fetch(`/api/verify/transfer/${encodeURIComponent(decoded)}`)
        .then((r) => r.json())
        .then(setResult)
        .catch(() => setResult({ verified: false, error: 'Verification service unavailable' }))
        .finally(() => setLoading(false));
    });
  }, [params]);

  const isSuccess = result?.verified && result?.authentic;
  const isProcessing = result?.verified && !result?.authentic;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <img src="/logo.png" alt="Global Dot Bank" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-slate-900">{BANK_BRANDING.shortName}</h1>
            <p className="text-xs text-slate-500">Transfer Verification</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {loading ? (
          <div className="dashboard-card flex flex-col items-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-600">Verifying transfer…</p>
          </div>
        ) : (
          <div className="dashboard-card overflow-hidden">
            <div
              className={`px-6 py-8 text-center ${
                isSuccess ? 'bg-emerald-50' : isProcessing ? 'bg-amber-50' : 'bg-red-50'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              ) : isProcessing ? (
                <ShieldCheck className="h-16 w-16 text-amber-600 mx-auto mb-4" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {isSuccess
                  ? 'Genuine Transfer Verified'
                  : isProcessing
                    ? 'Transfer Registered'
                    : 'Verification Failed'}
              </h2>
              <p className="text-slate-600 max-w-md mx-auto">
                {result?.statusLabel || result?.message || result?.error || 'Unable to verify this UTR.'}
              </p>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">UTR Number</p>
                <p className="text-xl font-mono font-bold text-slate-900 break-all">{utr}</p>
              </div>

              {result?.verified && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {result.reference && (
                    <div>
                      <p className="text-slate-500">Reference</p>
                      <p className="font-medium">{result.reference}</p>
                    </div>
                  )}
                  {result.amount != null && (
                    <div>
                      <p className="text-slate-500">Amount</p>
                      <p className="font-medium">
                        {result.currency === 'INR' ? '₹' : '$'}
                        {result.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        {result.currency ? ` ${result.currency}` : ''}
                      </p>
                    </div>
                  )}
                  {result.senderName && (
                    <div>
                      <p className="text-slate-500">Sender</p>
                      <p className="font-medium">{result.senderName}</p>
                    </div>
                  )}
                  {result.senderAccount && (
                    <div>
                      <p className="text-slate-500">Account</p>
                      <p className="font-medium font-mono">{result.senderAccount}</p>
                    </div>
                  )}
                  {result.beneficiaryName && (
                    <div>
                      <p className="text-slate-500">Beneficiary</p>
                      <p className="font-medium">{result.beneficiaryName}</p>
                    </div>
                  )}
                  {result.beneficiaryBank && (
                    <div>
                      <p className="text-slate-500">Beneficiary Bank</p>
                      <p className="font-medium">{result.beneficiaryBank}</p>
                    </div>
                  )}
                  {result.beneficiaryCountry && (
                    <div>
                      <p className="text-slate-500">Country</p>
                      <p className="font-medium">{result.beneficiaryCountry}</p>
                    </div>
                  )}
                  {result.description && (
                    <div className="sm:col-span-2">
                      <p className="text-slate-500">Description</p>
                      <p className="font-medium">{result.description}</p>
                    </div>
                  )}
                </div>
              )}

              {isSuccess && (
                <div className="border border-emerald-200 bg-emerald-50 rounded-lg p-4 text-sm text-emerald-800">
                  This transfer has been verified against Global Dot Bank records. The transaction is authentic
                  and cleared for your records.
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <p className="font-semibold text-slate-700">{BANK_BRANDING.legalName}</p>
              <p>{BANK_BRANDING.address}</p>
              <p className="mt-1">
                <Link href="/" className="text-blue-600 hover:underline">
                  {BANK_BRANDING.websiteDisplay}
                </Link>
                {' · '}
                {BANK_BRANDING.supportEmail}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
