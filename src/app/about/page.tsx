'use client';

import {
  Shield, Award, Lock, Building, Globe, Users, Target, Heart, Briefcase, TrendingUp,
} from 'lucide-react';
import MarketingLayout from '@/components/layout/MarketingLayout';
import PageHero from '@/components/layout/PageHero';
import { useTheme } from '@/hooks/useTheme';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  shield: Shield,
  award: Award,
  lock: Lock,
  building: Building,
  globe: Globe,
  users: Users,
  target: Target,
  heart: Heart,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
};

const coreValues = [
  {
    icon: 'shield',
    title: 'Integrity',
    description: 'We operate with transparency and accountability, ensuring trust at every level of our organization.',
  },
  {
    icon: 'trending-up',
    title: 'Innovation',
    description: 'We continuously push the boundaries of fintech — delivering seamless, AI-driven, and user-centric banking solutions.',
  },
  {
    icon: 'award',
    title: 'Compliance',
    description: 'We maintain the highest standards of regulatory adherence, aligned with Basel III, FATF, and FinCEN global frameworks.',
  },
  {
    icon: 'globe',
    title: 'Inclusivity',
    description: 'We serve customers across borders, ensuring everyone — from individuals to enterprises — can access the global financial system.',
  },
  {
    icon: 'heart',
    title: 'Stewardship',
    description: 'We uphold long-term sustainability and responsible growth, ensuring the success of our customers, communities, and investors alike.',
  },
];

const leadershipTeam = [
  {
    name: 'Arun Kumar',
    title: 'Founder',
    bio: 'Visionary founder of AR Holdings, whose foresight and entrepreneurial spirit laid the foundation for a multi-industry conglomerate. His legacy of innovation and strategic leadership continues to guide GDB\'s mission to make global finance accessible and borderless.',
  },
  {
    name: 'Saleena Thamani (ST)',
    title: 'Executive Director & CEO',
    bio: 'Pioneering blockchain developer and architect of the DPC-20 Token Standard. Saleena bridges blockchain innovation and digital finance — merging compliance with creativity and serving as a driving force behind GDB\'s fintech ecosystem.',
  },
  {
    name: 'Timothy Burton (TB)',
    title: 'Veteran Advisor & Chairman',
    bio: 'Seasoned executive with over 35 years in banking, blockchain, and logistics. A former advisor to Fortune 500 financial institutions, he ensures GDB maintains its commitment to governance and sustainable growth.',
  },
  {
    name: 'Rudra Narayanan (RN)',
    title: 'Head of Business & Strategy',
    bio: 'Specialist in global market expansion and institutional partnerships. Rudra leads GDB\'s cross-border strategy, driving investor relations and business growth across continents.',
  },
  {
    name: 'Jonathan Lee (李志明)',
    title: 'Chief Compliance Officer',
    bio: 'A highly respected compliance veteran with over 25 years at HSBC and Standard Chartered. Jonathan oversees GDB\'s global compliance, AML/CFT, and internal audit frameworks — ensuring absolute adherence to international banking standards and regulatory excellence.',
  },
  {
    name: 'Dr. Maria Estevez',
    title: 'Head of International Banking & Risk',
    bio: 'Former Managing Director at Santander Global Markets, Dr. Estevez brings a deep understanding of sovereign risk, liquidity management, and digital asset compliance. She leads the risk and treasury divisions, reinforcing GDB\'s financial resilience.',
  },
  {
    name: 'David Nasser',
    title: 'Chief Investment Officer',
    bio: 'A former Goldman Sachs executive with extensive experience in global asset management and structured investment products. David oversees all institutional portfolios, ensuring long-term growth and ethical asset allocation.',
  },
  {
    name: 'Akira Tanaka (田中明)',
    title: 'Chief Technology & Digital Operations Officer',
    bio: 'With a decade of leadership at Mitsubishi UFJ Financial Group (MUFG), Akira drives GDB\'s technology infrastructure, cybersecurity, and global payments network — ensuring 24/7 stability and cutting-edge innovation across all systems.',
  },
  {
    name: 'Sophia Bennett',
    title: 'Chief Financial Officer',
    bio: 'A financial strategist with global experience at UBS and Barclays, Sophia leads GDB\'s treasury, accounting, and capital optimization strategies. She ensures the bank\'s financial discipline and transparent reporting.',
  },
  {
    name: 'Ethan Wong (黄以腾)',
    title: 'Head of Merchant Banking & Corporate Services',
    bio: 'A leader in corporate finance and trade facilitation, Ethan previously served at OCBC and Citi Asia-Pacific. He oversees GDB\'s merchant banking division, enabling seamless international transactions for enterprise clients.',
  },
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
  { label: 'South Korea', address: '23F, Seoul Finance Center, 136 Sejong-daero, Jung-gu, Seoul' },
];

