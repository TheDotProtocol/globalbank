'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ExternalLink, Shield, UserCheck } from 'lucide-react';

interface KYCVerificationProps {
  userId: string;
  onStatusChange?: (status: string) => void;
}

interface KYCStatus {
  status: string;
  message?: string;
  reviewResult?: any;
}

export default function KYCVerification({ userId, onStatusChange }: KYCVerificationProps) {
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [initiating, setInitiating] = useState(false);

  useEffect(() => {
    fetchKYCStatus();
  }, [userId]);

  const fetchKYCStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sumsub/applicant-status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setKycStatus(data);
        onStatusChange?.(data.status);
      }
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiateKYC = async () => {
    setInitiating(true);
    try {
      const response = await fetch('/api/sumsub/create-applicant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setKycStatus({
          status: 'PENDING',
          message: 'KYC application submitted successfully. You will be contacted by our verification team.'
        });
        onStatusChange?.('PENDING');
      } else {
        const error = await response.json();
        console.error('Failed to initiate KYC:', error);
      }
    } catch (error) {
      console.error('Error initiating KYC:', error);
    } finally {
      setInitiating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'REJECTED':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <UserCheck className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'REJECTED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'Your KYC verification has been approved. You can now access all features.';
      case 'PENDING':
        return 'Your KYC verification is under review. This process typically takes 1-3 business days.';
      case 'REJECTED':
        return 'Your KYC verification was not approved. Please contact support for assistance.';
      default:
        return 'KYC verification is required to access all features.';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading KYC status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">KYC Verification</h3>
          <p className="text-sm text-gray-500">Managed by Sumsub - Industry-leading identity verification</p>
        </div>
      </div>

      {/* Status Display */}
      {kycStatus && (
        <div className={`mb-6 p-4 rounded-lg border ${getStatusColor(kycStatus.status)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(kycStatus.status)}
            <div className="flex-1">
              <h4 className="font-medium capitalize">
                Status: {kycStatus.status.toLowerCase()}
              </h4>
              <p className="text-sm mt-1">
                {kycStatus.message || getStatusMessage(kycStatus.status)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {(!kycStatus || kycStatus.status === 'PENDING') && (
          <button
            onClick={initiateKYC}
            disabled={initiating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {initiating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Initiating KYC...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                <span>Start KYC Verification</span>
              </>
            )}
          </button>
        )}

        {kycStatus?.status === 'PENDING' && (
          <button
            onClick={fetchKYCStatus}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Clock className="w-4 h-4" />
            <span>Check Status</span>
          </button>
        )}

        {kycStatus?.status === 'REJECTED' && (
          <button
            onClick={initiateKYC}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Reapply for KYC</span>
          </button>
        )}
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">About KYC Verification</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Identity verification powered by Sumsub</li>
          <li>• Secure document upload and verification</li>
          <li>• Face recognition and liveness detection</li>
          <li>• Compliance with global regulations</li>
          <li>• Typically completed within 1-3 business days</li>
        </ul>
      </div>

      {/* Support */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Need help? Contact our support team for assistance with KYC verification.
        </p>
      </div>
    </div>
  );
} 