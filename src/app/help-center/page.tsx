"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Award, Globe, Users, Zap, Star, Building, Target, Calendar, TrendingUp, Heart, Leaf, BookOpen, GraduationCap, Newspaper, ArrowUpRight, CheckSquare, MapPin, Phone, Mail, BarChart3, FileText, PieChart, DollarSign, TrendingDown, Users2, Shield, FileBarChart, CalendarDays, Download, ChevronRight, ChevronDown, ChevronUp, Menu, X, Play, Eye, Gavel, Scale, Lock, UserCheck, FileCheck, AlertTriangle, CheckCircle2, ClipboardCheck, EyeOff, MessageSquare, HelpCircle, CreditCard, Wallet, Calculator, Headphones, MessageCircle, ExternalLink, FileDown, Search, Clock, Globe2, Smartphone, Monitor, Tablet } from "lucide-react";
import Image from "next/image";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation, getCurrentLocale } from "@/lib/i18n";
import { NoTranslate, Translate } from "@/components/TranslationWrapper";
import TranslationPrompt from "@/components/TranslationPrompt";

export default function HelpCenterPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    faq: false,
    rates: false,
    downloads: false,
    contact: false
  });
  const [searchQuery, setSearchQuery] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const faqData = {
    account: [
      {
        question: "How do I open an account with Global Dot Bank?",
        answer: "Opening an account is simple! Visit our website or download our mobile app, complete the online application form, upload required documents for KYC verification, and our team will review and activate your account within 24-48 hours."
      },
      {
        question: "What documents are required for KYC verification?",
        answer: "For KYC verification, you'll need: Government-issued ID (passport, national ID, or driver's license), proof of address (utility bill or bank statement), and proof of income (salary slip or tax returns). Additional documents may be required based on your country of residence."
      },
      {
        question: "Can I open a multi-currency account?",
        answer: "Yes! Global Dot Bank offers multi-currency accounts supporting major currencies including USD, EUR, GBP, JPY, and more. You can hold, transfer, and exchange currencies seamlessly through our platform."
      }
    ],
    security: [
      {
        question: "How is my data protected?",
        answer: "Your data is protected with bank-grade security including end-to-end encryption, multi-factor authentication, biometric security, and compliance with international data protection regulations. We never share your personal information with third parties without your consent."
      },
      {
        question: "What should I do if I suspect fraudulent activity?",
        answer: "If you suspect fraudulent activity, immediately contact our 24/7 security team at security@globaldotbank.com or call our fraud hotline. We'll freeze your account, investigate the activity, and guide you through the recovery process."
      }
    ],
    operations: [
      {
        question: "How do I create virtual cards?",
        answer: "Creating virtual cards is easy! Log into your account, go to the 'Cards' section, select 'Create Virtual Card', choose your spending limits and currency, and your virtual card will be instantly available for online transactions."
      },
      {
        question: "What are the procedures for fund transfers?",
        answer: "Fund transfers can be made through our app or website. Select 'Transfer', choose the recipient (saved contacts or new), enter amount and currency, review details, and confirm. Transfers are typically instant for internal accounts and 1-3 business days for external transfers."
      },
      {
        question: "How are interest rates calculated for fixed deposits?",
        answer: "Interest rates for fixed deposits are calculated based on the principal amount, tenure, and current market rates. We offer competitive rates that are typically higher than savings accounts, with interest credited at maturity or monthly, depending on your preference."
      }
    ]
  };

  const ratesData = {
    savings: "Competitive interest rates starting from 2.5% APY",
    fixedDeposits: "Tiered rates from 3.5% to 5.2% APY with flexible tenures (3 months to 5 years)",
    transactions: "Transparent fees with no hidden charges. Free internal transfers, minimal fees for external transfers",
    virtualCards: "Low-cost issuance ($5) and maintenance ($2/month) with no foreign transaction fees"
  };

  const downloadsData = [
    { name: "Account Application Form", type: "PDF", size: "245 KB" },
    { name: "E-Service Transaction Instructions", type: "PDF", size: "1.2 MB" },
    { name: "Terms & Conditions", type: "PDF", size: "890 KB" },
    { name: "Privacy Policy", type: "PDF", size: "756 KB" },
    { name: "Mobile App User Manual", type: "PDF", size: "2.1 MB" },
    { name: "Virtual Card Guide", type: "PDF", size: "1.5 MB" }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/logo.png"
                alt="Global Dot Bank"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                Global Dot Bank
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
<<<<<<< HEAD
              <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</Link>
              <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</Link>
              <Link href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</Link>
              <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</Link>
              <Link href="/help-center" className="text-blue-600 dark:text-blue-400 font-semibold">Help Center</Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</Link>
=======
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
              <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
              <a href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</a>
              <a href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</a>
              <a href="/help-center" className="text-blue-600 dark:text-blue-400 font-semibold">Help Center</a>
              <a href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</a>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
<<<<<<< HEAD
                <Link href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</Link>
                <Link href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</Link>
                <Link href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</Link>
                <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</Link>
                <Link href="/help-center" className="text-blue-600 dark:text-blue-400 font-semibold">Help Center</Link>
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</Link>
=======
                <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
                <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
                <a href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</a>
                <a href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</a>
                <a href="/help-center" className="text-blue-600 dark:text-blue-400 font-semibold">Help Center</a>
                <a href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</a>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Help Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Find answers to your questions, download forms, and get the support you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, FAQs, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
                <nav className="space-y-2">
                  <button
                    onClick={() => toggleSection('faq')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Frequently Asked Questions</span>
                    {expandedSections.faq ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('rates')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Rates & Fees</span>
                    {expandedSections.rates ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('downloads')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Downloads</span>
                    {expandedSections.downloads ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('contact')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Contact & Support</span>
                    {expandedSections.contact ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* FAQ Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions (FAQ)</h2>
                </div>
                
                {expandedSections.faq && (
                  <div className="space-y-8">
                    {/* Account & Services */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                        Account & Services
                      </h3>
                      <div className="space-y-4">
                        {faqData.account.map((item, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.question}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Security */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-green-600" />
                        Security
                      </h3>
                      <div className="space-y-4">
                        {faqData.security.map((item, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.question}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Banking Operations */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                        Banking Operations
                      </h3>
                      <div className="space-y-4">
                        {faqData.operations.map((item, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">{item.question}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{item.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rates & Fees Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Calculator className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rates & Fees</h2>
                </div>
                
                {expandedSections.rates && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <PieChart className="h-5 w-5 mr-2 text-blue-600" />
                        Savings Account
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{ratesData.savings}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        Multi-Currency Fixed Deposit
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{ratesData.fixedDeposits}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <ArrowRight className="h-5 w-5 mr-2 text-purple-600" />
                        Transaction Fees
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{ratesData.transactions}</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                        Virtual Card Fees
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{ratesData.virtualCards}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Downloads Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Download className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Downloads</h2>
                </div>
                
                {expandedSections.downloads && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {downloadsData.map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <FileDown className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.type} • {item.size}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact & Support Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Headphones className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact & Support</h2>
                </div>
                
                {expandedSections.contact && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Mail className="h-5 w-5 mr-2 text-blue-600" />
                          Email Support
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">support@globaldotbank.com</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Response within 24 hours</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                          Live Chat
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Available 24/7</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Via website and PWA</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Building className="h-5 w-5 mr-2 text-purple-600" />
                          Branches & Service Points
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">Locations list</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Coming soon</p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-orange-600" />
                          LINE Support
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">@GlobalDotBankLive</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">For instant communication</p>
                      </div>
                    </div>
                    
                    {/* Support Channels */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support Channels</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center">
                          <Monitor className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Website</span>
                        </div>
                        <div className="flex items-center">
                          <Smartphone className="h-5 w-5 text-green-600 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">Mobile App</span>
                        </div>
                        <div className="flex items-center">
                          <Tablet className="h-5 w-5 text-purple-600 mr-2" />
                          <span className="text-gray-700 dark:text-gray-300">PWA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Global Dot Bank</h3>
              <p className="text-gray-400 text-sm">
                Next-generation digital banking solutions for a connected world.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Savings Account</li>
                <li>Current Account</li>
                <li>Fixed Deposits</li>
                <li>Corporate Banking</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
<<<<<<< HEAD
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/investor-relations" className="hover:text-white transition-colors">Investor Relations</Link></li>
                <li><Link href="/corporate-governance" className="hover:text-white transition-colors">Corporate Governance</Link></li>
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
=======
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/investor-relations" className="hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="/corporate-governance" className="hover:text-white transition-colors">Corporate Governance</a></li>
                <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
<<<<<<< HEAD
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
=======
                <li><a href="/help-center" className="hover:text-white transition-colors">Help Center</a></li>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                <li>Security</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 Global Dot Bank. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <TranslationPrompt />
    </div>
  );
} 