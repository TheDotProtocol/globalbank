'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Settlement {
  id: string;
  reference: string;
  type: string;
  status: string;
  amount: number;
  currency: string;
  externalRef: string | null;
  settledAt: string | null;
  createdAt: string;
}

export default function SettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState({ pending: 0, settled: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/settlements?limit=100', { headers: getAdminHeaders() });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSettlements(data.settlements || []);
          setSummary(data.summary || { pending: 0, settled: 0, failed: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <AdminLayout title="Settlement Ledger">
      <div className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Double-entry settlement records linked to transactions. International outbound starts PENDING until external rail confirms (UTR/SWIFT).
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        {(['pending', 'settled', 'failed'] as const).map((k) => (
          <div key={k} className="dashboard-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700 }}>{summary[k]}</div>
            <div style={{ textTransform: 'capitalize', opacity: 0.7 }}>{k}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p>Loading settlements…</p>
        ) : settlements.length === 0 ? (
          <p>No settlement records yet.</p>
        ) : (
          <table className="dashboard-table" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Status</th>
                <th>Amount</th>
                <th>External ref</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.id}>
                  <td><code>{s.reference}</code></td>
                  <td>{s.type}</td>
                  <td>{s.status}</td>
                  <td>{s.currency} {Number(s.amount).toLocaleString()}</td>
                  <td>{s.externalRef || '—'}</td>
                  <td>{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
