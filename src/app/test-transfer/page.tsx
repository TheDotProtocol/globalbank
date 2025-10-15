'use client';

import React, { useState } from 'react';

export default function TestTransferPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransfer = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      console.log('🚀 Starting international transfer...');

      const response = await fetch('/api/transfers/international/simple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        console.log('✅ Transfer successful:', data);
      } else {
        setError(data.error || 'Transfer failed');
        console.error('❌ Transfer failed:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Transfer error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test International Transfer
          </h1>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Transfer Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>From Account:</strong> 0506115866
              </div>
              <div>
                <strong>Amount:</strong> $3,000 USD
              </div>
              <div>
                <strong>Beneficiary:</strong> Rosemarie Bajado
              </div>
              <div>
                <strong>Country:</strong> Philippines
              </div>
              <div>
                <strong>Bank:</strong> Bank of the Philippines Islands (BPI)
              </div>
              <div>
                <strong>SWIFT:</strong> BOPIPHMM
              </div>
              <div>
                <strong>Account:</strong> 306210105037
              </div>
              <div>
                <strong>Fee (2%):</strong> $60
              </div>
              <div>
                <strong>Total:</strong> $3,060
              </div>
            </div>
          </div>

          <button
            onClick={handleTransfer}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing Transfer...' : 'Execute International Transfer'}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">Transfer Successful!</h3>
              <div className="text-sm text-green-700">
                <p><strong>Reference:</strong> {result.receipt?.reference}</p>
                <p><strong>Transaction ID:</strong> {result.receipt?.transactionId}</p>
                <p><strong>Status:</strong> {result.receipt?.status}</p>
                <p><strong>Estimated Delivery:</strong> {new Date(result.receipt?.estimatedDelivery).toLocaleString()}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="font-semibold text-green-800">Receipt Details:</h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-64">
                  {JSON.stringify(result.receipt, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
