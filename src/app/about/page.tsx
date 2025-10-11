'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, Award, Lock, Building, Globe, Users, Target, Heart, Briefcase, TrendingUp,
  Sun, Moon
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const iconMap: { [key: string]: any } = {
  'shield': Shield,
  'award': Award,
  'lock': Lock,
  'building': Building,
  'globe': Globe,
  'users': Users,
  'target': Target,
  'heart': Heart,
  'briefcase': Briefcase,
  'trending-up': TrendingUp
};

export default function About() {
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

  const coreValues = [
    {
      icon: 'shield',
      title: 'Integrity',
      description: 'We operate with transparency and accountability, ensuring trust at every level of our organization.'
    },
    {
      icon: 'trending-up',
      title: 'Innovation',
      description: 'We continuously push the boundaries of fintech — delivering seamless, AI-driven, and user-centric banking solutions.'
    },
    {
      icon: 'award',
      title: 'Compliance',
      description: 'We maintain the highest standards of regulatory adherence, aligned with Basel III, FATF, and FinCEN global frameworks.'
    },
    {
      icon: 'globe',
      title: 'Inclusivity',
      description: 'We serve customers across borders, ensuring everyone — from individuals to enterprises — can access the global financial system.'
    },
    {
      icon: 'heart',
      title: 'Stewardship',
      description: 'We uphold long-term sustainability and responsible growth, ensuring the success of our customers, communities, and investors alike.'
    }
  ];

  const leadershipTeam = [
    {
      name: 'Arun Kumar',
      title: 'Founder',
      bio: 'Visionary founder of AR Holdings, whose foresight and entrepreneurial spirit laid the foundation for a multi-industry conglomerate. His legacy of innovation and strategic leadership continues to guide GDB\'s mission to make global finance accessible and borderless.'
    },
    {
      name: 'Kelsey Morgan (KM)',
      title: 'Chief Executive Officer',
      bio: 'Brings operational excellence and strategic foresight to Global Dot Bank. With a career spanning fintech innovation and global transformation, she drives execution, compliance, and customer trust at scale.'
    },
    {
      name: 'Timothy Burton (TB)',
      title: 'Veteran Advisor & Chairman',
      bio: 'Seasoned executive with over 35 years in banking, blockchain, and logistics. A former advisor to Fortune 500 financial institutions, he ensures GDB maintains its commitment to governance and sustainable growth.'
    },
    {
      name: 'Saleena Thamani (ST)',
      title: 'Executive Director',
      bio: 'Pioneering blockchain developer and architect of the DPC-20 Token Standard. Saleena bridges blockchain innovation and digital finance — merging compliance with creativity and serving as a driving force behind GDB\'s fintech ecosystem.'
    },
    {
      name: 'Rudra Narayanan (RN)',
      title: 'Head of Business & Strategy',
      bio: 'Specialist in global market expansion and institutional partnerships. Rudra leads GDB\'s cross-border strategy, driving investor relations and business growth across continents.'
    },
    {
      name: 'Jonathan Lee (李志明)',
      title: 'Chief Compliance Officer',
      bio: 'A highly respected compliance veteran with over 25 years at HSBC and Standard Chartered. Jonathan oversees GDB\'s global compliance, AML/CFT, and internal audit frameworks — ensuring absolute adherence to international banking standards and regulatory excellence.'
    },
    {
      name: 'Dr. Maria Estevez',
      title: 'Head of International Banking & Risk',
      bio: 'Former Managing Director at Santander Global Markets, Dr. Estevez brings a deep understanding of sovereign risk, liquidity management, and digital asset compliance. She leads the risk and treasury divisions, reinforcing GDB\'s financial resilience.'
    },
    {
      name: 'David Nasser',
      title: 'Chief Investment Officer',
      bio: 'A former Goldman Sachs executive with extensive experience in global asset management and structured investment products. David oversees all institutional portfolios, ensuring long-term growth and ethical asset allocation.'
    },
    {
      name: 'Akira Tanaka (田中明)',
      title: 'Chief Technology & Digital Operations Officer',
      bio: 'With a decade of leadership at Mitsubishi UFJ Financial Group (MUFG), Akira drives GDB\'s technology infrastructure, cybersecurity, and global payments network — ensuring 24/7 stability and cutting-edge innovation across all systems.'
    },
    {
      name: 'Sophia Bennett',
      title: 'Chief Financial Officer',
      bio: 'A financial strategist with global experience at UBS and Barclays, Sophia leads GDB\'s treasury, accounting, and capital optimization strategies. She ensures the bank\'s financial discipline and transparent reporting.'
    },
    {
      name: 'Ethan Wong (黄以腾)',
      title: 'Head of Merchant Banking & Corporate Services',
      bio: 'A leader in corporate finance and trade facilitation, Ethan previously served at OCBC and Citi Asia-Pacific. He oversees GDB\'s merchant banking division, enabling seamless international transactions for enterprise clients.'
    }
  ];

  const offices = [
    { label: 'Headquarters (USA)', address: '1075 Terra Bella Ave, Mountain View, CA 94043, United States' },
    { label: 'Asia Headquarters (Thailand)', address: '23 Sukhumvit Soi 13, Khlong Toei Nuea, Bangkok 10110' },
    { label: 'Dubai, UAE', address: 'Level 29, Marina Plaza, Dubai Marina' },
    { label: 'Belize', address: 'Suite 305, Matalon Building, Coney Drive, Belize City' },
    { label: 'Turkey', address: 'Maslak Mah., Büyükdere Cad., Istanbul 34398' },
    { label: 'India', address: '91 Springboard, MG Road, Bengaluru 560001' },
    { label: 'Singapore', address: '20 Collyer Quay, #23-01, Raffles Place, 049319' },
    { label: 'Malaysia', address: 'Level 36, Menara Citibank, Jalan Ampang, Kuala Lumpur 50450' },
    { label: 'Indonesia', address: 'World Trade Center 3, Jalan Jenderal Sudirman, Jakarta 12930' },
    { label: 'Vietnam', address: 'Saigon Trade Center, 37 Ton Duc Thang, District 1, Ho Chi Minh City' },
    { label: 'South Korea', address: '23F, Seoul Finance Center, 136 Sejong-daero, Jung-gu, Seoul' }
  ];

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

      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section" style={{
          backgroundImage: `linear-gradient(${theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)'}, ${theme === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(0, 0, 0, 0.85)'}), url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzV8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGJ1aWxkaW5nfGVufDB8fHx8MTc2MDA3NDcxOHww&ixlib=rb-4.1.0&q=85)`,
          minHeight: '60vh'
        }}>
          <div className="hero-content">
            <h1 className="hero-headline">About Us — Global Dot Bank</h1>
            <p className="hero-subheadline" style={{maxWidth: '800px', margin: '0 auto'}}>
              Founded to revolutionize the world of digital finance, Global Dot Bank (GDB) was established with a singular purpose — to make global banking simple, secure, and borderless.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Our Story</h2>
            <div style={{maxWidth: '900px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem'}}>
              <p className="section-description" style={{marginBottom: '1.5rem'}}>
                Emerging from the vision of AR Holdings, GDB represents the convergence of financial innovation and technology — serving as a trusted partner to global citizens, entrepreneurs, and institutions worldwide.
              </p>
              <p className="section-description" style={{marginBottom: '1.5rem'}}>
                With headquarters in Mountain View, California, and an Asia hub in Bangkok, Thailand, GDB operates across 10 international offices, managing over USD 1.5 million in assets and serving 2,100+ clients across continents.
              </p>
              <p className="section-description" style={{fontWeight: '600', fontSize: '1.15rem', fontStyle: 'italic'}}>
                We believe banking should not be defined by borders — but by access, trust, and opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="services-section" style={{backgroundColor: theme === 'light' ? '#f9fafb' : '#1a1a1a'}}>
          <div style={{maxWidth: '1200px', margin: '0 auto', padding: '0 2rem'}}>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem'}}>
              <div className="service-card">
                <Target size={48} style={{marginBottom: '1rem', color: theme === 'light' ? '#2563eb' : '#60a5fa'}} />
                <h3 className="service-title">Our Mission</h3>
                <p className="service-description">
                  To empower individuals and businesses to manage, grow, and move their wealth globally — through transparent, intelligent, and secure digital banking solutions.
                </p>
              </div>
              <div className="service-card">
                <TrendingUp size={48} style={{marginBottom: '1rem', color: theme === 'light' ? '#2563eb' : '#60a5fa'}} />
                <h3 className="service-title">Our Vision</h3>
                <p className="service-description">
                  To become the world's most trusted digital-first financial institution, uniting technology and compliance to redefine the standards of global banking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Core Values</h2>
            <p className="section-description" style={{marginBottom: '3rem'}}>
              Our values guide everything we do — from product development to customer service
            </p>
            
            <div className="badges-grid">
              {coreValues.map((value, index) => {
                const IconComponent = iconMap[value.icon];
                return (
                  <div key={index} className="badge-card" style={{cursor: 'default', textAlign: 'left'}}>
                    <IconComponent size={40} className="badge-icon" style={{marginBottom: '1rem'}} />
                    <h4 style={{marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.15rem'}}>{value.title}</h4>
                    <p style={{fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.6'}}>{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global Presence Section */}
        <section className="about-section" style={{
          backgroundImage: `linear-gradient(${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}, ${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}), url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcHxlbnwwfHx8fDE3NjAwNzQ3Mjd8MA&ixlib=rb-4.1.0&q=85)`
        }}>
          <div className="about-content">
            <h2 className="section-title">Our Global Presence</h2>
            <p className="section-description" style={{marginBottom: '3rem'}}>
              With offices across three continents, we provide world-class banking services wherever you are
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              marginTop: '2rem'
            }}>
              {offices.map((office, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '0.75rem',
                  border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`
                }}>
                  <Building size={24} style={{marginBottom: '0.75rem', color: theme === 'light' ? '#2563eb' : '#60a5fa'}} />
                  <h4 style={{fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.05rem'}}>
                    {office.label}
                  </h4>
                  <p style={{fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5'}}>
                    {office.address}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-description" style={{marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem'}}>
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              marginTop: '3rem'
            }}>
              {leadershipTeam.map((leader, index) => (
                <div key={index} className="service-card" style={{textAlign: 'left'}}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme === 'light' ? '#2563eb' : '#1e3a8a'}, ${theme === 'light' ? '#7c3aed' : '#4c1d95'})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    color: '#ffffff'
                  }}>
                    {leader.name.charAt(0)}
                  </div>
                  <h3 style={{fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem'}}>
                    {leader.name}
                  </h3>
                  <p style={{
                    color: theme === 'light' ? '#2563eb' : '#60a5fa',
                    fontWeight: '600',
                    fontSize: '0.95rem',
                    marginBottom: '1rem'
                  }}>
                    {leader.title}
                  </p>
                  <p style={{fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.85}}>
                    {leader.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Philosophy Section */}
        <section className="services-section" style={{backgroundColor: theme === 'light' ? '#eff6ff' : '#1e3a5f'}}>
          <div style={{maxWidth: '900px', margin: '0 auto', padding: '0 2rem', textAlign: 'center'}}>
            <h2 className="section-title">Leadership Philosophy</h2>
            <p className="section-description" style={{lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1rem'}}>
              At Global Dot Bank, leadership is defined by vision, trust, and accountability.
            </p>
            <p className="section-description" style={{lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1rem'}}>
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            <p className="section-description" style={{
              lineHeight: '1.8',
              fontSize: '1.15rem',
              fontWeight: '600',
              fontStyle: 'italic',
              marginTop: '2rem'
            }}>
              Together, they embody GDB's commitment to "Banking Beyond Borders."
            </p>
          </div>
        </section>

        {/* Closing Statement Section */}
        <section className="trust-section">
          <div className="trust-content" style={{textAlign: 'center'}}>
            <div style={{
              maxWidth: '900px',
              margin: '0 auto',
              padding: '3rem 2rem',
              backgroundColor: theme === 'light' ? '#f0f9ff' : '#0c2340',
              borderRadius: '1rem',
              border: `2px solid ${theme === 'light' ? '#2563eb' : '#1e40af'}`
            }}>
              <h2 className="section-title" style={{marginBottom: '2rem'}}>Closing Statement</h2>
              <p style={{fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem'}}>
                Global Dot Bank (GDB) stands as a beacon of trust and transformation in the global financial landscape.
              </p>
              <p style={{fontSize: '1.1rem', lineHeight: '1.8', fontWeight: '600'}}>
                Guided by integrity, driven by innovation, and anchored in compliance — we are building a borderless future for banking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
