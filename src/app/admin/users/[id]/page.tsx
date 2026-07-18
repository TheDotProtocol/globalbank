'use client';

import { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Wallet, Globe, AlertTriangle, Save, KeyRound } from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

export default function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'accounts' | 'transactions' | 'cards' | 'kyc' | 'credentials'>('accounts');
  const [txType, setTxType] = useState('');
  const [txStatus, setTxStatus] = useState('');
  const [txSearch, setTxSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
  });

  const loadUser = async () => {
    setLoading(true);
    setError('');
    const res = await fetch(`/api/admin/users/${id}`, { headers: getAdminHeaders() });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || json.details || 'Failed to load user');
      setData(null);
    } else {
      setData(json);
      setForm({
        firstName: json.user.firstName || '',
        lastName: json.user.lastName || '',
        email: json.user.email || '',
        phone: json.user.phone || '',
        password: '',
      });
    }
    setLoading(false);
  };

  useEffect(() => { loadUser(); }, [id]);

  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];
    return data.transactions.filter((tx: any) => {
      if (txType && tx.type !== txType) return false;
      if (txStatus && tx.status !== txStatus) return false;
      if (txSearch) {
        const t = txSearch.toLowerCase();
        return (
          tx.description?.toLowerCase().includes(t) ||
          tx.reference?.toLowerCase().includes(t) ||
          tx.utr?.toLowerCase().includes(t)
        );
      }
      return true;
    });
  }, [data?.transactions, txType, txStatus, txSearch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    const payload: Record<string, string> = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    };
    if (form.password) payload.password = form.password;

    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (res.ok) {
      setSaveMsg('User updated successfully');
      setForm((p) => ({ ...p, password: '' }));
      await loadUser();
    } else {
      setSaveMsg(json.error || 'Update failed');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout title="User Details">
        <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /><p>Loading user...</p></div>
      </AdminLayout>
    );
  }

  if (!data?.user) {
    return (
      <AdminLayout title="User Error">
        <Link href="/admin/users" className="dashboard-btn dashboard-btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Users
        </Link>
        <div className="dashboard-alert dashboard-alert-warning">{error || 'User not found'}</div>
      </AdminLayout>
    );
  }

  const { user, accounts, kycDocuments, fixedDeposits, internationalTransfers } = data;

  return (
    <AdminLayout title={`${user.firstName} ${user.lastName}`}>
      <Link href="/admin/users" className="dashboard-btn dashboard-btn-secondary" style={{ marginBottom: '1rem', display: 'inline-flex', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back to Users
      </Link>

      <div className="dashboard-card" style={{ padding: '1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user.firstName} {user.lastName}</h2>
            <p className="dashboard-tx-item-meta">{user.email} · {user.phone || 'No phone'}</p>
            <p className="dashboard-tx-item-meta">
              Branch: {user.branch?.name || 'Unassigned'} · KYC: {user.kycStatus}
            </p>
            <p className="dashboard-tx-item-meta" style={{ fontSize: '0.8rem', opacity: 0.7 }}>ID: {user.id}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>${user.totalBalance?.toLocaleString()}</p>
            <p className="dashboard-tx-item-meta">Total Balance · {data.transactions?.length || 0} transactions</p>
            {user.flaggedTransactionCount > 0 && (
              <span className="dashboard-badge dashboard-badge-warning" style={{ marginTop: 4 }}>
                <AlertTriangle size={12} /> {user.flaggedTransactionCount} flagged
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {(['accounts', 'transactions', 'cards', 'kyc', 'credentials'] as const).map((tab) => (
          <button key={tab} type="button" className={`dashboard-btn ${activeTab === tab ? 'dashboard-btn-primary' : 'dashboard-btn-secondary'}`}
            onClick={() => setActiveTab(tab)} style={{ textTransform: 'capitalize' }}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div className="dashboard-card">
          {accounts.map((acc: any) => (
            <div key={acc.id} className="dashboard-tx-item">
              <div><Wallet size={18} /><strong style={{ marginLeft: 8 }}>{acc.accountNumber}</strong> ({acc.accountType})</div>
              <span>${Number(acc.balance).toLocaleString()} {acc.currency}</span>
            </div>
          ))}
          {fixedDeposits?.length > 0 && (
            <div style={{ padding: '1rem', borderTop: '1px solid var(--border-light)' }}>
              <h4>Fixed Deposits</h4>
              {fixedDeposits.map((fd: any) => (
                <p key={fd.id} className="dashboard-tx-item-meta">${Number(fd.amount).toLocaleString()} · {fd.status}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'cards' && (
        <div className="dashboard-card">
          {accounts.flatMap((a: any) => a.cards).length === 0 ? (
            <p className="dashboard-empty-text">No cards.</p>
          ) : accounts.flatMap((a: any) => a.cards).map((card: any) => (
            <div key={card.id} className="dashboard-tx-item">
              <div><CreditCard size={18} /><span style={{ marginLeft: 8 }}>{card.cardNumber}</span></div>
              <span>{card.cardType} · {card.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="dashboard-card">
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <input className="dashboard-input" placeholder="Search description, UTR, reference..." value={txSearch} onChange={(e) => setTxSearch(e.target.value)} style={{ flex: 1, minWidth: 200 }} />
            <select className="dashboard-input" value={txType} onChange={(e) => setTxType(e.target.value)}>
              <option value="">All Types</option>
              <option value="CREDIT">Credit</option>
              <option value="DEBIT">Debit</option>
            </select>
            <select className="dashboard-input" value={txStatus} onChange={(e) => setTxStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          {filteredTransactions.length === 0 ? (
            <p className="dashboard-empty-text">No transactions match filter.</p>
          ) : filteredTransactions.map((tx: any) => (
            <div key={tx.id} className="dashboard-tx-item">
              <div>
                <p>{tx.description}</p>
                <p className="dashboard-tx-item-meta">
                  {new Date(tx.createdAt).toLocaleString()} · {tx.type} · {tx.status}
                  {tx.utr && ` · UTR: ${tx.utr}`}
                </p>
                {tx.complianceStatus && tx.complianceStatus !== 'CLEAR' && (
                  <span className="dashboard-badge dashboard-badge-warning">{tx.complianceStatus} — {tx.flagReason}</span>
                )}
              </div>
              <span className="dashboard-tx-item-amount">{tx.type === 'CREDIT' ? '+' : '-'}${tx.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kyc' && (
        <div className="dashboard-card">
          {kycDocuments.length === 0 ? (
            <p className="dashboard-empty-text">No KYC documents.</p>
          ) : kycDocuments.map((doc: any) => (
            <div key={doc.id} className="dashboard-tx-item">
              <span>{doc.documentType} — {doc.status}</span>
              <span className="dashboard-tx-item-meta">{doc.fileName}</span>
            </div>
          ))}
          {internationalTransfers?.length > 0 && (
            <div style={{ padding: '1rem' }}>
              <h4><Globe size={16} /> International Transfers</h4>
              {internationalTransfers.map((t: any) => (
                <p key={t.id} className="dashboard-tx-item-meta">${Number(t.amount)} → {t.beneficiaryName} ({t.status})</p>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'credentials' && (
        <div className="dashboard-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <KeyRound size={18} /> Reset Credentials
          </h3>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 480 }}>
            <input className="dashboard-input" placeholder="First name" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} required />
            <input className="dashboard-input" placeholder="Last name" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} required />
            <input className="dashboard-input" type="email" placeholder="Email (login)" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
            <input className="dashboard-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            <input className="dashboard-input" type="password" placeholder="New password (leave blank to keep current)" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
            {saveMsg && <p className="dashboard-tx-item-meta" style={{ color: saveMsg.includes('success') ? '#059669' : '#dc2626' }}>{saveMsg}</p>}
            <button type="submit" className="dashboard-btn dashboard-btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
