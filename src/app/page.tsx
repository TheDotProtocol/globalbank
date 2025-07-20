"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Play, Award, Smartphone, DollarSign, TrendingUp, Globe, FileText, UserCheck, Clock, Menu, X } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-white transition-all duration-500 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-1000"></div>
          <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 relative">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={32} height={32} className="object-contain" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Global Dot Bank
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Features</button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Support</button>
                <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</button>
                <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">Open Account</button>
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
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Features</button>
                  <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Support</button>
                  <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-left">Login</button>
                  <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-medium text-left">Open Account</button>
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
                <div className="inline-flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 shadow-lg">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backed by Dot Protocol Blockchain</span>
                </div>
                <h1 className={`text-5xl md:text-7xl font-bold text-white mb-6 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  The World's First
                  <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Next-Generation Bank
                  </span>
                  <span className="block text-sm text-gray-500 mt-2">🚀 Latest Version Deployed</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl">
                  A modern, borderless fiat-only bank built for today's digital-first world. 
                  Safe, fast, and secure — banking redefined.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <button onClick={() => window.location.href = "/register"} className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2 hover:scale-105">
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
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Licensed & Transparent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Global KYC & AML Compliance</span>
                  </div>
                </div>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="relative">
                  <div className="relative mx-auto w-80 h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-6">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl h-full p-4">
                      <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-8 relative">
                          <Image src="/logo.png" alt="Global Dot Bank Logo" width={32} height={32} className="object-contain" />
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
                          <div className="text-sm font-medium text-green-600">Active</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
                    <ShieldCheck className="h-6 w-6 text-green-600" />
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
              {["Savings", "Current", "Fixed Deposit", "Corporate", "Junior", "Pension"].map((type, index) => (
                <div key={type} className={`p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{type} Account</h3>
                  <p className="text-sm mb-4 text-gray-600 dark:text-gray-300">Secure, seamless and suited for your needs.</p>
                  <button onClick={() => window.location.href = "/register"} className="mt-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                    Open {type}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">Why Choose Us?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { title: "Instant Account Opening", desc: "Open an account in minutes with your phone number.", icon: Smartphone },
                { title: "Transparent Fixed Deposits", desc: "See clear, compliant FD terms & returns.", icon: DollarSign },
                { title: "Seamless Transfers", desc: "Transfer funds locally and globally with ease.", icon: TrendingUp },
                { title: "Global Trust", desc: "Backed by Dot Protocol Co., Ltd with international standards.", icon: Globe },
                { title: "Secure Banking", desc: "Your data and funds protected with bank-grade security.", icon: ShieldCheck },
                { title: "24/7 Support", desc: "Real human support whenever you need it.", icon: UserCheck }
              ].map((feature, index) => (
                <div key={feature.title} className={`p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
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
        <footer className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 text-center py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="h-8 w-8 relative">
                  <Image src="/logo.png" alt="Global Dot Bank Logo" width={32} height={32} className="object-contain" />
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
