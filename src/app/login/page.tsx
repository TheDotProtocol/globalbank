'use client';

import { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import MarketingLayout from '@/components/layout/MarketingLayout';

export const dynamic = 'force-dynamic';

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('message');
    if (message) setSuccessMessage(message);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else if (data.requiresVerification) {
        localStorage.setItem('pendingEmail', formData.email);
        router.push('/verify-email');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (loginError) {
      console.error('Login error:', loginError);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MarketingLayout variant="auth" showFooter={false}>
      <div className="auth-card">
        <h1 className="auth-card-title">Welcome Back</h1>
        <p className="auth-card-subtitle">Sign in to access your Global Dot Bank account</p>

        {successMessage && (
          <div className="auth-alert auth-alert-success">
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

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
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className="dashboard-form-group">
            <label className="dashboard-form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dashboard-form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link href="/forgot-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={isLoading}>
            {isLoading ? 'Signing in...' : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p className="auth-card-subtitle" style={{ marginBottom: '1rem' }}>
            Don&apos;t have an account?
          </p>
          <Link href="/register">
            <button type="button" className="btn-secondary auth-submit-btn">
              Create New Account
            </button>
          </Link>
        </div>
      </div>
    </MarketingLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <MarketingLayout variant="auth" showFooter={false}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: 40, height: 40, margin: '0 auto', border: '3px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%' }} />
          </div>
        </MarketingLayout>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
