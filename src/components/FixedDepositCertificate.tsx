'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';
import { exportFixedDepositCertificate } from '@/lib/export';

interface FixedDepositCertificateProps {
  certificate: {
    certificateNumber: string;
    customerName: string;
    customerEmail: string;
    accountNumber: string;
    depositAmount: number;
    interestRate: number;
    duration: number;
    startDate: string;
    maturityDate: string;
    interestEarned: string;
    maturityAmount: string;
    status: string;
    isMatured: boolean;
    daysElapsed: number;
    totalDays: number;
    generatedAt: string;
    bankName: string;
    bankAddress: string;
    terms: string[];
  };
  onClose: () => void;
}

export default function FixedDepositCertificate({ certificate, onClose }: FixedDepositCertificateProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      await exportFixedDepositCertificate(certificate, 'pdf');
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      await exportFixedDepositCertificate(certificate, 'csv');
    } catch (error) {
      console.error('Error downloading certificate CSV:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Fixed Deposit Certificate</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="p-6">
          <div className="border-2 border-gray-300 rounded-lg p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Bank Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">{certificate.bankName}</h1>
              <p className="text-gray-600">{certificate.bankAddress}</p>
              <div className="mt-4 text-2xl font-bold text-blue-800">FIXED DEPOSIT CERTIFICATE</div>
            </div>

            {/* Certificate Number */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="text-xl font-bold text-gray-900">{certificate.certificateNumber}</p>
              <p className="text-sm text-gray-500 mt-1">
                Generated: {new Date(certificate.generatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {certificate.customerName}</p>
                  <p><span className="font-medium">Email:</span> {certificate.customerEmail}</p>
                  <p><span className="font-medium">Account:</span> {certificate.accountNumber}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Deposit Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Amount:</span> ${certificate.depositAmount.toLocaleString()}</p>
                  <p><span className="font-medium">Interest Rate:</span> {certificate.interestRate}% p.a.</p>
                  <p><span className="font-medium">Duration:</span> {certificate.duration} months</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Important Dates</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Start Date:</span> {new Date(certificate.startDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Maturity Date:</span> {new Date(certificate.maturityDate).toLocaleDateString()}</p>
                  <p><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      certificate.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {certificate.status}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Interest Calculation</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Interest Earned:</span> ${certificate.interestEarned}</p>
                  <p><span className="font-medium">Maturity Amount:</span> ${certificate.maturityAmount}</p>
                  <p><span className="font-medium">Matured:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      certificate.isMatured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {certificate.isMatured ? 'Yes' : 'No'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Deposit Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((certificate.daysElapsed / certificate.totalDays) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{certificate.daysElapsed} days elapsed</span>
                <span>{certificate.totalDays} total days</span>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Terms and Conditions</h3>
              <div className="bg-white rounded-lg p-4 border">
                <ul className="space-y-2 text-sm text-gray-700">
                  {certificate.terms.map((term, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 border-t pt-4">
              <p>This certificate serves as proof of your fixed deposit with {certificate.bankName}.</p>
              <p className="mt-1">For any queries, please contact our customer support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}