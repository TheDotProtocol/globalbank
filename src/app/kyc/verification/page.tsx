'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Logo from '@/components/Logo';

declare global {
  interface Window {
    SNWebSDK: any;
  }
}

export default function KYCVerification() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'completed' | 'error'>('loading');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('pendingUser');
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
      setStatus('ready');
    } else {
      setError('No user data found. Please complete registration first.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (status === 'ready' && userData) {
      initializeSumsub();
    }
  }, [status, userData]);

  const initializeSumsub = () => {
    // Load Sumsub SDK
    const script = document.createElement('script');
    script.src = 'https://static.sumsub.com/idensic/static/sns-websdk-builder.js';
    script.onload = () => {
      if (window.SNWebSDK) {
        startKYCVerification();
      }
    };
    script.onerror = () => {
      setError('Failed to load KYC verification system');
      setStatus('error');
    };
    document.head.appendChild(script);
  };

  const startKYCVerification = () => {
    try {
      // Initialize Sumsub Web SDK
      const snsWebSdkInstance = window.SNWebSDK.init(
        process.env.NEXT_PUBLIC_SUMSUB_APP_TOKEN || 'your-sumsub-token',
        () => {
          // Token expired callback
          console.log('Token expired');
        }
      );

      // Configure the SDK
      snsWebSdkInstance.setConf({
        lang: 'en',
        email: userData.email,
        phone: userData.phone || '',
        givenName: userData.firstName,
        lastName: userData.lastName,
        onMessage: (type: string, payload: any) => {
          console.log('Sumsub message:', type, payload);
          
          if (type === 'idCheck.onApproved') {
            // KYC approved
            handleKYCApproved();
          } else if (type === 'idCheck.onRejected') {
            // KYC rejected
            handleKYCRejected(payload);
          } else if (type === 'idCheck.onReview') {
            // KYC under review
            handleKYCReview();
          }
        },
        onError: (error: any) => {
          console.error('Sumsub error:', error);
          setError('KYC verification failed. Please try again.');
          setStatus('error');
        }
      });

      // Launch the verification
      snsWebSdkInstance.launch('#sumsub-container');
      
    } catch (error) {
      console.error('Failed to initialize Sumsub:', error);
      setError('Failed to start KYC verification');
      setStatus('error');
    }
  };

  const handleKYCApproved = async () => {
    setStatus('completed');
    
    try {
      // Update user KYC status in database
      const response = await fetch('/api/kyc/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          kycStatus: 'VERIFIED'
        }),
      });

      if (response.ok) {
        // Clear stored data and redirect to dashboard
        localStorage.removeItem('pendingUser');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError('Failed to update KYC status');
        setStatus('error');
      }
    } catch (error) {
      console.error('Error updating KYC status:', error);
      setError('Failed to update KYC status');
      setStatus('error');
    }
  };

  const handleKYCRejected = (payload: any) => {
    setError(`KYC verification rejected: ${payload.reason || 'Unknown reason'}`);
    setStatus('error');
  };

  const handleKYCReview = () => {
    setStatus('loading');
    setError('Your KYC verification is under review. You will be notified once it\'s completed.');
  };

  const retryKYC = () => {
    setStatus('ready');
    setError('');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading KYC Verification</h2>
            <p className="mt-2 text-gray-600">Please wait while we prepare your verification...</p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">KYC Verification Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={retryKYC}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-xl font-semibold text-gray-900">KYC Verification Complete!</h2>
            <p className="mt-2 text-gray-600">Your identity has been verified successfully. Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="icon" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">Global Dot Bank</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Your KYC Verification
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            To ensure the security of your account and comply with banking regulations, 
            we need to verify your identity. This process is quick and secure.
          </p>
        </div>

        {userData && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{userData.firstName} {userData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userData.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">{userData.accountNumber}</p>
              </div>
            </div>
          </div>
        )}

        {/* KYC Verification Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Identity Verification</h2>
          <p className="text-gray-600 mb-6">
            Please complete the verification process below. You'll need to provide:
          </p>
          <ul className="list-disc list-inside text-gray-600 mb-6 space-y-2">
            <li>Government-issued ID (passport, driver's license, or national ID)</li>
            <li>Proof of address (utility bill or bank statement)</li>
            <li>Selfie photo for face verification</li>
          </ul>
          
          <div id="sumsub-container" className="min-h-[600px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-gray-600">Loading verification system...</p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">Security & Privacy</h3>
              <p className="text-blue-800 text-sm mt-1">
                Your personal information is encrypted and secure. We use industry-standard 
                security measures to protect your data. This verification is required by 
                banking regulations to prevent fraud and ensure account security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 