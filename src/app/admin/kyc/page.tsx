'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Download, Check, X, Clock, FileText, User, Mail, Phone } from 'lucide-react';

interface KycDocument {
  id: string;
  userId: string;
  documentType: string;
  fileUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  notes?: string;
  isActive: boolean;
  version: number;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    kycStatus: string;
  };
}

export default function KycManagementPage() {
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<KycDocument | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'REJECTED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchKycDocuments();
  }, []);

  const fetchKycDocuments = async () => {
    try {
      const response = await fetch('/api/admin/kyc/documents');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentStatus = async (documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) => {
    try {
      const response = await fetch('/api/admin/kyc/update-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, status, notes })
      });

      if (response.ok) {
        await fetchKycDocuments();
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Failed to update document status:', error);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'PASSPORT':
      case 'DRIVERS_LICENSE':
      case 'NATIONAL_ID':
        return '🆔';
      case 'SELFIE_PHOTO':
        return '📸';
      case 'LIVELINESS_VIDEO':
        return '🎥';
      case 'ADDRESS_PROOF':
      case 'UTILITY_BILL':
      case 'RENTAL_AGREEMENT':
        return '🏠';
      case 'INCOME_PROOF':
      case 'EMPLOYMENT_LETTER':
      case 'PAYSLIP':
      case 'TAX_RETURN':
        return '💰';
      case 'BANK_STATEMENT':
        return '🏦';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'VERIFIED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'ALL' || doc.status === filter;
    const matchesSearch = doc.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KYC Document Management</h1>
          <p className="text-gray-600">Review and manage customer KYC documents</p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name, email, or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getDocumentTypeIcon(doc.documentType)}</div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {doc.user.firstName} {doc.user.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{doc.user.email}</span>
                      </div>
                      {doc.user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{doc.user.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{doc.documentType.replace(/_/g, ' ')}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      {doc.fileName && ` • ${doc.fileName}`}
                      {doc.fileSize && ` • ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                    </div>

                    {doc.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                        <strong>Notes:</strong> {doc.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                    title="View Document"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                    title="Download Document"
                  >
                    <Download className="w-5 h-5" />
                  </button>

                  {doc.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateDocumentStatus(doc.id, 'VERIFIED')}
                        className="p-2 text-green-600 hover:text-green-700 transition-colors"
                        title="Approve Document"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) {
                            updateDocumentStatus(doc.id, 'REJECTED', reason);
                          }
                        }}
                        className="p-2 text-red-600 hover:text-red-700 transition-colors"
                        title="Reject Document"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">No KYC documents match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
} 