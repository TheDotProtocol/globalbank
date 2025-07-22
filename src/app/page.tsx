"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Play, Award, Smartphone, DollarSign, TrendingUp, Globe, FileText, UserCheck, Clock, Menu, X, ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState<number[]>([]);
  const [expandedAccounts, setExpandedAccounts] = useState<number[]>([]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      icon: Smartphone 
    },
    { 
      title: "Transparent Fixed Deposits", 
      shortDesc: "See clear, compliant FD terms & returns.",
      expandedDesc: "We believe in transparency from day one. Our fixed deposit plans come with clear interest rates, maturity timelines, and legally compliant certificates that you can download anytime. No hidden fees, no surprises — just safe, steady growth for your savings.",
      icon: DollarSign 
    },
    { 
      title: "Seamless Transfers", 
      shortDesc: "Transfer funds locally and globally with ease.",
      expandedDesc: "Send and receive money across the globe with just a few taps. Whether it's paying vendors, receiving customer payments, or sending money to family, Global Dot Bank supports instant transfers across multiple currencies. Enjoy low fees, real-time status updates, and international reach.",
      icon: TrendingUp 
    },
    { 
      title: "Global Trust", 
      shortDesc: "Backed by Dot Protocol Co., Ltd with international standards.",
      expandedDesc: "Operated under Dot Protocol Co., Ltd — a registered and trusted technology company — Global Dot Bank meets international business and compliance standards. Our banking infrastructure is built for global scalability, regulatory clarity, and long-term trust.",
      icon: Globe 
    },
    { 
      title: "Secure Banking", 
      shortDesc: "Your data and funds protected with bank-grade security.",
      expandedDesc: "Your privacy and funds are our top priority. We use end-to-end encryption, real-time fraud detection, biometric verification, and 2FA (two-factor authentication) to ensure that your account is protected 24/7. You bank, we secure.",
      icon: ShieldCheck 
    },
    { 
      title: "24/7 Support", 
      shortDesc: "Real human support whenever you need it.",
      expandedDesc: "No chatbots here. Global Dot Bank offers always-on support from trained professionals ready to assist you — day or night. Whether it's account help, transfer assistance, or onboarding guidance, we're just a message away.",
      icon: UserCheck 
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-300 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-300 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-8 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 bg-white/90 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <button onClick={scrollToFeatures} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Features</button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Support</button>
                <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</button>
                <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">Open Account</button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                  <button onClick={scrollToFeatures} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Features</button>
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Support</button>
                  <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Login</button>
                  <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-medium text-left">Open Account</button>
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
                <div className="inline-flex items-center space-x-2 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backed by Dot Protocol Blockchain</span>
                </div>
                <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  The World's First
                  <span className="block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                    Next-Generation Bank
                  </span>
                  <span className="block text-sm text-gray-500 mt-2">🚀 The Future of Borderless Banking is finally here</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  A modern, borderless fiat-only bank built for today's digital-first world. 
                  Safe, fast, and secure — banking redefined.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button onClick={() => window.location.href = "/register"} className="group bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 hover:scale-105">
                    <span>Open an Account</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="group bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center space-x-2 hover:scale-105">
                    <Play className="h-5 w-5" />
                    <span>Learn More</span>
                  </button>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Licensed & Transparent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Global KYC & AML Compliance</span>
                  </div>
                </div>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="relative">
                  <div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl h-full p-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm">
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
                  <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Types */}
        <section className="px-6 py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Choose Your Account Type</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {accountTypes.map((account, index) => (
                <div key={account.title} className={`p-6 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}
                     onClick={() => toggleAccount(index)}>
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{account.title}</h3>
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      {expandedAccounts.includes(index) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                    </button>
                  </div>
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
                  <button onClick={(e) => { e.stopPropagation(); window.location.href = "/register"; }} className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Open {account.title}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features-section" className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Why Choose Us?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={feature.title} className={`p-6 bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}
                     onClick={() => toggleFeature(index)}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <button className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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

        {/* Trust Section */}
        <section className="px-6 py-16 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Trusted by Hundreds Worldwide</h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">$1.5M+</div>
                <div className="text-blue-100">Assets Under Management</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">150+</div>
                <div className="text-blue-100">Countries Supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime Guarantee</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 text-center py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="h-10 w-10 relative bg-white rounded-lg p-1 shadow-sm">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                © {new Date().getFullYear()} Global Dot Bank · All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
} 