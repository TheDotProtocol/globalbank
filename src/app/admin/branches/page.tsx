'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, ArrowRight } from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface Branch {
  id: string; name: string; country: string; city: string; address: string;
  region: string | null; isHQ: boolean; userCount: number; transactionCount: number;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/branches', { headers: getAdminHeaders() })
      .then((r) => r.json())
      .then((d) => setBranches(d.branches || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Global Branches">
      {loading ? (
        <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {branches.map((b) => (
            <div key={b.id} className="dashboard-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Building2 className="h-6 w-6" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {b.name} {b.isHQ && <span className="dashboard-badge dashboard-badge-success" style={{ marginLeft: 6 }}>HQ</span>}
                  </h3>
                  <p className="dashboard-tx-item-meta">{b.city}, {b.country}</p>
                  <p className="dashboard-tx-item-meta" style={{ marginTop: 4 }}>{b.address}</p>
                  {b.region && <p className="dashboard-tx-item-meta">{b.region}</p>}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                    <span><Users size={14} style={{ display: 'inline' }} /> {b.userCount} users</span>
                    <span>{b.transactionCount} transactions</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <Link href={`/admin?branchId=${b.id}`} className="dashboard-btn dashboard-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                      Users <ArrowRight size={14} />
                    </Link>
                    <Link href={`/admin/compliance?branchId=${b.id}`} className="dashboard-btn dashboard-btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
                      Compliance <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
