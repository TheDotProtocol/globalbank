'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search, Users, DollarSign, CheckCircle, XCircle, Eye, Plus,
  CreditCard, FileText, Shield, Mail, Phone, Copy, ExternalLink,
  Banknote, Building, AlertTriangle,
} from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Branch { id: string; name: string; country: string; city: string; }
interface UserRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  kycStatus: string;
  emailVerified: boolean;
  createdAt: string;
  totalBalance: number;
  totalCards: number;
  accounts: { id: string; accountNumber: string; accountType: string; cards: { length?: number }[] }[];
  kycDocuments: unknown[];
  branch?: Branch | null;
}

interface DashboardStats {
  totalUsers: number;
  totalCards: number;
  pendingKYC: number;
  totalTransactions: number;
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="dashboard-loading-wrap"><div className="dashboard-spinner" /></div>}>
      <AdminDashboard />
    </Suspense>
  );
}

function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [kycFilter, setKycFilter] = useState('');
  const branchFilter = searchParams.get('branchId') || '';
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [error, setError] = useState('');
  const hasLoadedOnce = useRef(false);
  const [manualEntry, setManualEntry] = useState({
    userId: '', accountId: '', amount: '', type: 'CREDIT', description: '', adminNote: '',
  });

  useEffect(() => {
    const controller = new AbortController();
    const showSpinner = !hasLoadedOnce.current;

    async function load() {
      const token = sessionStorage.getItem('adminSessionToken');
      if (!token) return;

      if (showSpinner) setLoading(true);
      else setRefreshing(true);
      setError('');

      try {
        const headers = getAdminHeaders();
        const userParams = new URLSearchParams({ limit: '100', lite: '1' });
        if (branchFilter) userParams.set('branchId', branchFilter);
        if (kycFilter) userParams.set('kycStatus', kycFilter);

        const fetchOpts = { headers, signal: controller.signal };

        // Sequential fetches reduce simultaneous DB connections on Supabase pooler
        const usersRes = await fetch(`/api/admin/users?${userParams}`, fetchOpts);
        if (controller.signal.aborted) return;

        if (usersRes.status === 401) {
          router.replace('/admin/login');
          return;
        }

        const errors: string[] = [];

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.users || []);
        } else {
          errors.push('users');
        }

        const statsRes = await fetch('/api/admin/dashboard', fetchOpts);
        if (controller.signal.aborted) return;
        if (statsRes.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (statsRes.ok) setStats(await statsRes.json());
        else errors.push('stats');

        const branchesRes = await fetch('/api/admin/branches', fetchOpts);
        if (controller.signal.aborted) return;
        if (branchesRes.status === 401) {
          router.replace('/admin/login');
          return;
        }
        if (branchesRes.ok) {
          const brData = await branchesRes.json();
          setBranches(brData.branches || []);
        } else {
          errors.push('branches');
        }

        if (errors.length === 3) {
          setError('Failed to load dashboard data. Please refresh the page.');
        } else if (errors.length > 0) {
          setError(`Some dashboard data could not be loaded (${errors.join(', ')}).`);
        }
      } catch (e) {
        if (controller.signal.aborted) return;
        if (e instanceof Error && e.name === 'AbortError') return;
        console.error('Dashboard fetch error:', e);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        if (!controller.signal.aborted) {
          hasLoadedOnce.current = true;
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    load();
    return () => controller.abort();
  }, [branchFilter, kycFilter, router]);

  const refreshData = async () => {
    const token = sessionStorage.getItem('adminSessionToken');
    if (!token) return;
    const headers = getAdminHeaders();
    const userParams = new URLSearchParams({ limit: '100', lite: '1' });
    if (branchFilter) userParams.set('branchId', branchFilter);
    if (kycFilter) userParams.set('kycStatus', kycFilter);
    const usersRes = await fetch(`/api/admin/users?${userParams}`, { headers });
    if (usersRes.ok) {
      const data = await usersRes.json();
      setUsers(data.users || []);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(t) ||
      user.lastName.toLowerCase().includes(t) ||
      user.email.toLowerCase().includes(t) ||
      user.phone?.toLowerCase().includes(t) ||
      user.accounts.some((a) => a.accountNumber.includes(searchTerm))
    );
  });

  const totalBalance = users.reduce((s, u) => s + u.totalBalance, 0);

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/manual-entry', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(manualEntry),
    });
    if (res.ok) {
      setShowManualEntry(false);
      setManualEntry({ userId: '', accountId: '', amount: '', type: 'CREDIT', description: '', adminNote: '' });
      refreshData();
    }
  };

  const updateKYCStatus = async (userId: string, status: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify({ userId, kycStatus: status }),
    });
    if (res.ok) refreshData();
  };

  const triggerInterest = async () => {
    const res = await fetch('/api/admin/calculate-interest', { method: 'POST', headers: getAdminHeaders() });
    const data = await res.json();
    alert(res.ok ? `✅ ${data.message}` : `❌ ${data.error}`);
    if (res.ok) refreshData();
  };

  const kycBadge = (status: string) => {
    if (status === 'VERIFIED') return 'dashboard-badge-success';
    if (status === 'PENDING') return 'dashboard-badge-warning';
    return 'dashboard-badge-danger';
  };

  return (
    <AdminLayout title="Admin Dashboard">
      {loading ? (
        <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /><p>Loading dashboard...</p></div>
      ) : (
        <>
          {error && <div className="dashboard-alert dashboard-alert-warning">{error}</div>}
          {refreshing && <p className="dashboard-page-subtitle" style={{ marginBottom: '1rem', opacity: 0.7 }}>Refreshing...</p>}
          <p className="dashboard-page-subtitle" style={{ marginBottom: '1.5rem' }}>
            Manage users, branches, compliance, and system operations
          </p>

          <div className="dashboard-stats-grid">
            <div className="dashboard-stat-card">
              <Users className="dashboard-stat-icon" />
              <span className="dashboard-stat-label">Total Users</span>
              <span className="dashboard-stat-value">{stats?.totalUsers ?? users.length}</span>
            </div>
            <div className="dashboard-stat-card">
              <DollarSign className="dashboard-stat-icon" />
              <span className="dashboard-stat-label">Total Balance</span>
              <span className="dashboard-stat-value">${totalBalance.toLocaleString()}</span>
            </div>
            <div className="dashboard-stat-card">
              <CheckCircle className="dashboard-stat-icon" />
              <span className="dashboard-stat-label">Pending KYC</span>
              <span className="dashboard-stat-value">{stats?.pendingKYC ?? 0}</span>
            </div>
            <div className="dashboard-stat-card">
              <CreditCard className="dashboard-stat-icon" />
              <span className="dashboard-stat-label">Total Cards</span>
              <span className="dashboard-stat-value">{stats?.totalCards ?? 0}</span>
            </div>
          </div>

          <div className="dashboard-quick-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
            <button type="button" className="dashboard-btn dashboard-btn-secondary" onClick={triggerInterest}>
              <Banknote size={16} /> Trigger Interest
            </button>
            <button type="button" className="dashboard-btn dashboard-btn-secondary" onClick={() => setShowManualEntry(true)}>
              <Plus size={16} /> Manual Entry
            </button>
            <Link href="/admin/users" className="dashboard-btn dashboard-btn-secondary">
              <Users size={16} /> All Users
            </Link>
            <Link href="/admin/compliance" className="dashboard-btn dashboard-btn-secondary">
              <AlertTriangle size={16} /> Compliance
            </Link>
            <Link href="/admin/branches" className="dashboard-btn dashboard-btn-secondary">
              <Building size={16} /> Branches
            </Link>
            <Link href="/admin/corporate-bank" className="dashboard-btn dashboard-btn-secondary">
              <Building size={16} /> Corporate Bank
            </Link>
          </div>

          <div className="dashboard-card" style={{ padding: '1.25rem' }}>
            <div className="dashboard-filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                  className="dashboard-input"
                  style={{ paddingLeft: 36, width: '100%' }}
                  placeholder="Search name, email, phone, account..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select className="dashboard-input" value={kycFilter} onChange={(e) => setKycFilter(e.target.value)}>
                <option value="">All KYC</option>
                <option value="PENDING">Pending</option>
                <option value="VERIFIED">Verified</option>
                <option value="REJECTED">Rejected</option>
              </select>
              <select
                className="dashboard-input"
                value={branchFilter}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (e.target.value) params.set('branchId', e.target.value);
                  else params.delete('branchId');
                  const qs = params.toString();
                  router.replace(qs ? `/admin?${qs}` : '/admin');
                }}
              >
                <option value="">All Branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            <h2 className="dashboard-section-title" style={{ marginBottom: '1rem' }}>
              User Management ({filteredUsers.length})
            </h2>

            <div className="dashboard-tx-list">
              {filteredUsers.length === 0 ? (
                <p className="dashboard-empty-text">No users found.</p>
              ) : filteredUsers.map((user) => (
                <div key={user.id} className="dashboard-tx-item">
                  <div className="dashboard-tx-item-left">
                    <div className="dashboard-tx-detail-icon">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="dashboard-tx-item-title">{user.firstName} {user.lastName}</p>
                      <p className="dashboard-tx-item-meta">
                        <Mail size={12} style={{ display: 'inline' }} /> {user.email}
                        {user.emailVerified && <Shield size={12} style={{ display: 'inline', marginLeft: 6 }} />}
                      </p>
                      {user.phone && <p className="dashboard-tx-item-meta"><Phone size={12} style={{ display: 'inline' }} /> {user.phone}</p>}
                      {user.branch && <p className="dashboard-tx-item-meta">{user.branch.city}, {user.branch.country}</p>}
                      <p className="dashboard-tx-item-meta">
                        {user.accounts.map((a) => a.accountNumber).join(' · ')}
                      </p>
                    </div>
                  </div>
                  <div className="dashboard-tx-item-right" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                    <span className="dashboard-tx-item-amount">${user.totalBalance.toLocaleString()}</span>
                    <span className={`dashboard-badge ${kycBadge(user.kycStatus)}`}>{user.kycStatus}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Link href={`/admin/users/${user.id}`} className="dashboard-btn dashboard-btn-primary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}>
                        <ExternalLink size={14} /> Full Account
                      </Link>
                      {user.kycStatus === 'PENDING' && (
                        <>
                          <button type="button" className="dashboard-btn dashboard-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                            onClick={() => updateKYCStatus(user.id, 'VERIFIED')}>
                            <CheckCircle size={14} /> Verify
                          </button>
                          <button type="button" className="dashboard-btn" style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', background: '#dc2626', color: '#fff' }}
                            onClick={() => updateKYCStatus(user.id, 'REJECTED')}>
                            <XCircle size={14} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showManualEntry && (
        <div className="dashboard-modal-overlay">
          <div className="dashboard-modal-backdrop" onClick={() => setShowManualEntry(false)} />
          <div className="dashboard-modal" style={{ maxWidth: 480 }}>
            <div className="dashboard-modal-header">
              <h2 className="dashboard-modal-title">Manual Transaction Entry</h2>
              <button type="button" onClick={() => setShowManualEntry(false)} className="dashboard-icon-btn"><XCircle size={20} /></button>
            </div>
            <form onSubmit={handleManualEntry} className="dashboard-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input className="dashboard-input" placeholder="User ID" value={manualEntry.userId} onChange={(e) => setManualEntry((p) => ({ ...p, userId: e.target.value }))} required />
              <input className="dashboard-input" placeholder="Account ID" value={manualEntry.accountId} onChange={(e) => setManualEntry((p) => ({ ...p, accountId: e.target.value }))} required />
              <input className="dashboard-input" type="number" step="0.01" placeholder="Amount" value={manualEntry.amount} onChange={(e) => setManualEntry((p) => ({ ...p, amount: e.target.value }))} required />
              <select className="dashboard-input" value={manualEntry.type} onChange={(e) => setManualEntry((p) => ({ ...p, type: e.target.value }))}>
                <option value="CREDIT">Credit</option>
                <option value="DEBIT">Debit</option>
              </select>
              <input className="dashboard-input" placeholder="Description" value={manualEntry.description} onChange={(e) => setManualEntry((p) => ({ ...p, description: e.target.value }))} required />
              <textarea className="dashboard-input" placeholder="Admin note" rows={2} value={manualEntry.adminNote} onChange={(e) => setManualEntry((p) => ({ ...p, adminNote: e.target.value }))} />
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" className="dashboard-btn dashboard-btn-secondary" onClick={() => setShowManualEntry(false)}>Cancel</button>
                <button type="submit" className="dashboard-btn dashboard-btn-primary">Create Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
