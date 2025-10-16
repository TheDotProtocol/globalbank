'use client';

import React, { useState } from 'react';

export default function TestCreditPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCredit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🏦 Starting AR Holdings Group credit...');

      const response = await fetch('/api/admin/credit-ar-holdings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        console.log('✅ Credit successful:', data);
      } else {
        setError(data.error || 'Credit failed');
        console.error('❌ Credit failed:', data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('❌ Credit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            AR Holdings Group Credit
          </h1>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Credit Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Account:</strong> 0506115866
              </div>
              <div>
                <strong>Amount:</strong> $500,000
              </div>
              <div>
                <strong>From:</strong> AR Holdings Group
              </div>
              <div>
                <strong>Type:</strong> Deposit
              </div>
            </div>
          </div>

          <button
            onClick={handleCredit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing Credit...' : 'Credit Account with $500,000'}
          </button>

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-green-800 font-semibold mb-2">Credit Successful!</h3>
              <div className="text-sm text-green-700">
                <p><strong>Account:</strong> {result.account?.accountNumber}</p>
                <p><strong>Account Holder:</strong> {result.account?.accountHolder}</p>
                <p><strong>Previous Balance:</strong> ${result.account?.previousBalance?.toLocaleString()}</p>
                <p><strong>New Balance:</strong> ${result.account?.newBalance?.toLocaleString()}</p>
                <p><strong>Credit Amount:</strong> ${result.account?.creditAmount?.toLocaleString()}</p>
                <p><strong>Transaction Reference:</strong> {result.transaction?.reference}</p>
                <p><strong>Total Bank Balance:</strong> ${result.bankStats?.totalBalance?.toLocaleString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
