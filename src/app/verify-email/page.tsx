'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import MarketingLayout from '@/components/layout/MarketingLayout';

function VerifyEmailContent() {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Email verified successfully! Redirecting to dashboard...');
        localStorage.setItem('token', data.token);
        showToast('Email verified successfully!', 'success');
        setTimeout(() => router.push('/dashboard'), 2000);
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
      const email = localStorage.getItem('pendingEmail');
      if (!email) {
        setMessage('Please enter your email address to resend verification');
        setStatus('error');
        return;
      }

      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <LoadingSpinner />
          <h2 className="auth-card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Verifying Email...</h2>
          <p className="auth-card-subtitle">Please wait while we verify your email address.</p>
        </div>
      );
    }

    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        {status === 'success' && (
          <>
            <CheckCircle size={64} style={{ color: '#059669', margin: '0 auto' }} />
            <h2 className="auth-card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Email Verified!</h2>
            <p className="auth-card-subtitle">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={64} style={{ color: '#dc2626', margin: '0 auto' }} />
            <h2 className="auth-card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Verification Failed</h2>
            <p className="auth-card-subtitle">{message}</p>
            <button type="button" onClick={resendVerification} className="btn-primary auth-submit-btn" style={{ marginTop: '1rem' }}>
              <Mail size={16} />
              Resend Verification Email
            </button>
          </>
        )}

        {status === 'pending' && !token && (
          <>
            <Mail size={64} style={{ margin: '0 auto', opacity: 0.8 }} />
            <h2 className="auth-card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Check Your Email</h2>
            <p className="auth-card-subtitle">
              We&apos;ve sent a verification email to your inbox. Please click the verification link to continue.
            </p>
            <button type="button" onClick={resendVerification} className="btn-primary auth-submit-btn" style={{ marginTop: '1rem' }}>
              <Mail size={16} />
              Resend Verification Email
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => router.push('/login')}
          className="auth-link"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Back to Login
          <ArrowRight size={16} />
        </button>
      </div>
    );
  };

  return (
    <MarketingLayout variant="auth" showFooter={false}>
      {renderContent()}
    </MarketingLayout>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense
      fallback={
        <MarketingLayout variant="auth" showFooter={false}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <LoadingSpinner />
            <h2 className="auth-card-title" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Loading...</h2>
          </div>
        </MarketingLayout>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
