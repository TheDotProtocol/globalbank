'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

function VerifyEmailChangeContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
      verifyEmailChange(tokenParam, decodeURIComponent(emailParam));
    } else {
      setStatus('error');
      setMessage('Invalid verification link. Missing token or email parameter.');
    }
  }, [searchParams]);

  const verifyEmailChange = async (verificationToken: string, newEmail: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch('/api/user/change-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          token: verificationToken,
          email: newEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email address changed successfully! You can now log in with your new email address.');
        showToast('Email changed successfully!', 'success');
        
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Email change verification failed');
      }
    } catch (error) {
      console.error('Email change verification error:', error);
      setStatus('error');
      setMessage('An error occurred during email change verification');
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              Verifying Email Change...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Please wait while we verify your new email address.
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              Email Changed Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
              Your email address has been updated to: <strong>{email}</strong>
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-green-800 dark:text-green-200">
                  <p className="font-medium">Important:</p>
                  <p>You can now log in using your new email address. Please remember to use the new email for all future logins.</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900">
              <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">
              {message}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">What to do:</p>
                  <ul className="mt-1 space-y-1">
                    <li>• Check if the verification link is still valid (24 hours)</li>
                    <li>• Try requesting a new email change from your profile</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900">
              <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-4">
              Email Change Verification
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Processing your email change request...
            </p>
          </div>
        );
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
              Global Dot Bank
            </h1>
          </div>
          
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
} 