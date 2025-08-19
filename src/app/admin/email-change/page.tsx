'use client';

import React, { useState } from 'react';
import { Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function AdminEmailChangePage() {
  const [formData, setFormData] = useState({
    currentEmail: '',
    newEmail: '',
    adminPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/change-user-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          type: 'success',
          message: `Email changed successfully! User: ${data.user.firstName} ${data.user.lastName} (${data.user.email})`
        });
        setFormData({ currentEmail: '', newEmail: '', adminPassword: '' });
      } else {
        setResult({
          type: 'error',
          message: data.error || 'Failed to change email'
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: 'An error occurred while changing the email'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="h-12 w-12 relative bg-white rounded-lg p-1 shadow-sm mx-auto mb-4">
              <img src="/logo.png" alt="Global Dot Bank Logo" className="h-full w-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Email Change
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Change user email addresses
            </p>
          </div>

          {result && (
            <div className={`mb-6 p-4 rounded-lg border ${
              result.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start">
                {result.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                )}
                <div className={`text-sm ${
                  result.type === 'success' 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {result.message}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="currentEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="currentEmail"
                  type="email"
                  value={formData.currentEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentEmail: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="user@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newEmail"
                  type="email"
                  value={formData.newEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, newEmail: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="newuser@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                id="adminPassword"
                type="password"
                value={formData.adminPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, adminPassword: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter admin password"
                required
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800 dark:text-yellow-200">
                  <p className="font-medium">Important:</p>
                  <p>This will immediately change the user's email address. Make sure you have the correct information.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Changing Email...' : 'Change Email'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 