'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyEmail(tokenParam);
    }
  }, [searchParams]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        
        // Store token and redirect
        localStorage.setItem('token', data.token);
        showToast('Email verified successfully!', 'success');
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('An error occurred during verification');
    }
  };

  const resendVerification = async () => {
    try {
      setStatus('loading');
      
      // Get email from localStorage or prompt user
      const email = localStorage.getItem('pendingEmail');
      if (!email) {
        setMessage('Please enter your email address to resend verification');
        return;
      }

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('pending');
        setMessage('Verification email sent! Please check your inbox.');
        showToast('Verification email sent!', 'success');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setStatus('error');
      setMessage('An error occurred while sending verification email');
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <LoadingSpinner />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Verifying Email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === 'success' && (
            <div className="mb-6">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Email Verified!</h2>
              <p className="mt-2 text-gray-600">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6">
              <XCircle className="mx-auto h-16 w-16 text-red-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Verification Failed</h2>
              <p className="mt-2 text-gray-600">{message}</p>
              
              <button
                onClick={resendVerification}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </button>
            </div>
          )}

          {status === 'pending' && !token && (
            <div className="mb-6">
              <Mail className="mx-auto h-16 w-16 text-blue-500" />
              <h2 className="mt-4 text-xl font-semibold text-gray-900">Check Your Email</h2>
              <p className="mt-2 text-gray-600">
                We've sent a verification email to your inbox. Please click the verification link to continue.
              </p>
              
              <button
                onClick={resendVerification}
                className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Resend Verification Email
              </button>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              Back to Login
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 