'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface AuditEntry {
  id: string;
  actorType: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: '200' });
        if (actionFilter) params.set('action', actionFilter);
        const res = await fetch(`/api/admin/audit-logs?${params}`, { headers: getAdminHeaders() });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [actionFilter]);

  return (
    <AdminLayout title="Audit Log">
      <div className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, opacity: 0.85 }}>
          Immutable audit trail for admin, compliance, and user actions. Required for RBI / Bank of Thailand examinations.
        </p>
      </div>

      <div className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <input
          className="dashboard-form-input"
          placeholder="Filter by action (e.g. LOGIN_SUCCESS, MANUAL_ENTRY_APPROVED)"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{ maxWidth: 480 }}
        />
      </div>

      <div className="dashboard-card">
        {loading ? (
          <p>Loading audit logs…</p>
        ) : logs.length === 0 ? (
          <p>No audit entries yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="dashboard-table" style={{ width: '100%', fontSize: '0.875rem' }}>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.actorEmail || log.actorId || log.actorType}</td>
                    <td><code>{log.action}</code></td>
                    <td>{log.entityType}{log.entityId ? ` / ${log.entityId.slice(0, 8)}…` : ''}</td>
                    <td>{log.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
