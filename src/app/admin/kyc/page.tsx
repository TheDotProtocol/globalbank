'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Eye, Download, Check, X, FileText, Mail, Phone, ExternalLink } from 'lucide-react';
import AdminLayout, { getAdminHeaders } from '@/components/admin/AdminLayout';

interface KycDocument {
  id: string;
  userId: string;
  documentType: string;
  documentUrl: string;
  fileName?: string;
  fileSize?: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    kycStatus: string;
    branch?: { name: string; city: string; country: string } | null;
  };
}

export default function KycManagementPage() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchKycDocuments = async () => {
    try {
      const response = await fetch('/api/admin/kyc/documents', { headers: getAdminHeaders() });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKycDocuments(); }, []);

  const updateDocumentStatus = async (documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    const response = await fetch('/api/admin/kyc/update-document', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ documentId, status, notes }),
    });
    if (response.ok) {
      await fetchKycDocuments();
    }
  };

  const statusBadge = (status: string) => {
    if (status === 'VERIFIED') return 'dashboard-badge-success';
    if (status === 'PENDING') return 'dashboard-badge-warning';
    return 'dashboard-badge-danger';
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesFilter = filter === 'ALL' || doc.status === filter;
    const t = searchTerm.toLowerCase();
    const matchesSearch = !t ||
      doc.user.firstName.toLowerCase().includes(t) ||
      doc.user.lastName.toLowerCase().includes(t) ||
      doc.user.email.toLowerCase().includes(t) ||
      doc.documentType.toLowerCase().includes(t);
    return matchesFilter && matchesSearch;
  });

  return (
    <AdminLayout title="KYC Document Review">
      {loading ? (
        <div className="dashboard-loading-wrap"><div className="dashboard-spinner" /></div>
      ) : (
        <>
          <div className="dashboard-filters" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <input
              className="dashboard-input"
              style={{ flex: 1, minWidth: 200 }}
              placeholder="Search by name, email, document type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                className={`dashboard-btn ${filter === status ? 'dashboard-btn-primary' : 'dashboard-btn-secondary'}`}
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="dashboard-tx-list">
            {filteredDocuments.length === 0 ? (
              <p className="dashboard-empty-text">No KYC documents match your filters.</p>
            ) : filteredDocuments.map((doc) => (
              <div key={doc.id} className="dashboard-card dashboard-tx-item" style={{ padding: '1rem' }}>
                <div className="dashboard-tx-item-left">
                  <FileText size={20} />
                  <div>
                    <p className="dashboard-tx-item-title">
                      {doc.user.firstName} {doc.user.lastName}
                      <span className={`dashboard-badge ${statusBadge(doc.status)}`} style={{ marginLeft: 8 }}>{doc.status}</span>
                    </p>
                    <p className="dashboard-tx-item-meta"><Mail size={12} style={{ display: 'inline' }} /> {doc.user.email}</p>
                    <p className="dashboard-tx-item-meta">{doc.documentType.replace(/_/g, ' ')} · {doc.fileName || 'Document'}</p>
                    {doc.user.branch && <p className="dashboard-tx-item-meta">{doc.user.branch.name}</p>}
                    <p className="dashboard-tx-item-meta">{new Date(doc.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="dashboard-btn dashboard-btn-secondary" style={{ padding: '0.4rem 0.6rem' }}
                    onClick={() => window.open(doc.documentUrl, '_blank')}>
                    <Eye size={14} /> View
                  </button>
                  <Link href={`/admin/users/${doc.user.id}`} className="dashboard-btn dashboard-btn-secondary" style={{ padding: '0.4rem 0.6rem' }}>
                    <ExternalLink size={14} /> User
                  </Link>
                  {doc.status === 'PENDING' && (
                    <>
                      <button type="button" className="dashboard-btn dashboard-btn-primary" style={{ padding: '0.4rem 0.6rem' }}
                        onClick={() => updateDocumentStatus(doc.id, 'VERIFIED')}>
                        <Check size={14} /> Approve
                      </button>
                      <button type="button" className="dashboard-btn" style={{ padding: '0.4rem 0.6rem', background: '#dc2626', color: '#fff' }}
                        onClick={() => {
                          const reason = prompt('Rejection reason:');
                          if (reason) updateDocumentStatus(doc.id, 'REJECTED', reason);
                        }}>
                        <X size={14} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
