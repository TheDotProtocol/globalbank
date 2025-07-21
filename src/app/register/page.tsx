'use client';

import { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  Globe, 
  TrendingUp, 
  CreditCard,
  Smartphone,
  Users,
  Building,
  Star,
  Zap,
  Lock,
  Sun,
  Moon,
  DollarSign,
  PiggyBank,
  GraduationCap,
  Heart
} from 'lucide-react';
import Image from "next/image";

export default function AccountSelection() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

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
      icon: <PiggyBank className="h-8 w-8" />,
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
      icon: <TrendingUp className="h-8 w-8" />,
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
      icon: <DollarSign className="h-8 w-8" />,
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
      icon: <Building className="h-8 w-8" />,
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
      icon: <GraduationCap className="h-8 w-8" />,
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
      icon: <Heart className="h-8 w-8" />,
      color: 'red',
      popular: false
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50 hover:border-blue-300 dark:border-blue-700 dark:bg-blue-900/20 dark:hover:border-blue-600';
      case 'purple':
        return 'border-purple-200 bg-purple-50 hover:border-purple-300 dark:border-purple-700 dark:bg-purple-900/20 dark:hover:border-purple-600';
      case 'green':
        return 'border-green-200 bg-green-50 hover:border-green-300 dark:border-green-700 dark:bg-green-900/20 dark:hover:border-green-600';
      case 'indigo':
        return 'border-indigo-200 bg-indigo-50 hover:border-indigo-300 dark:border-indigo-700 dark:bg-indigo-900/20 dark:hover:border-indigo-600';
      case 'yellow':
        return 'border-yellow-200 bg-yellow-50 hover:border-yellow-300 dark:border-yellow-700 dark:bg-yellow-900/20 dark:hover:border-yellow-600';
      case 'red':
        return 'border-red-200 bg-red-50 hover:border-red-300 dark:border-red-700 dark:bg-red-900/20 dark:hover:border-red-600';
      default:
        return 'border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      case 'purple':
        return 'text-purple-600 dark:text-purple-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
      case 'indigo':
        return 'text-indigo-600 dark:text-indigo-400';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'red':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const handleContinue = () => {
    if (selectedAccount) {
      window.location.href = `/register/form?type=${selectedAccount}`;
    }
  };

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
                  <Image
                    src="/logo.png"
                    alt="Global Dot Bank Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Home</span>
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Account Type
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Select the perfect account for your banking needs. Each account type 
              comes with unique features designed to enhance your financial experience.
            </p>
          </div>

          {/* Account Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {accountTypes.map((account) => (
              <div
                key={account.id}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer backdrop-blur-sm ${
                  selectedAccount === account.id 
                    ? 'border-blue-500 shadow-xl scale-105 bg-white/90 dark:bg-gray-800/90' 
                    : getColorClasses(account.color)
                }`}
                onClick={() => setSelectedAccount(account.id)}
              >
                {account.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    selectedAccount === account.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-white dark:bg-gray-700'
                  }`}>
                    <div className={getIconColor(account.color)}>
                      {account.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {account.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {account.description}
                  </p>

                  <div className="space-y-3">
                    {account.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleContinue}
              disabled={!selectedAccount}
              className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 ${
                selectedAccount
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              }`}
            >
              Continue to Registration
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Bank-Grade Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is protected with military-grade encryption
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center mb-4">
                <Zap className="h-12 w-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Instant Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get started in minutes with our streamlined process
              </p>
            </div>

            <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center mb-4">
                <Globe className="h-12 w-12 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Global Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Bank from anywhere in the world, 24/7
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
