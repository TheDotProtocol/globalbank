'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import SumsubWebSdk from '@sumsub/websdk';
import { AlertCircle, CheckCircle, Loader2, Shield } from 'lucide-react';

interface SumsubWebSdkPanelProps {
  onStatusChange?: (status: string) => void;
  onComplete?: () => void;
}

function getStoredUserId(): string | null {
  const direct = localStorage.getItem('userId');
  if (direct) return direct;
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return user?.id ?? null;
  } catch {
    return null;
  }
}

export default function SumsubWebSdkPanel({ onStatusChange, onComplete }: SumsubWebSdkPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sdkRef = useRef<{ destroy?: () => void } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<string | null>(null);

  const fetchAccessToken = useCallback(async (): Promise<string> => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Please log in to continue');

    const response = await fetch('/api/sumsub/access-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.details || data.error || 'Failed to get Sumsub access token');
    }
    return data.token as string;
  }, []);

  const refreshStatus = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userId = getStoredUserId();
    if (!token || !userId) return;

    const response = await fetch(`/api/sumsub/applicant-status/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;

    const data = await response.json();
    setKycStatus(data.status);
    onStatusChange?.(data.status);
    if (data.status === 'VERIFIED') {
      onComplete?.();
    }
  }, [onComplete, onStatusChange]);

  useEffect(() => {
    let cancelled = false;

    async function initSdk() {
      if (!containerRef.current) return;
      setLoading(true);
      setError(null);

      try {
        const initialToken = await fetchAccessToken();
        if (cancelled || !containerRef.current) return;

        sdkRef.current?.destroy?.();
        containerRef.current.innerHTML = '';

        const instance = SumsubWebSdk.init(initialToken, fetchAccessToken)
          .withConf({ lang: 'en' })
          .withOptions({ addViewportTag: false, adaptIframeHeight: true })
          .on('idCheck.onApplicantSubmitted', () => {
            refreshStatus();
          })
          .on('idCheck.onApplicantStatusChanged', () => {
            refreshStatus();
          })
          .on('idCheck.onError', (err: unknown) => {
            console.error('Sumsub WebSDK error:', err);
            setError('Verification widget encountered an error. Please refresh and try again.');
          })
          .build();

        sdkRef.current = instance;
        instance.launch('#sumsub-websdk-container');
        setLoading(false);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load Sumsub verification');
          setLoading(false);
        }
      }
    }

    initSdk();

    return () => {
      cancelled = true;
      sdkRef.current?.destroy?.();
    };
  }, [fetchAccessToken, refreshStatus]);

  if (kycStatus === 'VERIFIED') {
    return (
      <div className="dashboard-card text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification complete</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Sumsub has approved your identity.</p>
      </div>
    );
  }

  if (kycStatus === 'REJECTED') {
    return (
      <div className="dashboard-card text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verification not approved</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please contact support or try again.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verify with Sumsub</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Secure ID check powered by Sumsub (level: basic)</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-gray-600 dark:text-gray-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading verification…</span>
        </div>
      )}

      <div id="sumsub-websdk-container" ref={containerRef} className="min-h-[480px] w-full" />
    </div>
  );
}
