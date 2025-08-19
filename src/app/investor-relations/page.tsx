"use client";
import { useState, useEffect } from "react";
<<<<<<< HEAD
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Award, Globe, Users, Zap, Star, Building, Target, Calendar, TrendingUp, Heart, Leaf, BookOpen, GraduationCap, Newspaper, ArrowUpRight, CheckSquare, MapPin, Phone, Mail, BarChart3, FileText, PieChart, DollarSign, TrendingDown, Users2, Shield, FileBarChart, CalendarDays, Download, ChevronRight, ChevronDown, ChevronUp, Menu, X, Play, Eye, Gavel, Scale, Lock, UserCheck, FileCheck, AlertTriangle, CheckCircle2, ClipboardCheck, EyeOff, MessageSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
=======
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Award, Globe, Users, Zap, Star, Building, Target, Calendar, TrendingUp, Heart, Leaf, BookOpen, GraduationCap, Newspaper, ArrowUpRight, CheckSquare, Star as StarIcon, Award as AwardIcon, Zap as ZapIcon, MapPin, Phone, Mail, Globe2, BarChart3, Clock3, FileText, PieChart, DollarSign, TrendingDown, Users2, Shield, FileBarChart, CalendarDays, Download, ExternalLink, ChevronRight, ChevronDown, ChevronUp, Menu, X, Play } from "lucide-react";
import Image from "next/image";
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation, getCurrentLocale } from "@/lib/i18n";
import { NoTranslate, Translate } from "@/components/TranslationWrapper";
import TranslationPrompt from "@/components/TranslationPrompt";

export default function InvestorRelationsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    governance: false,
    general: false,
    financial: false,
    services: false,
    calendar: false
  });
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
              <Link href="/investor-relations" className="text-blue-600 dark:text-blue-400 font-semibold">Investor Relations</Link>
              <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</Link>
              <Link href="/help-center" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Help Center</Link>
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</Link>
=======
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
              <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
              <a href="/investor-relations" className="text-blue-600 dark:text-blue-400 font-semibold">Investor Relations</a>
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
                <Link href="/investor-relations" className="text-blue-600 dark:text-blue-400 font-semibold">Investor Relations</Link>
                <Link href="/corporate-governance" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Corporate Governance</Link>
                <Link href="/help-center" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Help Center</Link>
                <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</Link>
=======
                <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
                <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
                <a href="/investor-relations" className="text-blue-600 dark:text-blue-400 font-semibold">Investor Relations</a>
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
              Investor Relations
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
<<<<<<< HEAD
              Comprehensive information for investors, shareholders, and stakeholders about Global Dot Bank's performance, governance, and strategic direction
