"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Play, Award, Smartphone, DollarSign, TrendingUp, Globe, FileText, UserCheck, Clock, Menu, X, ChevronDown, ChevronUp, Lock, Users, Zap, Star, Building, CreditCard, PiggyBank, Calculator, Headphones, Shield, Globe2, BarChart3, Target, Gift, Calendar, Clock3, MapPin, Phone, Mail, ArrowUpRight, CheckSquare, Star as StarIcon, Award as AwardIcon, Zap as ZapIcon } from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation, getCurrentLocale } from "@/lib/i18n";
import { NoTranslate, Translate } from "@/components/TranslationWrapper";
import TranslationPrompt from "@/components/TranslationPrompt";

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<number[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<number[]>([]);
  const [currentLocale, setCurrentLocale] = useState('en');

  useEffect(() => {
    setIsLoaded(true);
    try {
      const locale = getCurrentLocale();
      setCurrentLocale(locale);
    } catch (error) {
      console.warn('Error getting locale, using default:', error);
      setCurrentLocale('en');
    }
  }, []);

  const { t } = useTranslation(currentLocale as any);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Global Dot Bank...</p>
        </div>
      </div>
    );
  }

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleFeature = (index: number) => {
    setExpandedFeatures(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const toggleAccount = (index: number) => {
    setExpandedAccounts(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const features = [
    { 
      title: "Instant Account Opening", 
      shortDesc: "Open an account in minutes with just your phone number.",
      expandedDesc: "Say goodbye to paperwork and long queues. With Global Dot Bank, your phone number is all you need to start. Complete your KYC digitally, get verified in minutes, and begin banking instantly from anywhere in the world. Whether you're an individual or a business, our onboarding is fast, secure, and fully remote.",
      icon: Smartphone,
      color: "from-blue-500 to-blue-600"
    },
    { 
      title: "Transparent Fixed Deposits", 
      shortDesc: "See clear, compliant FD terms & returns.",
      expandedDesc: "We believe in transparency from day one. Our fixed deposit plans come with clear interest rates, maturity timelines, and legally compliant certificates that you can download anytime. No hidden fees, no surprises — just safe, steady growth for your savings.",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    { 
      title: "Seamless Transfers", 
      shortDesc: "Transfer funds locally and globally with ease.",
      expandedDesc: "Send and receive money across the globe with just a few taps. Whether it's paying vendors, receiving customer payments, or sending money to family, Global Dot Bank supports instant transfers across multiple currencies. Enjoy low fees, real-time status updates, and international reach.",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600"
    },
    { 
      title: "Global Trust", 
      shortDesc: "Backed by Dot Protocol Co., Ltd with international standards.",
      expandedDesc: "Operated under Dot Protocol Co., Ltd — a registered and trusted technology company — Global Dot Bank meets international business and compliance standards. Our banking infrastructure is built for global scalability, regulatory clarity, and long-term trust.",
      icon: Globe,
      color: "from-indigo-500 to-indigo-600"
    },
    { 
      title: "Secure Banking", 
      shortDesc: "Your data and funds protected with bank-grade security.",
      expandedDesc: "Your privacy and funds are our top priority. We use end-to-end encryption, real-time fraud detection, biometric verification, and 2FA (two-factor authentication) to ensure that your account is protected 24/7. You bank, we secure.",
      icon: ShieldCheck,
      color: "from-red-500 to-red-600"
    },
    { 
      title: "24/7 Support", 
      shortDesc: "Real human support whenever you need it.",
      expandedDesc: "No chatbots here. Global Dot Bank offers always-on support from trained professionals ready to assist you — day or night. Whether it's account help, transfer assistance, or onboarding guidance, we're just a message away.",
      icon: UserCheck,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const accountTypes = [
    {
      title: "Savings Account",
      shortDesc: "Secure, seamless, and suited for your everyday needs.",
      expandedDesc: "Experience smart, secure savings like never before. Our Savings Account gives you instant access, no hidden fees, and high interest rates that beat traditional banks. With instant mobile banking, smart spend tracking, and built-in budgeting tools, you can grow your money the modern way.",
      benefits: [
        "Higher-than-average interest rates",
        "No minimum balance required",
        "Instant e-KYC onboarding",
        "Auto-sweep to FD for idle balances",
        "Real-time mobile control of your money"
      ],
      icon: PiggyBank,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Current Account",
      shortDesc: "Built for businesses and professionals who move fast.",
      expandedDesc: "Whether you're a freelancer, a founder, or a full-scale enterprise, our Current Account delivers unmatched flexibility and reliability. Enjoy multi-currency support, automated invoicing, seamless integrations with your accounting software, and lightning-fast transactions — all in one place.",
      benefits: [
        "Instant payments & global transfers",
        "Zero hidden fees on monthly transactions",
        "Dedicated relationship manager for business accounts",
        "Free virtual business debit cards",
        "API access for automation-ready businesses"
      ],
      icon: Building,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Fixed Deposit Account",
      shortDesc: "Lock in your funds. Watch your money grow faster, smarter.",
      expandedDesc: "Get the highest fixed deposit returns in the market, with fully transparent terms. Whether short-term or long-term, we offer flexible tenures and attractive compound interest rates. Track your deposits in real-time and receive auto-reminders for maturity. Our FDs are 100% digital and can be auto-renewed or redeemed instantly.",
      benefits: [
        "Market-leading interest rates",
        "Transparent, downloadable contracts",
        "Auto-renew or break FD with no penalties (select tenures)",
        "Secure digital certificates for every deposit",
        "Start with as little as $100"
      ],
      icon: Calculator,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Corporate Account",
      shortDesc: "Enterprise-grade banking for companies of all sizes.",
      expandedDesc: "Global Dot Bank's Corporate Account is designed for modern companies operating across borders. From startups to multinationals, we offer a full-suite solution with custom workflows, payroll automation, FX management, and treasury services.",
      benefits: [
        "Multi-user access with secure permissions",
        "Built-in FX hedging tools",
        "Real-time global transfers at low cost",
        "Custom onboarding for regulated businesses",
        "24/7 support with assigned corporate success manager"
      ],
      icon: Users,
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Junior Account",
      shortDesc: "Banking for the next generation – safe, guided, and fun.",
      expandedDesc: "Teach your children financial literacy the smart way. Junior Accounts are co-managed with parents and allow goal-based saving, smart card spending, and milestone rewards. It's more than a bank account — it's a learning platform for your child's future financial success.",
      benefits: [
        "Parental controls & joint oversight",
        "Prepaid cards with spending limits",
        "Goal tracking: Save for school, birthdays, more",
        "Reward system for good saving habits",
        "Safe & secure: zero online exposure"
      ],
      icon: Gift,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Pension Account",
      shortDesc: "Retire with dignity. Bank with peace of mind.",
      expandedDesc: "Our Pension Account is crafted for retirees who want simplicity, safety, and consistent returns. Enjoy auto-deposit of pensions, FD-linked savings, and free withdrawal options tailored for senior citizens. Get priority support and seamless access to interest-earning schemes without the complexity of traditional banking.",
      benefits: [
        "Monthly interest payout options",
        "Priority support for senior citizens",
        "Medical emergency access fund",
        "Simplified onboarding, even offline",
        "Retirement planning dashboard"
      ],
      icon: Calendar,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "$1.5M+", label: "Assets Under Management", icon: DollarSign },
    { number: "150+", label: "Countries Supported", icon: Globe2 },
    { number: "99.9%", label: "Uptime Guarantee", icon: Shield },
    { number: "24/7", label: "Customer Support", icon: Headphones }
  ];

  const trustIndicators = [
    { title: "Bank-Grade Security", description: "256-bit encryption, biometric authentication, and real-time fraud detection", icon: Lock },
    { title: "Global Compliance", description: "Meets international banking standards and regulatory requirements", icon: CheckSquare },
    { title: "Instant Verification", description: "AI-powered KYC verification completed in under 5 minutes", icon: Zap },
    { title: "Transparent Pricing", description: "No hidden fees, clear interest rates, and upfront cost structure", icon: Target }
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
        {/* Translation Prompt */}
        <TranslationPrompt />
        
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-200 to-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-indigo-200 to-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  <NoTranslate>Global Dot Bank</NoTranslate>
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={scrollToFeatures} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">{t('navigation.features')}</button>
                <button onClick={() => window.location.href = "/about"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</button>
                <button onClick={() => window.location.href = "/investor-relations"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</button>
                <button onClick={() => window.location.href = "/corporate-governance"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</button>
                <button onClick={() => window.location.href = "/help-center"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Help Center</button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">{t('navigation.support')}</button>
                <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">{t('navigation.login')}</button>
                <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">{t('landing.openAccount')}</button>
                <LanguageSwitcher />
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <div className="md:hidden flex items-center space-x-2">
                <LanguageSwitcher variant="buttons" />
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
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
                  <button onClick={scrollToFeatures} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">{t('navigation.features')}</button>
                  <button onClick={() => window.location.href = "/about"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">About Us</button>
                  <button onClick={() => window.location.href = "/investor-relations"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Investor Relations</button>
                  <button onClick={() => window.location.href = "/corporate-governance"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Corporate Governance</button>
                  <button onClick={() => window.location.href = "/help-center"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Help Center</button>
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">{t('navigation.support')}</button>
                  <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">{t('navigation.login')}</button>
                  <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-left">{t('landing.openAccount')}</button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg border border-gray-200/50">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('landing.backedBy')}</span>
                </div>
                <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <Translate>{t('landing.heroTitle')}</Translate>
                  <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    <NoTranslate>Global Dot Bank</NoTranslate>
                  </span>
                  <span className="block text-sm text-gray-500 mt-2">🚀 <Translate>The Future of Borderless Banking is finally here</Translate></span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  {t('landing.heroDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button onClick={() => window.location.href = "/register"} className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 hover:scale-105">
                    <span>{t('landing.openAccount')}</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center space-x-2 hover:scale-105">
                    <Play className="h-5 w-5" />
                    <span>{t('landing.learnMore')}</span>
                  </button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('landing.licensedTransparent')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{t('landing.globalCompliance')}</span>
                  </div>
                </div>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="relative">
                  <div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-2xl p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl h-full p-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                          <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Balance</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">$12,450.00</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Recent Transaction</div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">+$2,500.00</div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          <div className="text-xs text-gray-500 dark:text-gray-400">Account Status</div>
                          <div className="text-sm font-medium text-green-500">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg border border-gray-200">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="px-6 py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white">Why Trust Global Dot Bank?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {trustIndicators.map((indicator, index) => (
                <div key={indicator.title} className={`text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <indicator.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{indicator.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{indicator.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Account Types */}
        <section className="px-6 py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Choose Your Perfect Account</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                From personal savings to corporate banking, we have the perfect account type for your financial needs
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountTypes.map((account, index) => (
                <div key={account.title} className={`p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}
                     onClick={() => toggleAccount(index)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 bg-gradient-to-r ${account.color} rounded-xl flex items-center justify-center`}>
                      <account.icon className="h-6 w-6 text-white" />
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      {expandedAccounts.includes(index) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{account.title}</h3>
                  <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">{account.shortDesc}</p>
                  {expandedAccounts.includes(index) && (
                    <div className="mt-4 space-y-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{account.expandedDesc}</p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">💡 Why we're better:</h4>
                        <ul className="space-y-1">
                          {account.benefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex} className="text-xs text-blue-800 dark:text-blue-200 flex items-start">
                              <span className="text-blue-600 dark:text-blue-300 mr-2">•</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); window.location.href = "/register"; }} className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Open {account.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features-section" className="px-6 py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Revolutionary Banking Features</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Experience the future of banking with our cutting-edge features designed for the modern world
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={feature.title} className={`p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}
                     onClick={() => toggleFeature(index)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`h-12 w-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      {expandedFeatures.includes(index) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{feature.shortDesc}</p>
                  {expandedFeatures.includes(index) && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feature.expandedDesc}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Thousands Worldwide</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={stat.label} className="text-center">
                  <div className="h-16 w-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.number}</div>
                  <div className="text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Ready to Start Your Banking Journey?</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Join thousands of customers who trust Global Dot Bank for their financial needs. Open your account in minutes and experience the future of banking.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl">
                Open Account Now
              </button>
              <button onClick={() => window.location.href = "/login"} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-600">
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm border border-gray-200">
                    <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    <NoTranslate>Global Dot Bank</NoTranslate>
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                  The future of borderless banking. Secure, transparent, and designed for the modern world.
                </p>
                <div className="flex space-x-4">
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Globe2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Products</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Savings Account</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Current Account</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Fixed Deposits</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Corporate Banking</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">About Us</a></li>
                  <li><a href="/investor-relations" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Investor Relations</a></li>
                  <li><a href="/corporate-governance" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Corporate Governance</a></li>
                  <li><a href="/help-center" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">News</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Global Dot Bank · All rights reserved. Operated by Dot Protocol Co., Ltd.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 