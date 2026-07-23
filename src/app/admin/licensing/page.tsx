'use client';

import { useEffect, useState } from 'react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface LicenseRow {
  id: string;
  jurisdiction: string;
  licenseType: string;
  status: string;
  regulatorName: string;
  capitalRequired: number;
  capitalHeld: number;
}

interface GovernanceRow {
  id: string;
  jurisdiction: string;
  role: string;
  holderName: string;
  holderEmail?: string;
}

export default function AdminLicensingPage() {
  const [licenses, setLicenses] = useState<LicenseRow[]>([]);
  const [governance, setGovernance] = useState<GovernanceRow[]>([]);
  const [capital, setCapital] = useState({ required: 0, held: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/licensing', { headers: getAdminHeaders() })
      .then((r) => r.json())
      .then((data) => {
        setLicenses(data.licenses ?? []);
        setGovernance(data.governance ?? []);
        setCapital({
          required: data.totalCapitalRequired ?? 0,
          held: data.totalCapitalHeld ?? 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Bank Licensing">
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Primary path: BVI FSC → Labuan FSA → Thailand / India expansion
      </p>

      {loading ? (
        <div className="dashboard-spinner" />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="dashboard-card">
              <h3 className="font-semibold mb-2">Regulatory capital</h3>
              <p className="text-2xl font-bold">${capital.required.toLocaleString()}</p>
              <p className="text-sm text-gray-500">Required (aggregate plan)</p>
              <p className="text-lg mt-2">${capital.held.toLocaleString()} held</p>
            </div>
            <div className="dashboard-card">
              <h3 className="font-semibold mb-2">Application strategy</h3>
              <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                <li>1. BVI banking license (FSC) — primary entity</li>
                <li>2. Labuan DIB — ASEAN hub</li>
                <li>3. Thailand / India — passporting post-licence</li>
              </ul>
            </div>
          </div>

          <h3 className="font-semibold mb-3">Licenses</h3>
          <div className="dashboard-card overflow-x-auto mb-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Jurisdiction</th>
                  <th>Type</th>
                  <th>Regulator</th>
                  <th>Status</th>
                  <th>Capital req.</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((l) => (
                  <tr key={l.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 font-medium">{l.jurisdiction}</td>
                    <td>{l.licenseType}</td>
                    <td>{l.regulatorName}</td>
                    <td>{l.status}</td>
                    <td>${Number(l.capitalRequired).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold mb-3">Governance &amp; key officers</h3>
          <div className="dashboard-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Jurisdiction</th>
                  <th>Role</th>
                  <th>Holder</th>
                </tr>
              </thead>
              <tbody>
                {governance.map((g) => (
                  <tr key={g.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2">{g.jurisdiction}</td>
                    <td>{g.role.replace(/_/g, ' ')}</td>
                    <td>{g.holderName}</td>
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
