'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Report {
  id: string;
  reportType: string;
  jurisdiction: string;
  status: string;
  reference: string;
  filedBy: string;
  filedAt: string | null;
  createdAt: string;
}

export default function RegulatoryPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [jurisdiction, setJurisdiction] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '100' });
        if (jurisdiction) params.set('jurisdiction', jurisdiction);
        const res = await fetch(`/api/admin/regulatory-reports?${params}`, { headers: getAdminHeaders() });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [jurisdiction]);

  async function submitReport(reportId: string) {
    const res = await fetch('/api/admin/regulatory-reports', {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ reportId, action: 'SUBMIT' }),
    });
    if (res.ok) {
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: 'SUBMITTED', filedAt: new Date().toISOString() } : r))
      );
    }
  }

  return (
    <AdminLayout title="Regulatory Reports">
      <div className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, opacity: 0.85 }}>
          STR (India / RBI) and SAR (Thailand / BOT) suspicious transaction reports. Created when compliance officers file a REPORT action.
        </p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
        <select className="dashboard-form-input" value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All jurisdictions</option>
          <option value="IN">India (RBI / STR)</option>
          <option value="TH">Thailand (BOT / SAR)</option>
        </select>
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p>Loading reports…</p>
        ) : reports.length === 0 ? (
          <p>No regulatory reports yet. File from Compliance → REPORT action on flagged transactions.</p>
        ) : (
          <table className="dashboard-table" style={{ width: '100%', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th>Reference</th>
                <th>Type</th>
                <th>Jurisdiction</th>
                <th>Status</th>
                <th>Filed by</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td><code>{r.reference}</code></td>
                  <td>{r.reportType}</td>
                  <td>{r.jurisdiction}</td>
                  <td>{r.status}</td>
                  <td>{r.filedBy}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>
                    {r.status === 'PENDING_REVIEW' && (
                      <button type="button" className="dashboard-btn dashboard-btn-primary" onClick={() => submitReport(r.id)}>
                        Mark submitted
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