=======
              Transparent communication and comprehensive financial information for our valued shareholders and investors
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
            </p>
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
<<<<<<< HEAD
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Investor Sections</h3>
=======
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Navigation</h3>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                <nav className="space-y-2">
                  <button
                    onClick={() => toggleSection('governance')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Corporate Governance</span>
                    {expandedSections.governance ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('general')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">General Information</span>
                    {expandedSections.general ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('financial')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
<<<<<<< HEAD
                    <span className="font-medium text-gray-700 dark:text-gray-300">Financial Information & Reports</span>
=======
                    <span className="font-medium text-gray-700 dark:text-gray-300">Financial Information</span>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                    {expandedSections.financial ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('services')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Shareholder Services</span>
                    {expandedSections.services ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('calendar')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Calendar & Events</span>
                    {expandedSections.calendar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Corporate Governance Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Corporate Governance</h2>
                </div>
                
                {expandedSections.governance && (
                  <div className="space-y-6">
<<<<<<< HEAD
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Global Dot Bank maintains the highest standards of corporate governance, ensuring transparency, accountability, and sustainable value creation for all stakeholders.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Governance Documents
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Statement of Corporate Governance Principles
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Statement of Business Conduct
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Memorandum & Articles of Association
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
=======
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Governance Documents</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Statement of Corporate Governance Principles
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Statement of Business Conduct
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Memorandum & Articles of Association
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                            Code of Conduct
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <ShieldCheck className="h-5 w-5 mr-2 text-green-600" />
                          Governance Framework
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-green-600" />
                            Rights and Equitable Treatment of Shareholders
                          </li>
                          <li className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-green-600" />
                            Disclosure and Transparency
                          </li>
                          <li className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                            Roles and Responsibilities of the Board
                          </li>
                          <li className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-green-600" />
                            Corporate Governance Achievements
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Shareholder Rights</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-green-600" />
                            Rights and Equitable Treatment
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            Disclosure and Transparency
                          </li>
                          <li className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-green-600" />
                            Board Roles and Responsibilities
                          </li>
                          <li className="flex items-center">
                            <Award className="h-4 w-4 mr-2 text-green-600" />
                            Governance Achievements
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* General Information Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
<<<<<<< HEAD
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
=======
                  <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">General Information</h2>
                </div>
                
                {expandedSections.general && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                          Bank Overview
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Bank at a Glance
                          </li>
                          <li className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-blue-600" />
                            Credit Ratings
                          </li>
                          <li className="flex items-center">
                            <PieChart className="h-4 w-4 mr-2 text-blue-600" />
                            Authorized & Issued Shares
                          </li>
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-blue-600" />
                            Shareholder Structure
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Bank Overview</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-blue-600" />
                            Bank at a Glance
                          </li>
                          <li className="flex items-center">
                            <Star className="h-4 w-4 mr-2 text-yellow-600" />
                            Credit Ratings
                          </li>
                          <li className="flex items-center">
                            <PieChart className="h-4 w-4 mr-2 text-purple-600" />
                            Shareholder Structure
                          </li>
                          <li className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            EPS & Dividend Policy
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                          Financial Metrics
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                            EPS & Dividend Policy
                          </li>
                          <li className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                            Historical Trading Data
                          </li>
                          <li className="flex items-center">
                            <FileBarChart className="h-4 w-4 mr-2 text-green-600" />
                            Market Data
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-green-600" />
                            Debentures
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-purple-600" />
                        Documentation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Prospectus
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Offering Circular
                          </li>
                        </ul>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-purple-600" />
                            Analyst Coverage
                          </li>
                          <li className="flex items-center">
                            <Newspaper className="h-4 w-4 mr-2 text-purple-600" />
                            Research Reports
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Market Data</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                            Historical Trading Data
                          </li>
                          <li className="flex items-center">
                            <FileBarChart className="h-4 w-4 mr-2 text-blue-600" />
                            Market Data
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Debentures
                          </li>
                          <li className="flex items-center">
                            <Download className="h-4 w-4 mr-2 text-orange-600" />
                            Prospectus & Circulars
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

<<<<<<< HEAD
              {/* Financial Information & Reports Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
=======
              {/* Financial Information Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Information & Reports</h2>
                </div>
                
                {expandedSections.financial && (
                  <div className="space-y-6">
<<<<<<< HEAD
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Access comprehensive financial reports, performance metrics, and strategic insights to understand Global Dot Bank's financial position and growth trajectory.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
                          Financial Highlights
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-purple-600" />
                            Quarterly Reports
                          </li>
                          <li className="flex items-center">
                            <FileBarChart className="h-4 w-4 mr-2 text-purple-600" />
                            Annual Reports
                          </li>
                          <li className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-purple-600" />
                            Financial Statements
                          </li>
                          <li className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-purple-600" />
                            Performance Metrics
=======
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Financial Reports</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileBarChart className="h-4 w-4 mr-2 text-blue-600" />
                            Financial Highlights
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-green-600" />
                            Annual Reports
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Quarterly Reports
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-orange-600" />
                            SEC/SET Letters
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Regulatory Filings
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Letters to SEC / SET
                          </li>
                          <li className="flex items-center">
                            <FileCheck className="h-4 w-4 mr-2 text-blue-600" />
                            Compliance Reports
                          </li>
                          <li className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-blue-600" />
                            Risk Disclosures
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Play className="h-5 w-5 mr-2 text-green-600" />
                        Presentations & Updates
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Play className="h-4 w-4 mr-2 text-green-600" />
                            Investor Presentations
                          </li>
                          <li className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-green-600" />
                            Webcasts
                          </li>
                        </ul>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Investor Communications</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Globe className="h-4 w-4 mr-2 text-blue-600" />
                            Investor Presentations
                          </li>
                          <li className="flex items-center">
                            <Play className="h-4 w-4 mr-2 text-red-600" />
                            Webcasts
                          </li>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          <li className="flex items-center">
                            <Newspaper className="h-4 w-4 mr-2 text-green-600" />
                            K-IR News
                          </li>
                          <li className="flex items-center">
<<<<<<< HEAD
                            <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
=======
                            <Mail className="h-4 w-4 mr-2 text-purple-600" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                            Investor Updates
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shareholder Services Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
<<<<<<< HEAD
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
=======
                  <Users className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shareholder Services</h2>
                </div>
                
                {expandedSections.services && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Users2 className="h-5 w-5 mr-2 text-orange-600" />
                          Shareholder Meetings
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                            General Meeting of Shareholders
                          </li>
                          <li className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-orange-600" />
                            Meeting Notices
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-orange-600" />
                            Meeting Minutes
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-600" />
                            Voting Results
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Shareholder Meetings</h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            General Meeting of Shareholders
                          </li>
                          <li className="flex items-center">
                            <Newspaper className="h-4 w-4 mr-2 text-green-600" />
                            Shareholder Newsletter
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-purple-600" />
                            Annual Report Requests
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
<<<<<<< HEAD
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Newspaper className="h-5 w-5 mr-2 text-blue-600" />
                          Communications
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Newspaper className="h-4 w-4 mr-2 text-blue-600" />
                            Shareholder Newsletter
                          </li>
                          <li className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-blue-600" />
                            Email Updates
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Annual Report Requests
                          </li>
                          <li className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                            Contact Information
                          </li>
                        </ul>
=======
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                        <div className="space-y-3 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-blue-600" />
                            investor@globaldotbank.com
                          </div>
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-green-600" />
                            +1 (555) 123-4567
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                            Investor Relations Department
                          </div>
                        </div>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Calendar & Events Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
<<<<<<< HEAD
                  <Calendar className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
=======
                  <CalendarDays className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar & Events</h2>
                </div>
                
                {expandedSections.calendar && (
                  <div className="space-y-6">
<<<<<<< HEAD
                    <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Stay informed about important corporate events, shareholder meetings, and investor briefings with our comprehensive calendar of events.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Calendar className="h-5 w-5 mr-2 text-red-600" />
                          Corporate Events
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-red-600" />
                            Annual General Meeting
                          </li>
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-red-600" />
                            Board Meetings
                          </li>
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-red-600" />
                            Strategy Sessions
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Users2 className="h-5 w-5 mr-2 text-blue-600" />
                          Shareholder Meetings
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-blue-600" />
                            Extraordinary General Meeting
                          </li>
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-blue-600" />
                            Special Resolutions
                          </li>
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-blue-600" />
                            Voting Deadlines
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Play className="h-5 w-5 mr-2 text-green-600" />
                          Investor Briefings
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Play className="h-4 w-4 mr-2 text-green-600" />
                            Earnings Calls
                          </li>
                          <li className="flex items-center">
                            <Play className="h-4 w-4 mr-2 text-green-600" />
                            Analyst Briefings
                          </li>
                          <li className="flex items-center">
                            <Play className="h-4 w-4 mr-2 text-green-600" />
                            Roadshows
                          </li>
                        </ul>
=======
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Upcoming Events</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Q4 2025 Earnings Call</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">February 15, 2025 • 2:00 PM EST</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Register
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Annual Shareholder Meeting</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">March 20, 2025 • 10:00 AM EST</p>
                          </div>
                          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                            Details
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-600 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900 dark:text-white">Investor Day 2025</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-300">May 10, 2025 • All Day Event</p>
                          </div>
                          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                            Register
                          </button>
                        </div>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
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
                <li>Careers</li>
                <li>Contact</li>
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
<<<<<<< HEAD
                <li><Link href="/help-center" className="hover:text-white transition-colors">Help Center</Link></li>
=======
                <li>Help Center</li>
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