export default function About() {
  const { theme } = useTheme();

  return (
    <MarketingLayout>
      <PageHero
        title="About Us — Global Dot Bank"
        subtitle="Founded to revolutionize the world of digital finance, Global Dot Bank (GDB) was established with a singular purpose — to make global banking simple, secure, and borderless."
        theme={theme}
        minHeight="60vh"
      />

      <div className="home-container">
        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Our Story</h2>
            <div style={{ maxWidth: '900px', margin: '0 auto', lineHeight: '1.8', fontSize: '1.05rem' }}>
              <p className="section-description" style={{ marginBottom: '1.5rem' }}>
                Emerging from the vision of AR Holdings, GDB represents the convergence of financial innovation and technology — serving as a trusted partner to global citizens, entrepreneurs, and institutions worldwide.
              </p>
              <p className="section-description" style={{ marginBottom: '1.5rem' }}>
                With headquarters in Mountain View, California, and an Asia hub in Bangkok, Thailand, GDB operates across 10 international offices, managing over USD 1.5 million in assets and serving 2,100+ clients across continents.
              </p>
              <p className="section-description" style={{ fontWeight: '600', fontSize: '1.15rem', fontStyle: 'italic' }}>
                We believe banking should not be defined by borders — but by access, trust, and opportunity.
              </p>
            </div>
          </div>
        </section>

        <section className="services-section" style={{ backgroundColor: theme === 'light' ? '#f9fafb' : '#1a1a1a' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
              <div className="service-card">
                <Target size={48} style={{ marginBottom: '1rem', color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                <h3 className="service-title">Our Mission</h3>
                <p className="service-description">
                  To empower individuals and businesses to manage, grow, and move their wealth globally — through transparent, intelligent, and secure digital banking solutions.
                </p>
              </div>
              <div className="service-card">
                <TrendingUp size={48} style={{ marginBottom: '1rem', color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                <h3 className="service-title">Our Vision</h3>
                <p className="service-description">
                  To become the world&apos;s most trusted digital-first financial institution, uniting technology and compliance to redefine the standards of global banking.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Core Values</h2>
            <p className="section-description" style={{ marginBottom: '3rem' }}>
              Our values guide everything we do — from product development to customer service
            </p>
            <div className="badges-grid">
              {coreValues.map((value, index) => {
                const IconComponent = iconMap[value.icon];
                return (
                  <div key={index} className="badge-card" style={{ cursor: 'default', textAlign: 'left' }}>
                    {IconComponent && <IconComponent size={40} className="badge-icon" style={{ marginBottom: '1rem' }} />}
                    <h4 style={{ marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '1.15rem' }}>{value.title}</h4>
                    <p style={{ fontSize: '0.95rem', opacity: 0.85, lineHeight: '1.6' }}>{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section
          className="about-section"
          style={{
            backgroundImage: `linear-gradient(${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}, ${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.92)'}), url(https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njl8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMG1hcHxlbnwwfHx8fDE3NjAwNzQ3Mjd8MA&ixlib=rb-4.1.0&q=85)`,
          }}
        >
          <div className="about-content">
            <h2 className="section-title">Our Global Presence</h2>
            <p className="section-description" style={{ marginBottom: '3rem' }}>
              With offices across three continents, we provide world-class banking services wherever you are
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
              {offices.map((office, index) => (
                <div
                  key={index}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                    borderRadius: '0.75rem',
                    border: `1px solid ${theme === 'light' ? '#e5e7eb' : '#374151'}`,
                  }}
                >
                  <Building size={24} style={{ marginBottom: '0.75rem', color: theme === 'light' ? '#2563eb' : '#60a5fa' }} />
                  <h4 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.05rem' }}>{office.label}</h4>
                  <p style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: '1.5' }}>{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-content">
            <h2 className="section-title">Leadership Team</h2>
            <p className="section-description" style={{ marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginTop: '3rem' }}>
              {leadershipTeam.map((leader, index) => (
                <div key={index} className="service-card" style={{ textAlign: 'left' }}>
                  <div
                    style={{
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
                      color: '#ffffff',
                    }}
                  >
                    {leader.name.charAt(0)}
                  </div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{leader.name}</h3>
                  <p style={{ color: theme === 'light' ? '#2563eb' : '#60a5fa', fontWeight: '600', fontSize: '0.95rem', marginBottom: '1rem' }}>
                    {leader.title}
                  </p>
                  <p style={{ fontSize: '0.95rem', lineHeight: '1.6', opacity: 0.85 }}>{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="services-section" style={{ backgroundColor: theme === 'light' ? '#eff6ff' : '#1e3a5f' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
            <h2 className="section-title">Leadership Philosophy</h2>
            <p className="section-description" style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1rem' }}>
              At Global Dot Bank, leadership is defined by vision, trust, and accountability.
            </p>
            <p className="section-description" style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '1rem' }}>
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            <p className="section-description" style={{ lineHeight: '1.8', fontSize: '1.15rem', fontWeight: '600', fontStyle: 'italic', marginTop: '2rem' }}>
              Together, they embody GDB&apos;s commitment to &quot;Banking Beyond Borders.&quot;
            </p>
          </div>
        </section>

        <section className="trust-section">
          <div className="trust-content" style={{ textAlign: 'center' }}>
            <div
              style={{
                maxWidth: '900px',
                margin: '0 auto',
                padding: '3rem 2rem',
                backgroundColor: theme === 'light' ? '#f0f9ff' : '#0c2340',
                borderRadius: '1rem',
                border: `2px solid ${theme === 'light' ? '#2563eb' : '#1e40af'}`,
              }}
            >
              <h2 className="section-title" style={{ marginBottom: '2rem' }}>Closing Statement</h2>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
                Global Dot Bank (GDB) stands as a beacon of trust and transformation in the global financial landscape.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', fontWeight: '600' }}>
                Guided by integrity, driven by innovation, and anchored in compliance — we are building a borderless future for banking.
              </p>
            </div>
          </div>
        </section>
      </div>
    </MarketingLayout>
  );
}
