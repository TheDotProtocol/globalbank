'use client';

import { useEffect, useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';

interface Disclosure {
  title: string;
  summary: string;
  jurisdictions: string[];
  expansionRoadmap: string[];
  licenseStatus: string;
  insuranceNote: string;
}

export default function FundProtectionNotice() {
  const [disclosure, setDisclosure] = useState<Disclosure | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/api/user/fund-protection', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.disclosure && setDisclosure(data.disclosure))
      .catch(() => undefined);
  }, []);

  if (!disclosure) return null;

  return (
    <div className="dashboard-card border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 mb-4">
      <div className="flex gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{disclosure.title}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{disclosure.summary}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Primary licensing: {disclosure.jurisdictions.join(', ')} · Roadmap:{' '}
            {disclosure.expansionRoadmap.join(', ')}
          </p>
          <p className="flex items-start gap-1.5 text-amber-700 dark:text-amber-300 mt-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{disclosure.licenseStatus}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{disclosure.insuranceNote}</p>
        </div>
      </div>
    </div>
  );
}
