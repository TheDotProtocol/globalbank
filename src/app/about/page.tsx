'use client';

import React, { useState } from 'react';
import { Shield, Award, Lock, Building, Globe, Users, Target, Heart, Briefcase, TrendingUp, Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function About() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const theme = darkMode ? 'dark' : 'light';
  
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

  const coreValues = [
    { icon: 'shield', title: 'Integrity', description: 'We operate with transparency and accountability, ensuring trust at every level of our organization.' },
    { icon: 'trending-up', title: 'Innovation', description: 'We continuously push the boundaries of fintech — delivering seamless, AI-driven, and user-centric banking solutions.' },
    { icon: 'award', title: 'Compliance', description: 'We maintain the highest standards of regulatory adherence, aligned with Basel III, FATF, and FinCEN global frameworks.' },
    { icon: 'globe', title: 'Inclusivity', description: 'We serve customers across borders, ensuring everyone — from individuals to enterprises — can access the global financial system.' },
    { icon: 'heart', title: 'Stewardship', description: 'We uphold long-term sustainability and responsible growth, ensuring the success of our customers, communities, and investors alike.' }
  ];

  const leadershipTeam = [
    { name: 'Arun Kumar', title: 'Founder', bio: 'Visionary founder of AR Holdings, whose foresight and entrepreneurial spirit laid the foundation for a multi-industry conglomerate. His legacy of innovation and strategic leadership continues to guide GDB\'s mission to make global finance accessible and borderless.' },
    { name: 'Kelsey Morgan (KM)', title: 'Chief Executive Officer', bio: 'Brings operational excellence and strategic foresight to Global Dot Bank. With a career spanning fintech innovation and global transformation, she drives execution, compliance, and customer trust at scale.' },
    { name: 'Timothy Burton (TB)', title: 'Veteran Advisor & Chairman', bio: 'Seasoned executive with over 35 years in banking, blockchain, and logistics. A former advisor to Fortune 500 financial institutions, he ensures GDB maintains its commitment to governance and sustainable growth.' },
    { name: 'Saleena Thamani (ST)', title: 'Executive Director', bio: 'Pioneering blockchain developer and architect of the DPC-20 Token Standard. Saleena bridges blockchain innovation and digital finance — merging compliance with creativity and serving as a driving force behind GDB\'s fintech ecosystem.' },
    { name: 'Rudra Narayanan (RN)', title: 'Head of Business & Strategy', bio: 'Specialist in global market expansion and institutional partnerships. Rudra leads GDB\'s cross-border strategy, driving investor relations and business growth across continents.' },
    { name: 'Jonathan Lee (李志明)', title: 'Chief Compliance Officer', bio: 'A highly respected compliance veteran with over 25 years at HSBC and Standard Chartered. Jonathan oversees GDB\'s global compliance, AML/CFT, and internal audit frameworks — ensuring absolute adherence to international banking standards and regulatory excellence.' },
    { name: 'Dr. Maria Estevez', title: 'Head of International Banking & Risk', bio: 'Former Managing Director at Santander Global Markets, Dr. Estevez brings a deep understanding of sovereign risk, liquidity management, and digital asset compliance. She leads the risk and treasury divisions, reinforcing GDB\'s financial resilience.' },
    { name: 'David Nasser', title: 'Chief Investment Officer', bio: 'A former Goldman Sachs executive with extensive experience in global asset management and structured investment products. David oversees all institutional portfolios, ensuring long-term growth and ethical asset allocation.' },
    { name: 'Akira Tanaka (田中明)', title: 'Chief Technology & Digital Operations Officer', bio: 'With a decade of leadership at Mitsubishi UFJ Financial Group (MUFG), Akira drives GDB\'s technology infrastructure, cybersecurity, and global payments network — ensuring 24/7 stability and cutting-edge innovation across all systems.' },
    { name: 'Sophia Bennett', title: 'Chief Financial Officer', bio: 'A financial strategist with global experience at UBS and Barclays, Sophia leads GDB\'s treasury, accounting, and capital optimization strategies. She ensures the bank\'s financial discipline and transparent reporting.' },
    { name: 'Ethan Wong (黄以腾)', title: 'Head of Merchant Banking & Corporate Services', bio: 'A leader in corporate finance and trade facilitation, Ethan previously served at OCBC and Citi Asia-Pacific. He oversees GDB\'s merchant banking division, enabling seamless international transactions for enterprise clients.' }
  ];

  const offices = [
    { label: 'Headquarters (USA)', address: '1075 Terra Bella Ave, Mountain View, CA 94043, United States' },
    { label: 'Asia Headquarters (Thailand)', address: '23 Sukhumvit Soi 13, Khlong Toei Nuea, Bangkok 10110' },
    { label: 'Dubai, UAE', address: 'Level 29, Marina Plaza, Dubai Marina' },
    { label: 'Singapore', address: '20 Collyer Quay, #23-01, Raffles Place, 049319' },
    { label: 'Malaysia', address: 'Level 36, Menara Citibank, Jalan Ampang, Kuala Lumpur 50450' }
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</Link>
                <Link href="/about" className="text-blue-600 dark:text-blue-400 font-semibold">About</Link>
                <Link href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investors</Link>
                <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Governance</Link>
                <Link href="/help-center" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Help</Link>
                
                <div className="relative group">
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium flex items-center space-x-1">
                    <span>Banking</span>
                    <ChevronDown size={16} />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link href="/register" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700">Create an account</Link>
                    <Link href="/login" className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300">Login</Link>
                  </div>
                </div>
                
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle Dark Mode">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              
              <div className="md:hidden flex items-center space-x-2">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" aria-label="Toggle Dark Mode">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              About Us — Global Dot Bank
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
              Founded to revolutionize the world of digital finance, Global Dot Bank (GDB) was established with a singular purpose — to make global banking simple, secure, and borderless.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">Our Story</h2>
            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300">
              <p>
                Emerging from the vision of AR Holdings, GDB represents the convergence of financial innovation and technology — serving as a trusted partner to global citizens, entrepreneurs, and institutions worldwide.
              </p>
              <p>
                With headquarters in Mountain View, California, and an Asia hub in Bangkok, Thailand, GDB operates across 10 international offices, managing over USD 1.5 million in assets and serving 2,100+ clients across continents.
              </p>
              <p className="text-xl font-semibold italic text-center">
                We believe banking should not be defined by borders — but by access, trust, and opportunity.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <Target size={48} className="mb-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  To empower individuals and businesses to manage, grow, and move their wealth globally — through transparent, intelligent, and secure digital banking solutions.
                </p>
              </div>
              <div className="p-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                <TrendingUp size={48} className="mb-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  To become the world's most trusted digital-first financial institution, uniting technology and compliance to redefine the standards of global banking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Core Values</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              Our values guide everything we do — from product development to customer service
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreValues.map((value, index) => {
                const IconComponent = iconMap[value.icon];
                return (
                  <div key={index} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <IconComponent size={40} className="mb-4 text-blue-600 dark:text-blue-400" />
                    <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global Presence */}
        <section className="py-16 bg-blue-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Our Global Presence</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
              With offices across three continents, we provide world-class banking services wherever you are
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offices.map((office, index) => (
                <div key={index} className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                  <Building size={24} className="mb-3 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-bold mb-2">{office.label}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{office.address}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Leadership Team</h2>
            <p className="text-center text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12">
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {leadershipTeam.map((leader, index) => (
                <div key={index} className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {leader.name.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold mb-1">{leader.name}</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-semibold text-sm mb-3">{leader.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{leader.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Philosophy */}
        <section className="py-16 bg-blue-100 dark:bg-blue-900/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Leadership Philosophy</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              At Global Dot Bank, leadership is defined by vision, trust, and accountability.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
              Our leaders combine legacy expertise from world-class financial institutions with a forward-thinking approach to innovation, compliance, and human connection.
            </p>
            <p className="text-xl font-semibold italic">
              Together, they embody GDB's commitment to "Banking Beyond Borders."
            </p>
          </div>
        </section>

        {/* Closing Statement */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-2 border-blue-600 dark:border-blue-400 text-center">
              <h2 className="text-3xl font-bold mb-4">Closing Statement</h2>
              <p className="text-lg mb-4">
                Global Dot Bank (GDB) stands as a beacon of trust and transformation in the global financial landscape.
              </p>
              <p className="text-lg font-semibold">
                Guided by integrity, driven by innovation, and anchored in compliance — we are building a borderless future for banking.
              </p>
            </div>
          </div>
        </section>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-gray-300 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-sm">Global Dot Bank © 2025 — Licensed and Regulated.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
