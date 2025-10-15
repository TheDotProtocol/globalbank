'use client';

import React from 'react';
import { Download, Globe, Building, User, CreditCard, Clock } from 'lucide-react';

interface InternationalTransferReceiptProps {
  transferData: {
    transactionId: string;
    reference: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    convertedAmount: number;
    transferFee: number;
    totalAmount: number;
    beneficiary: {
      name: string;
      address?: string;
      city?: string;
      country: string;
      bankName: string;
      bankAddress?: string;
      swiftCode: string;
      accountNumber: string;
      routingNumber?: string;
    };
    sourceAccount: {
      accountNumber: string;
      accountHolder: string;
    };
    timestamp: string;
    status: string;
    estimatedDelivery: string;
  };
  onDownload?: () => void;
}

export default function InternationalTransferReceipt({ 
  transferData, 
  onDownload 
}: InternationalTransferReceiptProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Globe className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">International Transfer Receipt</h1>
              <p className="text-sm text-gray-600">Global Dot Bank - International Banking</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Receipt #</p>
            <p className="font-mono text-lg font-bold text-blue-600">{transferData.reference}</p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Transfer Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Transfer Information
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transaction ID:</span>
              <span className="text-sm font-mono font-medium">{transferData.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reference:</span>
              <span className="text-sm font-mono font-medium">{transferData.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                transferData.status === 'PENDING' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {transferData.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Date & Time:</span>
              <span className="text-sm font-medium">{formatDate(transferData.timestamp)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Estimated Delivery:</span>
              <span className="text-sm font-medium">{formatDate(transferData.estimatedDelivery)}</span>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Amount Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Transfer Amount:</span>
              <span className="text-sm font-bold">{formatCurrency(transferData.amount, transferData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Exchange Rate:</span>
              <span className="text-sm font-medium">1 USD = {transferData.exchangeRate} {transferData.currency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Converted Amount:</span>
              <span className="text-sm font-medium">{formatCurrency(transferData.convertedAmount, transferData.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">International Fee (2%):</span>
              <span className="text-sm text-red-600">{formatCurrency(transferData.transferFee, 'USD')}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-gray-900">Total Amount:</span>
                <span className="text-lg font-bold text-blue-600">{formatCurrency(transferData.totalAmount, 'USD')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Source Account */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Source Account
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="text-sm font-mono font-medium">{transferData.sourceAccount.accountNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Holder</p>
            <p className="text-sm font-medium">{transferData.sourceAccount.accountHolder}</p>
          </div>
        </div>
      </div>

      {/* Beneficiary Details */}
      <div className="bg-purple-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <User className="w-5 h-5 mr-2" />
          Beneficiary Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="text-sm font-medium">{transferData.beneficiary.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Country</p>
            <p className="text-sm font-medium">{transferData.beneficiary.country}</p>
          </div>
          {transferData.beneficiary.address && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="text-sm font-medium">{transferData.beneficiary.address}</p>
            </div>
          )}
          {transferData.beneficiary.city && (
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="text-sm font-medium">{transferData.beneficiary.city}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-orange-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Bank Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Bank Name</p>
            <p className="text-sm font-medium">{transferData.beneficiary.bankName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SWIFT Code</p>
            <p className="text-sm font-mono font-medium">{transferData.beneficiary.swiftCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Account Number</p>
            <p className="text-sm font-mono font-medium">{transferData.beneficiary.accountNumber}</p>
          </div>
          {transferData.beneficiary.routingNumber && (
            <div>
              <p className="text-sm text-gray-600">Routing Number</p>
              <p className="text-sm font-mono font-medium">{transferData.beneficiary.routingNumber}</p>
            </div>
          )}
          {transferData.beneficiary.bankAddress && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Bank Address</p>
              <p className="text-sm font-medium">{transferData.beneficiary.bankAddress}</p>
            </div>
          )}
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Clock className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">Important Notice</p>
            <ul className="list-disc list-inside space-y-1">
              <li>This is a simulated international transfer for demonstration purposes.</li>
              <li>In production, this transfer would be processed through the SWIFT network.</li>
              <li>Processing time: 1-3 business days (excluding weekends and holidays).</li>
              <li>Please keep this receipt for your records.</li>
              <li>Contact customer support if you have any questions.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <p>Global Dot Bank - International Banking Division</p>
            <p>Customer Service: +1 (555) 123-4567</p>
          </div>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
