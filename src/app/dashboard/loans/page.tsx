'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardPageShell from '@/components/layout/DashboardPageShell';

export default function LoansPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({ productId: '', accountId: '', amount: '', termMonths: '12', purpose: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    fetch('/api/loans/products', { headers }).then((r) => r.json()).then((d) => setProducts(d.products ?? []));
    fetch('/api/loans/apply', { headers }).then((r) => r.json()).then((d) => setApplications(d.applications ?? []));
    fetch('/api/user/accounts', { headers }).then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const token = localStorage.getItem('token');
    const res = await fetch('/api/loans/apply', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: form.productId,
        accountId: form.accountId,
        requestedAmount: parseFloat(form.amount),
        termMonths: parseInt(form.termMonths, 10),
        purpose: form.purpose,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setMessage('Application submitted for credit review.');
      setApplications((prev) => [data.application, ...prev]);
    } else {
      setMessage(data.error || 'Failed to submit');
    }
  };

  return (
    <DashboardPageShell activeTab="loans" title="Loans" subtitle="Apply for regulated credit products (BVI / Labuan)">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form onSubmit={submit} className="dashboard-card space-y-4">
          <h3 className="font-semibold">New loan application</h3>
          <select className="dashboard-form-input" required value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
            <option value="">Select product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.jurisdiction})</option>
            ))}
          </select>
          <select className="dashboard-form-input" required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
            <option value="">Disbursement account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.accountNumber} ({a.currency})</option>
            ))}
          </select>
          <input className="dashboard-form-input" type="number" placeholder="Amount" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="dashboard-form-input" type="number" placeholder="Term (months)" required value={form.termMonths} onChange={(e) => setForm({ ...form, termMonths: e.target.value })} />
          <input className="dashboard-form-input" placeholder="Purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} />
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Submitting…' : 'Submit application'}</button>
          {message && <p className="text-sm text-gray-600">{message}</p>}
        </form>

        <div className="dashboard-card">
          <h3 className="font-semibold mb-3">Your applications</h3>
          <ul className="space-y-3 text-sm">
            {applications.length === 0 && <li className="text-gray-500">No applications yet</li>}
            {applications.map((a) => (
              <li key={a.id} className="border-b pb-2">
                <div className="font-medium">{a.reference}</div>
                <div>{a.product?.name} — ${Number(a.requestedAmount).toLocaleString()}</div>
                <div className="text-gray-500">Status: {a.status}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DashboardPageShell>
  );
}
