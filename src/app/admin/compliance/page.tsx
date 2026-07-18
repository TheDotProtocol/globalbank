'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle, Pause, XCircle, Flag, Eye } from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Branch { id: string; name: string; country: string; city: string; }
interface ComplianceTx {
  id: string; amount: number; description: string; type: string;
  complianceStatus: string; complianceFlag: string | null; flagReason: string | null;
  riskScore: number; utr: string | null; createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
  branch: Branch | null; account: { accountNumber: string };
}

export default function CompliancePage() {
  const [transactions, setTransactions] = useState<ComplianceTx[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [branchId, setBranchId] = useState('');
  const [country, setCountry] = useState('');
  const [status, setStatus] = useState('FLAGGED');
  const [selected, setSelected] = useState<ComplianceTx | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const headers = getAdminHeaders();
        const params = new URLSearchParams({ status, limit: '100' });
        if (branchId) params.set('branchId', branchId);
        if (country) params.set('country', country);

        const txRes = await fetch(`/api/admin/compliance?${params}`, { headers });
        if (cancelled) return;
        if (txRes.status === 401) return;
        if (txRes.ok) {
          const data = await txRes.json();
          setTransactions(data.transactions);
          setStats(data.stats || {});
        }

        const brRes = await fetch('/api/admin/branches', { headers });
        if (cancelled) return;
        if (brRes.ok) {
          const data = await brRes.json();
          setBranches(data.branches);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [branchId, country, status, refreshKey]);

  const handleReview = async (action: string) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/compliance/${selected.id}`, {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        setSelected(null);
        setNotes('');
        setRefreshKey((k) => k + 1);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      FLAGGED: 'dashboard-badge-warning', UNDER_REVIEW: 'dashboard-badge-warning',
      APPROVED: 'dashboard-badge-success', ON_HOLD: 'dashboard-badge-warning',
      REJECTED: 'dashboard-badge-danger', REPORTED: 'dashboard-badge-danger', CLEAR: 'dashboard-badge-success',
    };
    return map[s] || 'dashboard-badge';
  };

  return (
    <AdminLayout title="Compliance Review">
      <div className="dashboard-stats-grid" style={{ marginBottom: '1.5rem' }}>
        {['FLAGGED', 'UNDER_REVIEW', 'ON_HOLD', 'REPORTED', 'APPROVED'].map((s) => (
          <button key={s} type="button" className={`dashboard-stat-card ${status === s ? 'active' : ''}`}
            onClick={() => setStatus(s)} style={{ cursor: 'pointer', textAlign: 'left' }}>
            <span className="dashboard-stat-label">{s.replace(/_/g, ' ')}</span>
            <span className="dashboard-stat-value">{stats[s] || 0}</span>
          </button>
        ))}
      </div>

      <div className="dashboard-filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <select className="dashboard-input" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
          <option value="">All Branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <input className="dashboard-input" placeholder="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} />
        <select className="dashboard-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="FLAGGED">Flagged</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="REPORTED">Reported</option>
          <option value="APPROVED">Approved</option>
          <option value="CLEAR">Clear</option>
        </select>
      </div>

      {loading ? (
        <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /></div>
      ) : (
        <div className="dashboard-card">
          <div className="dashboard-tx-list">
            {transactions.length === 0 ? (
              <p className="dashboard-empty-text">No transactions match this filter.</p>
            ) : transactions.map((tx) => (
              <div key={tx.id} className="dashboard-tx-item" style={{ cursor: 'pointer' }} onClick={() => setSelected(tx)}>
                <div className="dashboard-tx-item-left">
                  <AlertTriangle className={`h-5 w-5 ${tx.riskScore >= 40 ? 'text-red-500' : 'text-yellow-500'}`} />
                  <div>
                    <p className="dashboard-tx-item-title">{tx.description}</p>
                    <p className="dashboard-tx-item-meta">
                      {tx.user.firstName} {tx.user.lastName} · {tx.account.accountNumber}
                      {tx.branch && ` · ${tx.branch.city}, ${tx.branch.country}`}
                    </p>
                    {tx.flagReason && <p className="dashboard-tx-item-meta" style={{ color: '#f59e0b' }}>{tx.flagReason}</p>}
                  </div>
                </div>
                <div className="dashboard-tx-item-right">
                  <span className="dashboard-tx-item-amount">-${tx.amount.toLocaleString()}</span>
                  <span className={`dashboard-badge ${statusBadge(tx.complianceStatus)}`}>{tx.complianceStatus}</span>
                  <span className="dashboard-badge">Risk: {tx.riskScore}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-backdrop" onClick={() => setSelected(null)} />
          <div className="dashboard-modal" style={{ maxWidth: 560 }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Compliance Review</h2>
              <button type="button" onClick={() => setSelected(null)} className="dashboard-icon-btn"><XCircle className="h-5 w-5" /></button>
            </div>
            <div className="dashboard-tx-detail-body">
              <p><strong>Amount:</strong> ${selected.amount.toLocaleString()}</p>
              <p><strong>User:</strong> {selected.user.firstName} {selected.user.lastName} ({selected.user.email})</p>
              <p><strong>Flag:</strong> {selected.complianceFlag} — {selected.flagReason}</p>
              <p><strong>UTR:</strong> {selected.utr || 'N/A'}</p>
              <p><strong>Branch:</strong> {selected.branch?.name || 'Unassigned'}</p>
              <Link href={`/admin/users/${selected.user.id}`} className="dashboard-btn dashboard-btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Eye size={16} /> View Full Account
              </Link>
              <textarea className="dashboard-input" rows={3} placeholder="Review notes..." value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', marginTop: '1rem' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" className="dashboard-btn dashboard-btn-primary" disabled={actionLoading} onClick={() => handleReview('APPROVE')}>
                  <CheckCircle size={16} /> Approve
                </button>
                <button type="button" className="dashboard-btn dashboard-btn-secondary" disabled={actionLoading} onClick={() => handleReview('HOLD')}>
                  <Pause size={16} /> Hold
                </button>
                <button type="button" className="dashboard-btn dashboard-btn-secondary" disabled={actionLoading} onClick={() => handleReview('REPORT')}>
                  <Flag size={16} /> Report
                </button>
                <button type="button" className="dashboard-btn" style={{ background: '#dc2626', color: '#fff' }} disabled={actionLoading} onClick={() => handleReview('REJECT')}>
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
