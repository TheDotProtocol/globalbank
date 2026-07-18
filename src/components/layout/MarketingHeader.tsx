'use client';

import { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface MarketingHeaderProps {
  theme: 'light' | 'dark';
  darkMode: boolean;
  onToggleTheme: () => void;
}

export default function MarketingHeader({ theme, darkMode, onToggleTheme }: MarketingHeaderProps) {
  const [showBankingDropdown, setShowBankingDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownItemStyle = {
    display: 'block',
    padding: '12px 20px',
    color: theme === 'light' ? '#374151' : '#f3f4f6',
    textDecoration: 'none',
  } as const;

  const navLinks = [
    { href: '/#services', label: 'Services', isHash: true },
    { href: '/#offices', label: 'Offices', isHash: true },
    { href: '/about', label: 'About' },
    { href: '/investor-relations', label: 'Investors' },
    { href: '/corporate-governance', label: 'Governance' },
    { href: '/help-center', label: 'Help' },
  ];

  return (
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

        <nav className="nav-links desktop-nav">
          {navLinks.map((link) =>
            link.isHash ? (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            ) : (
              <Link key={link.label} href={link.href} className="nav-link">
                {link.label}
              </Link>
            )
          )}

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
              <div
                className="dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  backgroundColor: theme === 'light' ? '#ffffff' : '#1a1a1a',
                  border: theme === 'light' ? '1px solid #e5e7eb' : '1px solid #374151',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '180px',
                  marginTop: '8px',
                  zIndex: 1000,
                }}
              >
                <Link href="/register" className="dropdown-item" style={{ ...dropdownItemStyle, borderBottom: theme === 'light' ? '1px solid #f3f4f6' : '1px solid #374151' }}>
                  Create Account
                </Link>
                <Link href="/login" className="dropdown-item" style={dropdownItemStyle}>
                  Login
                </Link>
              </div>
            )}
          </div>

          <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle theme">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-nav-menu">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/register" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Create Account
          </Link>
          <Link href="/login" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
