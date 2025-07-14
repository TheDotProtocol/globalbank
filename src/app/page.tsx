'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Shield, 
  Globe, 
  Zap, 
  Star,
  CheckCircle,
  Lock,
  Users,
  TrendingUp,
  CreditCard,
  Smartphone,
  Globe2
} from 'lucide-react';
import Logo from '@/components/Logo';

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="icon" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">GlobalBank</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </button>
              <button className="text-gray-600 hover:text-gray-900 transition-colors">
                Support
              </button>
              <button 
                onClick={() => window.location.href = '/login'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center">
            {/* Animated Logo */}
            <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl mb-6">
                <Globe2 className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Tagline */}
            <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              The World's First
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                New Age Bank
              </span>
            </h1>

            <p className={`text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              Experience banking reimagined with cutting-edge technology, 
              unparalleled security, and global financial services designed for the digital age.
            </p>

            {/* CTA Buttons */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <button 
                onClick={() => window.location.href = '/login'}
                className="group bg-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Login to Online Banking</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => window.location.href = '/register'}
                className="group bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 flex items-center space-x-2"
              >
                <span>Open an Account</span>
                <Star className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo variant="icon" className="h-8 w-8" />
                <span className="text-xl font-bold">GlobalBank</span>
              </div>
              <p className="text-gray-400">
                The world's first new age bank, redefining digital banking for the future.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Products</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Personal Banking</li>
                <li>Business Banking</li>
                <li>Investment Services</li>
                <li>International Transfers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Security</li>
                <li>
                  <button 
                    onClick={() => window.location.href = '/legal/privacy'}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <button 
                    onClick={() => window.location.href = '/legal/terms'}
                    className="hover:text-white transition-colors"
                  >
                    Terms of Use
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.location.href = '/legal/privacy'}
                    className="hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.location.href = '/legal/aml-kyc'}
                    className="hover:text-white transition-colors"
                  >
                    AML/KYC Policy
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => window.location.href = '/legal/cookies'}
                    className="hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GlobalBank. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
