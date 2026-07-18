'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Users, ExternalLink, Mail, Phone } from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Branch { id: string; name: string; country: string; city: string; }
interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  kycStatus: string;
  totalBalance: number;
  totalCards: number;
  totalTransactions: number;
  branch?: Branch | null;
  accounts: { accountNumber: string }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError('');
      try {
        const headers = getAdminHeaders();
        const params = new URLSearchParams({ limit: '100' });
        if (search) params.set('search', search);
        if (kycFilter) params.set('kycStatus', kycFilter);
        if (branchFilter) params.set('branchId', branchFilter);

        const usersRes = await fetch(`/api/admin/users?${params}`, { headers, signal: controller.signal });
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users || []);
        } else {
          setError('Failed to load users');
        }

        const brRes = await fetch('/api/admin/branches', { headers, signal: controller.signal });
        if (brRes.ok) {
          const data = await brRes.json();
          setBranches(data.branches || []);
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError('Failed to load users');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    const timer = setTimeout(load, search ? 300 : 0);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [search, kycFilter, branchFilter]);

  const kycBadge = (status: string) => {
    if (status === 'VERIFIED') return 'dashboard-badge-success';
    if (status === 'PENDING') return 'dashboard-badge-warning';
    return 'dashboard-badge-danger';
  };

  return (
    <AdminLayout title="User Management">
      <p className="dashboard-page-subtitle" style={{ marginBottom: '1.5rem' }}>
        View all users, account details, transactions, and reset credentials
      </p>

      <div className="dashboard-card" style={{ padding: '1.25rem' }}>
        <div className="dashboard-filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input
              className="dashboard-input"
              style={{ paddingLeft: 36, width: '100%' }}
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="dashboard-input" value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
            <option value="">All KYC</option>
            <option value="PENDING">Pending</option>
            <option value="VERIFIED">Verified</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select className="dashboard-input" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
            <option value="">All Branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /></div>
        ) : error ? (
          <div className="dashboard-alert dashboard-alert-warning">{error}</div>
        ) : users.length === 0 ? (
          <p className="dashboard-empty-text">No users found.</p>
        ) : (
          <>
            <h2 className="dashboard-section-title" style={{ marginBottom: '1rem' }}>
              All Users ({users.length})
            </h2>
            <div className="dashboard-tx-list">
              {users.map((user) => (
                <div key={user.id} className="dashboard-tx-item">
                  <div className="dashboard-tx-item-left">
                    <div className="dashboard-tx-detail-icon"><Users size={18} /></div>
                    <div>
                      <p className="dashboard-tx-item-title">{user.firstName} {user.lastName}</p>
                      <p className="dashboard-tx-item-meta"><Mail size={12} style={{ display: 'inline' }} /> {user.email}</p>
                      {user.phone && <p className="dashboard-tx-item-meta"><Phone size={12} style={{ display: 'inline' }} /> {user.phone}</p>}
                      <p className="dashboard-tx-item-meta">
                        {user.accounts.map((a) => a.accountNumber).join(' · ')}
                        {user.branch && ` · ${user.branch.city}`}
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-tx-item-right" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="dashboard-tx-item-amount">${user.totalBalance.toLocaleString()}</span>
                    <span className={`dashboard-badge ${kycBadge(user.kycStatus)}`}>{user.kycStatus}</span>
                    <span className="dashboard-tx-item-meta">{user.totalTransactions} txns · {user.totalCards} cards</span>
                    <Link href={`/admin/users/${user.id}`} className="dashboard-btn dashboard-btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                      <ExternalLink size={14} /> View Account
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
