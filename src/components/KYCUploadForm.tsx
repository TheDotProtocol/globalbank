'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Download,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface KYCStatus {
  overallStatus: string;
  completedDocuments: number;
  totalDocuments: number;
  documentStatus: {
    ID_PROOF: { status: string; uploaded: boolean };
    ADDRESS_PROOF: { status: string; uploaded: boolean };
    INCOME_PROOF: { status: string; uploaded: boolean };
    BANK_STATEMENT: { status: string; uploaded: boolean };
  };
}

interface KYCUploadFormProps {
  onStatusUpdate?: (status: KYCStatus) => void;
}

const DOCUMENT_TYPES = [
  {
    type: 'ID_PROOF',
    label: 'Government ID',
    description: 'Passport, Driver\'s License, or National ID',
    required: true
  },
  {
    type: 'ADDRESS_PROOF',
    label: 'Proof of Address',
    description: 'Utility bill, Bank statement, or Rental agreement',
    required: true
  },
  {
    type: 'INCOME_PROOF',
    label: 'Income Verification',
    description: 'Payslip, Tax return, or Employment letter',
    required: true
  },
  {
    type: 'BANK_STATEMENT',
    label: 'Bank Statement',
    description: 'Recent bank statement (last 3 months)',
    required: true
  }
];

export default function KYCUploadForm({ onStatusUpdate }: KYCUploadFormProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/kyc/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
        onStatusUpdate?.(data);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (documentType: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, and PDF files are allowed', 'error');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      showToast('File size must be less than 10MB', 'error');
      return;
    }

    setUploading(documentType);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please log in to continue', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('file', file);

      const response = await fetch('/api/kyc/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        showToast('Document uploaded successfully', 'success');
        fetchKYCStatus(); // Refresh status
      } else {
        const error = await response.json();
        showToast(error.error || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'text-green-600 bg-green-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KYC Progress */}
      {kycStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">KYC Verification Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycStatus.overallStatus)}`}>
              {kycStatus.overallStatus}
            </span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{kycStatus.completedDocuments} of {kycStatus.totalDocuments} documents</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(kycStatus.completedDocuments / kycStatus.totalDocuments) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Verified: {kycStatus.documentStatus.ID_PROOF.status === 'VERIFIED' ? 1 : 0} + {kycStatus.documentStatus.ADDRESS_PROOF.status === 'VERIFIED' ? 1 : 0} + {kycStatus.documentStatus.INCOME_PROOF.status === 'VERIFIED' ? 1 : 0} + {kycStatus.documentStatus.BANK_STATEMENT.status === 'VERIFIED' ? 1 : 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Pending: {kycStatus.documentStatus.ID_PROOF.status === 'PENDING' ? 1 : 0} + {kycStatus.documentStatus.ADDRESS_PROOF.status === 'PENDING' ? 1 : 0} + {kycStatus.documentStatus.INCOME_PROOF.status === 'PENDING' ? 1 : 0} + {kycStatus.documentStatus.BANK_STATEMENT.status === 'PENDING' ? 1 : 0}</span>
            </div>
          </div>
        </div>
      )}

      {/* Document Upload Sections */}
      <div className="space-y-4">
        {DOCUMENT_TYPES.map((docType) => {
          const status = kycStatus?.documentStatus[docType.type as keyof typeof kycStatus.documentStatus];
          const isUploaded = status?.uploaded || false;
          const isUploading = uploading === docType.type;

          return (
            <div key={docType.type} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{docType.label}</h4>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>
                  </div>

                  {isUploaded && status && (
                    <div className="flex items-center space-x-2 mt-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                        {getStatusIcon(status.status)}
                        <span className="ml-1">{status.status}</span>
                      </span>
                      {status.status === 'REJECTED' && (
                        <span className="text-xs text-red-600">Please re-upload</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {!isUploaded ? (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(docType.type, file);
                          }
                        }}
                        disabled={isUploading}
                      />
                      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 border-dashed transition-colors ${
                        isUploading 
                          ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}>
                        {isUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-600">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-600">Upload</span>
                          </>
                        )}
                      </div>
                    </label>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Trigger file upload again
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = '.pdf,.jpg,.jpeg,.png';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              handleFileUpload(docType.type, file);
                            }
                          };
                          input.click();
                        }}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
                      >
                        <Upload className="h-3 w-3" />
                        <span>Re-upload</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Upload Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Supported formats: PDF, JPEG, PNG</li>
          <li>• Maximum file size: 10MB per document</li>
          <li>• Ensure documents are clear and readable</li>
          <li>• Documents should be recent (within 3 months)</li>
          <li>• All documents are encrypted and securely stored</li>
        </ul>
      </div>
    </div>
  );
} 