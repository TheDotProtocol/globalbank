'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

export default function AdminReconciliationPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/reconciliation', { headers: getAdminHeaders() }).then((r) => r.json()),
      fetch('/api/admin/safeguarding', { headers: getAdminHeaders() }).then((r) => r.json()),
    ])
      .then(([recon, safe]) => setData({ ...recon, safeguarding: safe }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const runReconciliation = async () => {
    setRunning(true);
    await fetch('/api/admin/reconciliation', { method: 'POST', headers: getAdminHeaders() });
    load();
    setRunning(false);
  };

  return (
    <AdminLayout title="Ledger Reconciliation & Safeguarding">
      <div className="flex gap-2 mb-6">
        <button type="button" className="btn-primary" onClick={runReconciliation} disabled={running}>
          {running ? 'Running…' : 'Run reconciliation'}
        </button>
        <button type="button" className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {loading || !data ? (
        <div className="dashboard-spinner" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="dashboard-card">
              <h3 className="text-sm text-gray-500">Customer liabilities</h3>
              <p className="text-2xl font-bold">${Number(data.customerLiabilities ?? 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-card">
              <h3 className="text-sm text-gray-500">Safeguarded assets</h3>
              <p className="text-2xl font-bold">${Number(data.safeguardedAssets ?? 0).toLocaleString()}</p>
            </div>
            <div className="dashboard-card">
              <h3 className="text-sm text-gray-500">Latest GL variance</h3>
              <p className={`text-2xl font-bold ${data.latest?.status === 'OK' ? 'text-green-600' : 'text-red-600'}`}>
                {data.latest ? `$${Number(data.latest.variance).toFixed(2)} (${data.latest.status})` : 'Not run yet'}
              </p>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Safeguarding accounts</h3>
          <div className="dashboard-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Jurisdiction</th>
                  <th>Bank</th>
                  <th>Account</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {(data.safeguarding?.accounts ?? []).map((a: any) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2">{a.jurisdiction}</td>
                    <td>{a.bankName}</td>
                    <td>{a.accountNumber}</td>
                    <td>{a.currency} {Number(a.balance).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
