'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface AmlCaseRow {
  id: string;
  reference: string;
  title: string;
  status: string;
  priority: string;
  sanctionsHit: boolean;
  fraudScore: number;
  openedAt: string;
  user?: { firstName: string; lastName: string; email: string };
}

export default function AdminAmlCasesPage() {
  const [cases, setCases] = useState<AmlCaseRow[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/aml-cases?status=${statusFilter}`, { headers: getAdminHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setCases(data.cases ?? []);
        setStats(data.stats ?? {});
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const updateCase = async (id: string, status: string) => {
    await fetch(`/api/admin/aml-cases/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ status, assignee: 'COMPLIANCE' }),
    });
    load();
  };

  return (
    <AdminLayout title="AML Cases">
      <div className="flex flex-wrap gap-2 mb-4">
        {['OPEN', 'INVESTIGATING', 'ESCALATED', 'SAR_FILED', 'CLOSED', 'all'].map((s) => (
          <button
            key={s}
            type="button"
            className={statusFilter === s ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setStatusFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="dashboard-card text-center"><div className="text-2xl font-bold">{stats.open ?? 0}</div><div className="text-xs">Open</div></div>
        <div className="dashboard-card text-center"><div className="text-2xl font-bold">{stats.investigating ?? 0}</div><div className="text-xs">Investigating</div></div>
        <div className="dashboard-card text-center"><div className="text-2xl font-bold">{stats.escalated ?? 0}</div><div className="text-xs">Escalated</div></div>
        <div className="dashboard-card text-center"><div className="text-2xl font-bold">{stats.sanctions ?? 0}</div><div className="text-xs">Sanctions</div></div>
      </div>

      {loading ? (
        <div className="dashboard-spinner" />
      ) : (
        <div className="dashboard-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">Reference</th>
                <th>Title</th>
                <th>Customer</th>
                <th>Priority</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-2 font-mono text-xs">{c.reference}</td>
                  <td>{c.title}{c.sanctionsHit && ' ⚠️'}</td>
                  <td>{c.user ? `${c.user.firstName} ${c.user.lastName}` : '—'}</td>
                  <td>{c.priority}</td>
                  <td>{c.fraudScore}</td>
                  <td className="space-x-1">
                    {c.status === 'OPEN' && (
                      <button type="button" className="btn-secondary text-xs" onClick={() => updateCase(c.id, 'INVESTIGATING')}>Investigate</button>
                    )}
                    {c.status !== 'CLOSED' && (
                      <>
                        <button type="button" className="btn-secondary text-xs" onClick={() => updateCase(c.id, 'ESCALATED')}>Escalate</button>
                        <button type="button" className="btn-primary text-xs" onClick={() => updateCase(c.id, 'SAR_FILED')}>File SAR</button>
                        <button type="button" className="btn-secondary text-xs" onClick={() => updateCase(c.id, 'CLOSED')}>Close</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
