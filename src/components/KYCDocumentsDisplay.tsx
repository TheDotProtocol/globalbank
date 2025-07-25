'use client';

import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface KYCDocument {
  id: string;
  documentType: string;
  status: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface KYCDocumentsDisplayProps {
  userId?: string;
}

export default function KYCDocumentsDisplay({ userId }: KYCDocumentsDisplayProps) {
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchKYCDocuments();
    }
  }, [userId]);

  const fetchKYCDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching KYC documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'GOVERNMENT_ID':
        return 'Government ID';
      case 'PROOF_OF_ADDRESS':
        return 'Proof of Address';
      case 'SELFIE':
        return 'Selfie';
      case 'BANK_STATEMENT':
        return 'Bank Statement';
      default:
        return type.replace(/_/g, ' ');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Documents Uploaded</h3>
          <p className="text-gray-600 dark:text-gray-300">Upload your KYC documents to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Uploaded Documents</h3>
      <div className="space-y-4">
        {documents.map((doc) => (
          <div key={doc.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                {getStatusIcon(doc.status)}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {getDocumentTypeLabel(doc.documentType)}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {doc.fileName} • {formatFileSize(doc.fileSize)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <button
                  onClick={() => window.open(doc.s3Key, '_blank')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="View Document"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.open(doc.s3Key, '_blank')}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  title="Download Document"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload Date
                </label>
                <input
                  type="text"
                  value={new Date(doc.createdAt).toLocaleDateString()}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  readOnly
                />
              </div>
              
              {doc.verifiedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verified Date
                  </label>
                  <input
                    type="text"
                    value={new Date(doc.verifiedAt).toLocaleDateString()}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              )}
              
              {doc.verifiedBy && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verified By
                  </label>
                  <input
                    type="text"
                    value={doc.verifiedBy}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    readOnly
                  />
                </div>
              )}
              
              {doc.notes && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={doc.notes}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 