'use client';

import { useState, useEffect, Suspense } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from "next/image";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

function LoginPageContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for success message in URL parameters
    const message = searchParams.get('message');
    if (message) {
      setSuccessMessage(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage(''); // Clear success message when attempting login
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        if (data.requiresVerification) {
          localStorage.setItem('pendingEmail', formData.email);
          router.push('/verify-email');
        } else {
          setError(data.error || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <Link href="/" style={{display: 'inline-block', marginBottom: '1rem'}}>
            <Image 
              src="/logo.png" 
              alt="Global Dot Bank" 
              width={180} 
              height={45}
              style={{ height: '45px', width: 'auto' }}
            />
          </Link>
        </div>

        {/* Header */}
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to access your Global Dot Bank account
        </p>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#d1fae5',
            color: '#065f46',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
          }}>
            <CheckCircle size={20} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="dashboard-form-group">
            <label className="dashboard-form-label">
              <Mail size={16} style={{display: 'inline', marginRight: '0.5rem'}} />
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
              <Lock size={16} style={{display: 'inline', marginRight: '0.5rem'}} />
              Password
            </label>
            <div style={{position: 'relative'}}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="dashboard-form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                style={{paddingRight: '3rem'}}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={{textAlign: 'right', marginBottom: '1.5rem'}}>
            <Link 
              href="/forgot-password"
              style={{
                fontSize: '0.875rem',
                color: '#2563eb',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="dashboard-btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #ffffff',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '2rem 0',
          gap: '1rem'
        }}>
          <div style={{flex: 1, height: '1px', background: '#e5e7eb'}} />
          <span style={{fontSize: '0.875rem', color: '#6b7280'}}>or</span>
          <div style={{flex: 1, height: '1px', background: '#e5e7eb'}} />
        </div>

        {/* Register Link */}
        <div style={{textAlign: 'center'}}>
          <p style={{fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem'}}>
            Don't have an account?
          </p>
          <Link href="/register">
            <button
              className="dashboard-btn-secondary"
              style={{
                width: '100%',
                justifyContent: 'center'
              }}
            >
              Create New Account
            </button>
          </Link>
        </div>

        {/* Back to Home */}
        <div style={{textAlign: 'center', marginTop: '2rem'}}>
          <Link 
            href="/"
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="login-container">
        <div className="login-card">
          <div style={{textAlign: 'center'}}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#2563eb',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }} />
          </div>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
