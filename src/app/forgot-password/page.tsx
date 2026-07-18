'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/useToast';
import MarketingLayout from '@/components/layout/MarketingLayout';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        showToast('Password reset email sent!', 'success');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (forgotError) {
      console.error('Forgot password error:', forgotError);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarketingLayout variant="auth" showFooter={false}>
      <div className="auth-card">
        {isSubmitted ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle size={48} style={{ color: '#059669', margin: '0 auto' }} />
            </div>
            <h1 className="auth-card-title">Check Your Email</h1>
            <p className="auth-card-subtitle">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="auth-card-subtitle">
              Click the link in your email to reset your password. The link will expire in 1 hour.
            </p>
            <Link href="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="auth-card-title">Reset Password</h1>
            <p className="auth-card-subtitle">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>

            {error && <div className="auth-alert auth-alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="dashboard-form-group">
                <label className="dashboard-form-label">
                  <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Email Address
                </label>
                <input
                  type="email"
                  className="dashboard-form-input"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="auth-divider">
              <span>Remember your password?</span>
            </div>

            <Link href="/login">
              <button type="button" className="btn-secondary auth-submit-btn">
                Back to Login
              </button>
            </Link>
          </>
        )}
      </div>
    </MarketingLayout>
  );
}
