'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import MarketingLayout from '@/components/layout/MarketingLayout';

function AdminLoginForm() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('adminSessionToken', data.sessionToken);
        sessionStorage.setItem('adminRole', data.role || data.admin?.role || 'ADMIN');
        sessionStorage.setItem('adminUsername', data.admin?.username || credentials.username);
        router.push(data.role === 'COMPLIANCE' ? '/admin/compliance' : '/admin');
      } else {
        setError(data.message || data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MarketingLayout variant="auth" showFooter={false}>
      <div className="auth-card admin-login-card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src="/logo.png"
            alt="Global Dot Bank"
            width={180}
            height={44}
            style={{ height: 44, width: 'auto', margin: '0 auto 1.5rem' }}
            priority
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '0.5rem' }}>
            <Shield size={24} />
            <h1 className="auth-card-title" style={{ marginBottom: 0 }}>Admin Portal</h1>
          </div>
          <p className="auth-card-subtitle" style={{ marginBottom: 0 }}>
            Secure access for operations &amp; compliance
          </p>
        </div>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="dashboard-form-group">
            <label htmlFor="username" className="dashboard-form-label">
              <User size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Username
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              className="dashboard-form-input"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={(e) => setCredentials((p) => ({ ...p, username: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="dashboard-form-group">
            <label htmlFor="password" className="dashboard-form-label">
              <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                className="dashboard-form-input"
                placeholder="Enter admin password"
                value={credentials.password}
                onChange={(e) => setCredentials((p) => ({ ...p, password: e.target.value }))}
                disabled={loading}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary auth-submit-btn" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? 'Signing in...' : (
              <>
                Sign in to Admin
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="auth-card-subtitle" style={{ textAlign: 'center', marginTop: '2rem', marginBottom: 0 }}>
          <Link href="/login" className="auth-link">← Back to customer login</Link>
        </p>
      </div>
    </MarketingLayout>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <MarketingLayout variant="auth" showFooter={false}>
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div className="dashboard-spinner" style={{ margin: '0 auto' }} />
          </div>
        </MarketingLayout>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
