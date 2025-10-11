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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // Bank Data (embedded)
  const bankData = {
    hero: {
      headline: "Banking Beyond Borders",
      subheadline: "Global Dot Bank (GDB) delivers secure, intelligent, and borderless digital banking experiences — empowering customers in over 10 countries with the freedom to bank, spend, and invest globally.",
      tagline: "One Account. One Card. All Currencies — Instantly.",
      ctaPrimary: "Open Your Global Account",
      ctaSecondary: "Explore Our Services",
    },
    valueProposition: {
      title: "Built for the Global Citizen",
      subtitle: "Move, save, and invest — wherever life takes you.",
      features: [
        { title: "Digital-First Banking", description: "100% online onboarding with instant KYC verification.", icon: "globe" },
        { title: "Transparent & Secure", description: "No hidden fees. No borders. Just pure banking freedom.", icon: "lock" },
        { title: "Global Presence", description: "Offices in 10+ countries across 3 continents, ensuring world-class service no matter where you are.", icon: "building" },
        { title: "Regulatory-Ready", description: "Registered & licensed in Thailand, with U.S. and E.U. banking licenses in progress.", icon: "shield-check" }
      ]
    },
    trust: {
      title: "Trusted by Over 2,100 Global Customers",
      description: "Since 2024, Global Dot Bank has managed over USD 1.5 million in assets, supporting individuals and businesses through a stable, secure, and regulation-first digital ecosystem. GDB is building the next generation of global financial infrastructure — one trusted customer at a time.",
      badges: [
        { label: "2,100+ Customers", icon: "shield-check" },
        { label: "$1.5M+ Assets", icon: "award" },
        { label: "10+ Countries", icon: "globe" },
        { label: "Licensed in Thailand", icon: "building" },
        { label: "AML/CFT Compliant", icon: "file-check" }
      ]
    },
    globalPresence: {
      title: "Banking With a Global Footprint",
      description: "Our regional offices across the United States, Asia, and Europe ensure you're always connected to world-class service and real-time financial access.",
      stats: [
        { value: "10+", label: "Countries" },
        { value: "2,100+", label: "Customers" },
        { value: "24/7", label: "Global Support" },
        { value: "$1.5M+", label: "Assets Managed" }
      ]
    },
    featureHighlights: {
      title: "Experience Next-Generation Banking",
      features: [
        { icon: "arrow-right-left", title: "Instant Global Transfers (24/7)", description: "GDB-to-GDB real-time settlement network." },
        { icon: "globe", title: "Multi-Currency Accounts", description: "Hold, send, and spend in USD, EUR, THB, SGD, AED, and INR." },
        { icon: "briefcase", title: "Digital Debit Cards", description: "Manage and use your card anywhere in the world." },
        { icon: "vault", title: "Wealth & Investment Access", description: "Diversify your portfolio with intelligent global investment tools." },
        { icon: "shield-check", title: "24/7 AI Concierge Banking", description: "Your personal assistant for financial planning, insights, and support." }
      ],
      note: "We're also working closely with Visa and Mastercard to brand our upcoming line of Global Dot Bank debit and credit cards, giving you seamless access to the world's financial network."
    },
    whyChoose: {
      title: "Why Choose GDB",
      subtitle: "A Smarter Way to Bank, Invest, and Transact Across Borders",
      description: "At Global Dot Bank, we believe your money should move as freely as you do. We combine the trust of traditional banking with the innovation of modern fintech — giving you total control, transparency, and access across the world.",
      reasons: [
        { title: "Global Reach, Local Trust", description: "Licensed in Thailand with banking license applications active in the United States and European Union.", icon: "globe" },
        { title: "Next-Gen Infrastructure", description: "Built on secure, real-time settlement systems.", icon: "award" },
        { title: "Low Fees, High Transparency", description: "What you see is what you pay — no hidden charges.", icon: "lock" },
        { title: "AI-Driven Banking", description: "Our intelligent systems simplify compliance, savings, and global transfers.", icon: "shield-check" },
        { title: "Eco-Conscious Finance", description: "We integrate ESG-focused principles across our global operations.", icon: "building" }
      ]
    },
    ecosystem: {
      title: "Our Ecosystem",
      subtitle: "One Bank. Infinite Possibilities.",
      services: [
        { icon: "globe", title: "Personal & Business Banking", description: "Open your global account with just a passport or business registration. Send and receive payments instantly between countries — in multiple currencies — under one unified dashboard." },
        { icon: "arrow-right-left", title: "GDB Pay", description: "Our payment network is designed for speed and trust. Make international transfers, payrolls, and settlements instantly through the GDB-to-GDB real-time payment system, reducing costs by up to 60%." },
        { icon: "vault", title: "GDB Wealth", description: "Access diversified investment tools — from ETFs and digital assets to savings bonds and global mutual funds. Track performance, optimize returns, and receive personalized recommendations through our AI Wealth Advisor." },
        { icon: "briefcase", title: "GDB AI Concierge", description: "A 24/7 intelligent banking assistant that manages your transactions, predicts spending, and ensures your finances are always in balance — wherever you are in the world." }
      ]
    },
    security: {
      title: "Security & Trust",
      subtitle: "Built on Integrity. Backed by Compliance.",
      features: [
        { title: "Regulatory Frameworks", description: "AML/CFT-compliant across all jurisdictions.", icon: "shield-check" },
        { title: "Data Protection", description: "GDPR and PDPA certified.", icon: "lock" },
        { title: "Security Infrastructure", description: "AES-256 encryption, zero-knowledge data storage, and multi-layer authentication.", icon: "file-check" },
        { title: "Audit & Transparency", description: "Independent annual audits conducted under IFRS standards.", icon: "award" }
      ],
      tagline: "Your trust is our most valuable currency."
    },
    joinMovement: {
      title: "Join the Movement",
      subtitle: "Be Part of the Future of Banking",
      description: "Over 2,100 customers already bank with us across 10+ countries — and counting. It's time to experience what true global banking feels like.",
      ctaPrimary: "Open Your Global Account",
      ctaSecondary: "Meet Our Global Team"
    },
    clientSegments: {
      title: "Trusted by Leaders Worldwide",
      segments: [
        { id: "individuals", label: "Individuals", title: "Personal Banking Excellence", features: ["Premium global accounts with multi-currency support", "Competitive interest rates and investment options", "24/7 concierge banking support", "Advanced security and fraud protection", "Seamless mobile and web banking experience"] },
        { id: "enterprises", label: "Enterprises", title: "Corporate Banking Solutions", features: ["Customized treasury and cash management", "Trade finance and letters of credit", "FX hedging and risk management tools", "Dedicated relationship managers", "API integration for automated workflows"] },
        { id: "institutions", label: "Institutions", title: "Institutional Services", features: ["White-label banking infrastructure", "Regulatory compliance and reporting", "Liquidity and settlement services", "Prime brokerage and custody", "Bespoke financial engineering"] }
      ]
    },
    footer: {
      title: "Global Dot Bank — Banking Beyond Borders",
      description: "A digital-first global bank built for people, businesses, and communities who believe that the world deserves a smarter, safer, and more transparent way to manage money.",
      tagline: "One Account. One Card. All Currencies — Instantly.",
      offices: [
        { city: "United States (HQ)", address: "1075 Terra Bella Ave, Mountain View, CA, 94043" },
        { city: "Dubai, UAE", address: "Level 29, Marina Plaza, Dubai Marina" },
        { city: "Thailand (Asia HQ)", address: "23 Sukhumvit Soi 13, Khlong Toei Nuea, Bangkok 10110" },
        { city: "Singapore", address: "20 Collyer Quay, #23-01, Raffles Place, 049319" },
        { city: "Malaysia", address: "Level 36, Menara Citibank, Jalan Ampang, Kuala Lumpur 50450" }
      ],
      legal: [
        { label: "Terms of Service", link: "#" },
        { label: "Privacy Policy", link: "#" },
        { label: "Regulatory Disclosures", link: "#" },
        { label: "Security", link: "#" }
      ],
      social: [
        { platform: "LinkedIn", link: "#", icon: "linkedin" },
        { platform: "Twitter", link: "#", icon: "twitter" },
        { platform: "Press", link: "#", icon: "newspaper" }
      ],
      copyright: "Global Dot Bank © 2025 — Licensed and Regulated."
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={() => scrollToSection('services')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Services</button>
                <button onClick={() => scrollToSection('global-presence')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Offices</button>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About</Link>
                <Link href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investors</Link>
                <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Governance</Link>
                <Link href="/help-center" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Help</Link>
                
                {/* Banking Dropdown */}
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
            
            {isMobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  <button onClick={() => scrollToSection('services')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Services</button>
                  <button onClick={() => scrollToSection('global-presence')} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Offices</button>
                  <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">About</Link>
                  <Link href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Investors</Link>
                  <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Governance</Link>
                  <Link href="/help-center" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Help</Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">Banking</p>
                    <Link href="/register" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left px-2">Create an account</Link>
                    <Link href="/login" className="block text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left px-2 mt-2">Login</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              {bankData.hero.headline}
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-4xl mx-auto mb-6">
              {bankData.hero.subheadline}
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white mb-10">
              {bankData.hero.tagline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                {bankData.hero.ctaPrimary}
                <ChevronRight size={20} className="ml-2" />
              </Link>
              <button onClick={() => scrollToSection('services')} className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                {bankData.hero.ctaSecondary}
                <ChevronRight size={20} className="ml-2" />
              </button>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.valueProposition.title}</h2>
            <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">{bankData.valueProposition.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {bankData.valueProposition.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <div key={index} className="flex items-start space-x-4 p-6 rounded-xl bg-gray-50 dark:bg-gray-800 hover:shadow-lg transition-shadow">
                    <IconComponent size={32} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.trust.title}</h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12">{bankData.trust.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {bankData.trust.badges.map((badge, index) => {
                const IconComponent = iconMap[badge.icon];
                return (
                  <div key={index} className="text-center p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <IconComponent size={32} className="mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Global Presence */}
        <section id="global-presence" className="py-16 bg-blue-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.globalPresence.title}</h2>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-4">{bankData.globalPresence.description}</p>
            <p className="text-center mb-12">
              📍 Learn more on our{' '}
              <Link href="/about" className="text-blue-600 dark:text-blue-400 underline font-semibold">About Us</Link> page.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {bankData.globalPresence.stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section id="services" className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{bankData.featureHighlights.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {bankData.featureHighlights.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <div key={index} className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                    <IconComponent size={40} className="text-blue-600 dark:text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="max-w-3xl mx-auto p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-600">
              <p className="text-sm italic text-gray-700 dark:text-gray-300">{bankData.featureHighlights.note}</p>
            </div>
          </div>
        </section>

        {/* Why Choose GDB */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.whyChoose.title}</h2>
            <h3 className="text-xl font-semibold text-center mb-4">{bankData.whyChoose.subtitle}</h3>
            <p className="text-lg text-center text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-12">{bankData.whyChoose.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bankData.whyChoose.reasons.map((reason, index) => {
                const IconComponent = iconMap[reason.icon];
                return (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                    <IconComponent size={32} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">{reason.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{reason.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Our Ecosystem */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.ecosystem.title}</h2>
            <p className="text-xl font-semibold text-center mb-12">{bankData.ecosystem.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {bankData.ecosystem.services.map((service, index) => {
                const IconComponent = iconMap[service.icon];
                return (
                  <div key={index} className="p-8 bg-gray-50 dark:bg-gray-800 rounded-xl hover:shadow-lg transition-shadow">
                    <IconComponent size={40} className="text-blue-600 dark:text-blue-400 mb-4" />
                    <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{service.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Security & Trust */}
        <section className="py-16 bg-green-50 dark:bg-green-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">{bankData.security.title}</h2>
            <p className="text-xl font-semibold text-center mb-12">{bankData.security.subtitle}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              {bankData.security.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon];
                return (
                  <div key={index} className="flex items-start space-x-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                    <IconComponent size={32} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold mb-2">{feature.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-lg italic font-medium">{bankData.security.tagline}</p>
          </div>
        </section>

        {/* Client Segments */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">{bankData.clientSegments.title}</h2>
            <div className="flex justify-center space-x-4 mb-8">
              {bankData.clientSegments.segments.map((segment) => (
                <button
                  key={segment.id}
                  onClick={() => setActiveSegment(segment.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    activeSegment === segment.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {segment.label}
                </button>
              ))}
            </div>
            {bankData.clientSegments.segments
              .filter(segment => segment.id === activeSegment)
              .map((segment) => (
                <div key={segment.id} className="max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-6">{segment.title}</h3>
                  <ul className="space-y-3">
                    {segment.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <ChevronRight size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </section>

        {/* Join the Movement */}
        <section className="py-20 bg-blue-100 dark:bg-blue-900/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{bankData.joinMovement.title}</h2>
            <h3 className="text-xl font-semibold mb-4">{bankData.joinMovement.subtitle}</h3>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-10">{bankData.joinMovement.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                {bankData.joinMovement.ctaPrimary}
                <ChevronRight size={20} className="ml-2" />
              </Link>
              <Link href="/about" className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
                {bankData.joinMovement.ctaSecondary}
                <ChevronRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <Image src="/logo.png" alt="Global Dot Bank" width={50} height={50} className="mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{bankData.footer.title}</h3>
                <p className="text-sm mb-3">{bankData.footer.description}</p>
                <p className="text-sm italic">{bankData.footer.tagline}</p>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Global Offices</h4>
                {bankData.footer.offices.map((office, index) => (
                  <div key={index} className="mb-3 text-sm">
                    <div className="font-semibold text-gray-200">{office.city}</div>
                    <div className="text-gray-400">{office.address}</div>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Legal</h4>
                {bankData.footer.legal.map((item, index) => (
                  <a key={index} href={item.link} className="block mb-2 text-sm hover:text-white transition-colors">
                    {item.label}
                  </a>
                ))}
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-4">Connect</h4>
                <div className="flex space-x-4">
                  {bankData.footer.social.map((item, index) => {
                    const IconComponent = iconMap[item.icon];
                    return (
                      <a key={index} href={item.link} className="hover:text-white transition-colors" aria-label={item.platform}>
                        <IconComponent size={20} />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-6 text-center text-sm">
              <p>{bankData.footer.copyright}</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
