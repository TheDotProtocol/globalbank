'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Shield, Zap, Globe, PiggyBank, TrendingUp, DollarSign, Building, GraduationCap, Heart, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Register() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showBankingDropdown, setShowBankingDropdown] = useState(false);

  const theme = darkMode ? 'dark' : 'light';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const accountTypes = [
    {
      id: 'savings',
      name: 'Savings Account',
      description: 'Secure, seamless, and suited for your everyday needs',
      features: [
        'Higher-than-average interest rates',
        'No minimum balance required',
        'Instant e-KYC onboarding',
        'Auto-sweep to FD for idle balances',
        'Real-time mobile control of your money',
        'Smart spend tracking & budgeting tools'
      ],
      icon: <PiggyBank size={32} />,
      color: 'blue',
      popular: false
    },
    {
      id: 'current',
      name: 'Current Account',
      description: 'Built for businesses and professionals who move fast',
      features: [
        'Instant payments & global transfers',
        'Zero hidden fees on monthly transactions',
        'Dedicated relationship manager for business accounts',
        'Free virtual business debit cards',
        'API access for automation-ready businesses',
        'Multi-currency support & automated invoicing'
      ],
      icon: <TrendingUp size={32} />,
      color: 'green',
      popular: false
    },
    {
      id: 'fixed-deposit',
      name: 'Fixed Deposit Account',
      description: 'Lock in your funds. Watch your money grow faster, smarter',
      features: [
        'Market-leading interest rates',
        'Transparent, downloadable contracts',
        'Auto-renew or break FD with no penalties (select tenures)',
        'Secure digital certificates for every deposit',
        'Start with as little as $100',
        'Real-time deposit tracking & auto-reminders'
      ],
      icon: <DollarSign size={32} />,
      color: 'purple',
      popular: true
    },
    {
      id: 'corporate',
      name: 'Corporate Account',
      description: 'Enterprise-grade banking for companies of all sizes',
      features: [
        'Multi-user access with secure permissions',
        'Built-in FX hedging tools',
        'Real-time global transfers at low cost',
        'Custom onboarding for regulated businesses',
        '24/7 support with assigned corporate success manager',
        'Payroll automation & treasury services'
      ],
      icon: <Building size={32} />,
      color: 'indigo',
      popular: false
    },
    {
      id: 'junior',
      name: 'Junior Account',
      description: 'Banking for the next generation – safe, guided, and fun',
      features: [
        'Parental controls & joint oversight',
        'Prepaid cards with spending limits',
        'Goal tracking: Save for school, birthdays, more',
        'Reward system for good saving habits',
        'Safe & secure: zero online exposure',
        'Financial literacy learning platform'
      ],
      icon: <GraduationCap size={32} />,
      color: 'yellow',
      popular: false
    },
    {
      id: 'pension',
      name: 'Pension Account',
      description: 'Retire with dignity. Bank with peace of mind',
      features: [
        'Monthly interest payout options',
        'Priority support for senior citizens',
        'Medical emergency access fund',
        'Simplified onboarding, even offline',
        'Retirement planning dashboard',
        'Auto-deposit of pensions & FD-linked savings'
      ],
      icon: <Heart size={32} />,
      color: 'red',
      popular: false
    }
  ];

  const getColorClasses = (color: string) => {
    const baseStyle = {
      border: '2px solid',
      borderRadius: '12px',
      padding: '20px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a'
    };

    const colors: { [key: string]: any } = {
      blue: { borderColor: theme === 'light' ? '#3b82f6' : '#60a5fa', hoverBg: theme === 'light' ? '#eff6ff' : '#1e3a8a' },
      green: { borderColor: theme === 'light' ? '#10b981' : '#34d399', hoverBg: theme === 'light' ? '#ecfdf5' : '#064e3b' },
      purple: { borderColor: theme === 'light' ? '#a855f7' : '#c084fc', hoverBg: theme === 'light' ? '#faf5ff' : '#581c87' },
      indigo: { borderColor: theme === 'light' ? '#6366f1' : '#818cf8', hoverBg: theme === 'light' ? '#eef2ff' : '#312e81' },
      yellow: { borderColor: theme === 'light' ? '#f59e0b' : '#fbbf24', hoverBg: theme === 'light' ? '#fffbeb' : '#78350f' },
      red: { borderColor: theme === 'light' ? '#ef4444' : '#f87171', hoverBg: theme === 'light' ? '#fef2f2' : '#7f1d1d' }
    };

    return { ...baseStyle, ...colors[color] };
  };

  const getIconColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: theme === 'light' ? '#3b82f6' : '#60a5fa',
      green: theme === 'light' ? '#10b981' : '#34d399',
      purple: theme === 'light' ? '#a855f7' : '#c084fc',
      indigo: theme === 'light' ? '#6366f1' : '#818cf8',
      yellow: theme === 'light' ? '#f59e0b' : '#fbbf24',
      red: theme === 'light' ? '#ef4444' : '#f87171'
    };
    return colors[color];
  };

  const handleContinue = () => {
    if (selectedAccount) {
      window.location.href = `https://globaldot.bank/register/form?type=${selectedAccount}`;
    }
  };

  return (
    <div className={`App ${theme}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <Link href="/" className="logo">
            <Image 
              src="/logo.png" 
              alt="Global Dot Bank" 
              width={160} 
              height={40}
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>
          
          <nav className="nav-links">
            <Link href="/#services" className="nav-link">Services</Link>
            <Link href="/#offices" className="nav-link">Offices</Link>
            <Link href="/about" className="nav-link">About</Link>
            <Link href="/investor-relations" className="nav-link">Investors</Link>
            <Link href="/corporate-governance" className="nav-link">Governance</Link>
            <Link href="/help-center" className="nav-link">Help</Link>
            
            <div 
              className="banking-dropdown" 
              onMouseEnter={() => setShowBankingDropdown(true)}
              onMouseLeave={() => setShowBankingDropdown(false)}
              style={{ position: 'relative', display: 'inline-block' }}
            >
              <span className="nav-link" style={{ cursor: 'pointer' }}>
                Banking ▾
              </span>
              {showBankingDropdown && (
                <div className="dropdown-menu" style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '180px',
                  marginTop: '8px',
                  zIndex: 1000
                }}>
                  <Link 
                    href="/register" 
                    className="dropdown-item"
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      color: theme === 'light' ? '#374151' : '#f3f4f6',
                      textDecoration: 'none',
                      borderBottom: theme === 'light' ? '1px solid #f3f4f6' : '1px solid #374151'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    Create Account
                  </Link>
                  <a 
                    href="https://globaldot.bank/login"
                    className="dropdown-item"
                    style={{
                      display: 'block',
                      padding: '12px 20px',
                      color: theme === 'light' ? '#374151' : '#f3f4f6',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#374151'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'}
                  >
                    Login
                  </a>
                </div>
              )}
            </div>
            
            <button className="theme-toggle" onClick={toggleTheme}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </nav>
        </div>
      </header>

      <div style={{ 
        backgroundColor: theme === 'light' ? '#f9fafb' : '#0a0a0a', 
        color: theme === 'light' ? '#1f2937' : '#f3f4f6',
        minHeight: '100vh',
        paddingTop: '100px',
        paddingBottom: '40px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ 
              fontSize: '2.25rem', 
              fontWeight: 'bold', 
              marginBottom: '12px',
              background: theme === 'light' 
                ? 'linear-gradient(to right, #1e40af, #7c3aed)' 
                : 'linear-gradient(to right, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Choose Your Account Type
            </h1>
            <p style={{ fontSize: '1rem', color: theme === 'light' ? '#6b7280' : '#9ca3af', maxWidth: '700px', margin: '0 auto' }}>
              Select the perfect account for your banking needs. Each account type comes with unique features designed to enhance your financial experience.
            </p>
          </div>

          {/* Account Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px', 
            marginBottom: '48px' 
          }}>
            {accountTypes.map((account) => (
              <div
                key={account.id}
                style={{
                  ...getColorClasses(account.color),
                  borderColor: selectedAccount === account.id 
                    ? (theme === 'light' ? '#2563eb' : '#60a5fa')
                    : getColorClasses(account.color).borderColor,
                  transform: selectedAccount === account.id ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: selectedAccount === account.id 
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
                    : 'none',
                  position: 'relative'
                }}
                onClick={() => setSelectedAccount(account.id)}
                onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = getColorClasses(account.color).hoverBg}
                onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = theme === 'light' ? '#ffffff' : '#1a1a1a'}
              >
                {account.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-16px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(to right, #a855f7, #ec4899)',
                    color: 'white',
                    padding: '6px 20px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: theme === 'light' ? '#f3f4f6' : '#374151',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px auto',
                    color: getIconColor(account.color)
                  }}>
                    {React.cloneElement(account.icon, { size: 24 })}
                  </div>

                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '8px' }}>
                    {account.name}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: theme === 'light' ? '#6b7280' : '#9ca3af', marginBottom: '16px' }}>
                    {account.description}
                  </p>

                  <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {account.features.map((feature, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        <CheckCircle size={16} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.8125rem', color: theme === 'light' ? '#4b5563' : '#d1d5db', lineHeight: '1.4' }}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <button
              onClick={handleContinue}
              disabled={!selectedAccount}
              style={{
                padding: '12px 36px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                cursor: selectedAccount ? 'pointer' : 'not-allowed',
                background: selectedAccount 
                  ? 'linear-gradient(to right, #3b82f6, #8b5cf6)' 
                  : theme === 'light' ? '#d1d5db' : '#4b5563',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: selectedAccount ? '0 10px 15px -3px rgba(59, 130, 246, 0.3)' : 'none',
                opacity: selectedAccount ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (selectedAccount) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAccount) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.3)';
                }
              }}
            >
              Continue to Registration
            </button>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
              borderRadius: '12px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}>
              <Shield size={36} style={{ color: '#10b981', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                Bank-Grade Security
              </h3>
              <p style={{ fontSize: '0.875rem', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                Your data is protected with military-grade encryption
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
              borderRadius: '12px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}>
              <Zap size={36} style={{ color: '#3b82f6', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                Instant Setup
              </h3>
              <p style={{ fontSize: '0.875rem', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                Get started in minutes with our streamlined process
              </p>
            </div>

            <div style={{
              textAlign: 'center',
              padding: '20px',
              backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
              borderRadius: '12px',
              border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
            }}>
              <Globe size={36} style={{ color: '#a855f7', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px' }}>
                Global Access
              </h3>
              <p style={{ fontSize: '0.875rem', color: theme === 'light' ? '#6b7280' : '#9ca3af' }}>
                Bank from anywhere in the world, 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
