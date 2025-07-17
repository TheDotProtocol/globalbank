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
  Lock
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function AccountSelection() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const accountTypes = [
    {
      id: 'personal',
      name: 'Personal Account',
      description: 'Perfect for individuals and daily banking needs',
      features: [
        'Free online banking',
        'Virtual debit cards',
        'International transfers',
        'Mobile banking app',
        '24/7 customer support',
        'No monthly fees'
      ],
      icon: <Users className="h-8 w-8" />,
      color: 'blue',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Account',
      description: 'Enhanced features for high-value customers',
      features: [
        'All Personal features',
        'Higher transaction limits',
        'Priority customer support',
        'Investment advisory',
        'Travel insurance',
        'Concierge services'
      ],
      icon: <Star className="h-8 w-8" />,
      color: 'purple',
      popular: true
    },
    {
      id: 'business',
      name: 'Business Account',
      description: 'Complete banking solution for businesses',
      features: [
        'Multi-user access',
        'Business expense tracking',
        'Invoice management',
        'Corporate cards',
        'Business analytics',
        'Dedicated account manager'
      ],
      icon: <Building className="h-8 w-8" />,
      color: 'green',
      popular: false
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 bg-blue-50 hover:border-blue-300';
      case 'purple':
        return 'border-purple-200 bg-purple-50 hover:border-purple-300';
      case 'green':
        return 'border-green-200 bg-green-50 hover:border-green-300';
      default:
        return 'border-gray-200 bg-gray-50 hover:border-gray-300';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'purple':
        return 'text-purple-600';
      case 'green':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleContinue = () => {
    if (selectedAccount) {
      // Redirect to registration with selected account type
      window.location.href = `/register/form?type=${selectedAccount}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="icon" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">Global Dot Bank</span>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your Account Type
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the perfect account for your banking needs. Each account type 
            comes with unique features designed to enhance your financial experience.
          </p>
        </div>

        {/* Account Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {accountTypes.map((account) => (
            <div
              key={account.id}
              className={`relative p-8 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedAccount === account.id 
                  ? 'border-blue-500 shadow-xl scale-105' 
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
                  selectedAccount === account.id ? 'bg-blue-100' : 'bg-white'
                }`}>
                  <div className={getIconColor(account.color)}>
                    {account.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {account.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {account.description}
                </p>

                <div className="space-y-3">
                  {account.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
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
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Registration
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Shield className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bank-Grade Security
            </h3>
            <p className="text-gray-600">
              Your data is protected with military-grade encryption
            </p>
          </div>

          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Zap className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Instant Setup
            </h3>
            <p className="text-gray-600">
              Get started in minutes with our streamlined process
            </p>
          </div>

          <div className="text-center p-6">
            <div className="flex justify-center mb-4">
              <Globe className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Global Access
            </h3>
            <p className="text-gray-600">
              Bank from anywhere in the world, 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 