'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle, Loader2, Sun, Moon, ArrowLeft } from 'lucide-react';
import Image from "next/image";

declare global {
  interface Window {
    SNWebSDK: any;
  }
}

export default function KYCVerification() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'completed' | 'error'>('loading');
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);
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
      // Update user KYC status in backend
      const response = await fetch('/api/user/kyc-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          kycStatus: 'APPROVED'
        })
      });

      if (response.ok) {
        // Redirect to dashboard after successful KYC
        setTimeout(() => {
          router.push('/dashboard?kyc=approved');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to update KYC status:', error);
    }
  };

  const handleKYCRejected = (payload: any) => {
    setError('KYC verification was rejected. Please ensure all documents are clear and valid.');
    setStatus('error');
  };

  const handleKYCReview = () => {
    setStatus('loading');
    setError('Your KYC verification is under review. You will be notified once the review is complete.');
  };

  const retryKYC = () => {
    setStatus('ready');
    setError('');
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm">
                  <Image
                    src="/logo.png"
                    alt="Global Dot Bank Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Dashboard</span>
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Identity Verification
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your KYC verification to access all banking features
            </p>
          </div>

          <div className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
            {status === 'loading' && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Loading Verification System
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we prepare your identity verification...
                </p>
              </div>
            )}

            {status === 'ready' && (
              <div>
                <div className="text-center mb-8">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Verify Your Identity
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Please have your government-issued ID ready for verification
                  </p>
                </div>
                
                <div id="sumsub-container" className="min-h-[600px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400">Loading verification interface...</p>
                  </div>
                </div>
              </div>
            )}

            {status === 'completed' && (
              <div className="text-center py-12">
                <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Completed Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your identity has been verified. You will be redirected to your dashboard shortly.
                </p>
                <div className="animate-pulse">
                  <div className="h-2 bg-green-200 dark:bg-green-700 rounded-full w-48 mx-auto"></div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center py-12">
                <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {error}
                </p>
                <div className="space-y-4">
                  <button
                    onClick={retryKYC}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="block mx-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure & Private</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your personal information is encrypted and protected with bank-grade security
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quick Process</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Complete verification in just a few minutes with your government ID
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Get help anytime if you encounter any issues during verification
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 