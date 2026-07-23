'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

export default function AdminLendingPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/lending?status=SUBMITTED', { headers: getAdminHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setApplications(data.applications ?? []);
        setLoans(data.loans ?? []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const review = async (applicationId: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/lending', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({
        applicationId,
        action,
        reviewedBy: sessionStorage.getItem('adminUsername') ?? 'ADMIN',
        reviewNotes: action === 'approve' ? 'Approved per credit policy' : 'Declined',
      }),
    });
    load();
  };

  return (
    <AdminLayout title="Lending">
      {loading ? (
        <div className="dashboard-spinner" />
      ) : (
        <>
          <h3 className="font-semibold mb-3">Pending applications</h3>
          <div className="dashboard-card overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Ref</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Term</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.filter((a) => a.status === 'SUBMITTED' || a.status === 'UNDER_REVIEW').map((a) => (
                  <tr key={a.id} className="border-b">
                    <td className="py-2 font-mono text-xs">{a.reference}</td>
                    <td>{a.user?.email}</td>
                    <td>{a.product?.name}</td>
                    <td>${Number(a.requestedAmount).toLocaleString()}</td>
                    <td>{a.termMonths} mo</td>
                    <td className="space-x-1">
                      <button type="button" className="btn-primary text-xs" onClick={() => review(a.id, 'approve')}>Approve</button>
                      <button type="button" className="btn-secondary text-xs" onClick={() => review(a.id, 'reject')}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold mb-3">Active loans</h3>
          <div className="dashboard-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Reference</th>
                  <th>Customer</th>
                  <th>Outstanding</th>
                  <th>APR</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((l) => (
                  <tr key={l.id} className="border-b">
                    <td className="py-2">{l.reference}</td>
                    <td>{l.user?.email}</td>
                    <td>${Number(l.outstanding).toLocaleString()}</td>
                    <td>{Number(l.apr)}%</td>
                    <td>{l.status}</td>
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
