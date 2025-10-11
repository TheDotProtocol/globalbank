'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, FileCheck, Award, Lock, Building, 
  Globe, ArrowRightLeft, Briefcase, Vault,
  Linkedin, Twitter, Newspaper, ChevronRight, ChevronDown,
  Sun, Moon, Menu, X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { bankData } from '@/lib/landing-data';

// Icon mapping
const iconMap: { [key: string]: any } = {
  'shield-check': Shield,
  'file-check': FileCheck,
  'award': Award,
  'lock': Lock,
  'building': Building,
  'globe': Globe,
  'arrow-right-left': ArrowRightLeft,
  'briefcase': Briefcase,
  'vault': Vault,
  'linkedin': Linkedin,
  'twitter': Twitter,
  'newspaper': Newspaper
};

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSegment, setActiveSegment] = useState('individuals');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBankingDropdown, setShowBankingDropdown] = useState(false);

  const theme = darkMode ? 'dark' : 'light';

  useEffect(() => {
    // Check localStorage for theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    // Apply theme class to body
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
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
            <button onClick={() => scrollToSection('services')} className="nav-link">Services</button>
            <button onClick={() => scrollToSection('offices')} className="nav-link">Offices</button>
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

      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section" style={{
          backgroundImage: `linear-gradient(${theme === 'light' ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.75)'}, ${theme === 'light' ? 'rgba(255, 255, 255, 0.88)' : 'rgba(0, 0, 0, 0.75)'}), url(${theme === 'light' ? bankData.hero.heroImageLight : bankData.hero.heroImageDark})`
        }}>
          <div className="hero-content">
            <h1 className="hero-headline">{bankData.hero.headline}</h1>
            <p className="hero-subheadline">{bankData.hero.subheadline}</p>
            {bankData.hero.tagline && (
              <p className="hero-tagline" style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                marginTop: '1.5rem',
                marginBottom: '2rem',
                color: theme === 'light' ? '#1a1a1a' : '#ffffff'
              }}>
                {bankData.hero.tagline}
              </p>
            )}
            <div className="hero-cta-group">
              <button 
                className="btn-primary"
                onClick={() => scrollToSection('contact')}
              >
                {bankData.hero.ctaPrimary}
                <ChevronRight size={20} />
              </button>
              <button 
                className="btn-secondary"
                onClick={() => scrollToSection('services')}
              >
                {bankData.hero.ctaSecondary}
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </section>

        {/* Value Proposition Section */}
        {bankData.valueProposition && (
          <section className="trust-section">
            <div className="trust-content">
              <h2 className="section-title">{bankData.valueProposition.title}</h2>
              <p className="section-description">{bankData.valueProposition.subtitle}</p>
              
              <div className="badges-grid">
                {bankData.valueProposition.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon];
                  return (
                    <div key={index} className="badge-card" style={{cursor: 'default'}}>
                      <IconComponent size={32} className="badge-icon" />
                      <div style={{textAlign: 'left', width: '100%'}}>
                        <h4 style={{marginBottom: '0.5rem', fontWeight: 'bold'}}>{feature.title}</h4>
                        <p style={{fontSize: '0.9rem', opacity: 0.8}}>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Trust & Regulation Section */}
        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">{bankData.trust.title}</h2>
            <p className="section-description">{bankData.trust.description}</p>
            
            <div className="badges-grid">
              {bankData.trust.badges.map((badge, index) => {
                const IconComponent = iconMap[badge.icon];
                return (
                  <div key={index} className="badge-card">
                    <IconComponent size={32} className="badge-icon" />
                    <span className="badge-label">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global Presence Section */}
        {bankData.globalPresence && (
          <section id="offices" className="about-section" style={{
            backgroundImage: `linear-gradient(${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}, ${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}), url(${bankData.globalPresence.backgroundImage})`
          }}>
            <div className="about-content">
              <h2 className="section-title">{bankData.globalPresence.title}</h2>
              <p className="section-description">{bankData.globalPresence.description}</p>
              <p className="section-description" style={{marginTop: '1rem'}}>
                📍 {bankData.globalPresence.learnMoreText}{' '}
                <Link href={bankData.globalPresence.learnMoreLink} style={{color: theme === 'light' ? '#2563eb' : '#60a5fa', textDecoration: 'underline'}}>
                  About Us
                </Link> page.
              </p>
              
              <div className="stats-grid">
                {bankData.globalPresence.stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Feature Highlights Section */}
        {bankData.featureHighlights && (
          <section id="services" className="services-section" style={{backgroundColor: theme === 'light' ? '#f9fafb' : '#1a1a1a'}}>
            <div className="services-header">
              <h2 className="section-title">{bankData.featureHighlights.title}</h2>
            </div>
            
            <div className="services-grid">
              {bankData.featureHighlights.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <div key={index} className="service-card">
                    <IconComponent size={40} className="service-icon" />
                    <h3 className="service-title">{feature.title}</h3>
                    <p className="service-description">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            
            {bankData.featureHighlights.note && (
              <div style={{
                maxWidth: '800px',
                margin: '3rem auto 0',
                padding: '1.5rem',
                backgroundColor: theme === 'light' ? '#e0f2fe' : '#0c4a6e',
                borderRadius: '0.75rem',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                fontStyle: 'italic'
              }}>
                <blockquote style={{margin: 0, paddingLeft: '1rem', borderLeft: `3px solid ${theme === 'light' ? '#0284c7' : '#38bdf8'}`}}>
                  {bankData.featureHighlights.note}
                </blockquote>
              </div>
            )}
          </section>
        )}

        {/* Why Choose GDB Section */}
        {bankData.whyChoose && (
          <section className="trust-section">
            <div className="trust-content">
              <h2 className="section-title">{bankData.whyChoose.title}</h2>
              <h3 className="section-description" style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
                {bankData.whyChoose.subtitle}
              </h3>
              <p className="section-description">{bankData.whyChoose.description}</p>
              
              <div style={{marginTop: '2rem'}}>
                <h4 style={{fontSize: '1.1rem', fontWeight: '600', marginBottom: '1.5rem', textAlign: 'center'}}>Why customers choose us:</h4>
                <div className="badges-grid">
                  {bankData.whyChoose.reasons.map((reason, index) => {
                    const IconComponent = iconMap[reason.icon];
                    return (
                      <div key={index} className="badge-card" style={{cursor: 'default'}}>
                        <IconComponent size={32} className="badge-icon" />
                        <div style={{textAlign: 'left', width: '100%'}}>
                          <h4 style={{marginBottom: '0.5rem', fontWeight: 'bold'}}>{reason.title}</h4>
                          <p style={{fontSize: '0.9rem', opacity: 0.8}}>{reason.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Our Ecosystem Section */}
        {bankData.ecosystem && (
          <section className="services-section">
            <div className="services-header">
              <h2 className="section-title">{bankData.ecosystem.title}</h2>
              <p className="section-description" style={{fontSize: '1.25rem', fontWeight: '600'}}>
                {bankData.ecosystem.subtitle}
              </p>
            </div>
            
            <div className="services-grid">
              {bankData.ecosystem.services.map((service, index) => {
                const IconComponent = iconMap[service.icon];
                return (
                  <div key={index} className="service-card">
                    <IconComponent size={40} className="service-icon" />
                    <h3 className="service-title">{service.title}</h3>
                    <p className="service-description">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Security & Trust Section */}
        {bankData.security && (
          <section className="trust-section" style={{backgroundColor: theme === 'light' ? '#f0fdf4' : '#0a2f1f'}}>
            <div className="trust-content">
              <h2 className="section-title">{bankData.security.title}</h2>
              <p className="section-description" style={{fontSize: '1.25rem', fontWeight: '600'}}>
                {bankData.security.subtitle}
              </p>
              
              <div className="badges-grid">
                {bankData.security.features.map((feature, index) => {
                  const IconComponent = iconMap[feature.icon];
                  return (
                    <div key={index} className="badge-card" style={{cursor: 'default'}}>
                      <IconComponent size={32} className="badge-icon" />
                      <div style={{textAlign: 'left', width: '100%'}}>
                        <h4 style={{marginBottom: '0.5rem', fontWeight: 'bold'}}>{feature.title}</h4>
                        <p style={{fontSize: '0.9rem', opacity: 0.8}}>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {bankData.security.tagline && (
                <p className="section-description" style={{
                  marginTop: '2rem', 
                  fontSize: '1.1rem', 
                  fontStyle: 'italic',
                  fontWeight: '500'
                }}>
                  {bankData.security.tagline}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Client Segments Section */}
        <section className="segments-section">
          <h2 className="section-title">{bankData.clientSegments.title}</h2>
          
          <div className="segments-tabs">
            {bankData.clientSegments.segments.map((segment) => (
              <button
                key={segment.id}
                className={`segment-tab ${activeSegment === segment.id ? 'active' : ''}`}
                onClick={() => setActiveSegment(segment.id)}
              >
                {segment.label}
              </button>
            ))}
          </div>
          
          <div className="segment-content">
            {bankData.clientSegments.segments
              .filter(segment => segment.id === activeSegment)
              .map((segment) => (
                <div key={segment.id} className="segment-detail">
                  <h3 className="segment-title">{segment.title}</h3>
                  <ul className="segment-features">
                    {segment.features.map((feature, index) => (
                      <li key={index} className="segment-feature">
                        <ChevronRight size={20} className="feature-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>

        {/* Join the Movement CTA Section */}
        {bankData.joinMovement && (
          <section id="contact" className="trust-section" style={{
            backgroundColor: theme === 'light' ? '#dbeafe' : '#1e3a5f',
            padding: '4rem 2rem'
          }}>
            <div className="trust-content" style={{textAlign: 'center'}}>
              <h2 className="section-title">{bankData.joinMovement.title}</h2>
              <h3 className="section-description" style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
                {bankData.joinMovement.subtitle}
              </h3>
              <p className="section-description" style={{maxWidth: '700px', margin: '0 auto 2.5rem'}}>
                {bankData.joinMovement.description}
              </p>
              
              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                <Link href="/register">
                  <button className="btn-primary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
                    {bankData.joinMovement.ctaPrimary}
                    <ChevronRight size={20} />
                  </button>
                </Link>
                <Link href="/about">
                  <button className="btn-secondary" style={{fontSize: '1.1rem', padding: '1rem 2rem'}}>
                    {bankData.joinMovement.ctaSecondary}
                    <ChevronRight size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="footer-section">
          <div className="footer-content">
            <div className="footer-main">
              <div className="footer-about">
                <div className="footer-logo">
                  <Image 
                    src="/logo.png" 
                    alt="Global Dot Bank" 
                    width={200} 
                    height={50}
                    style={{ height: '50px', width: 'auto' }}
                  />
                </div>
                {bankData.footer.title && (
                  <h3 style={{fontSize: '1.1rem', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem'}}>
                    {bankData.footer.title}
                  </h3>
                )}
                <p className="footer-description">{bankData.footer.description}</p>
                {bankData.footer.tagline && (
                  <p style={{
                    marginTop: '1rem',
                    fontStyle: 'italic',
                    fontSize: '0.95rem',
                    opacity: 0.9
                  }}>
                    <em>{bankData.footer.tagline}</em>
                  </p>
                )}
              </div>
              
              <div className="footer-offices">
                <h4 className="footer-heading">Global Offices</h4>
                {bankData.footer.offices.map((office, index) => (
                  <div key={index} className="office-item">
                    <div className="office-city">{office.city}</div>
                    <div className="office-address">{office.address}</div>
                  </div>
                ))}
              </div>
              
              <div className="footer-legal">
                <h4 className="footer-heading">Legal</h4>
                {bankData.footer.legal.map((item, index) => (
                  <a key={index} href={item.link} className="footer-link">
                    {item.label}
                  </a>
                ))}
              </div>
              
              <div className="footer-social">
                <h4 className="footer-heading">Connect</h4>
                <div className="social-links">
                  {bankData.footer.social.map((item, index) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <a key={index} href={item.link} className="social-link" aria-label={item.platform}>
                        <IconComponent size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="footer-copyright">{bankData.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
