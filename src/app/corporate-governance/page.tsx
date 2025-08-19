"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Award, Globe, Users, Zap, Star, Building, Target, Calendar, TrendingUp, Heart, Leaf, BookOpen, GraduationCap, Newspaper, ArrowUpRight, CheckSquare, MapPin, Phone, Mail, BarChart3, FileText, PieChart, DollarSign, TrendingDown, Users2, Shield, FileBarChart, CalendarDays, Download, ChevronRight, ChevronDown, ChevronUp, Menu, X, Play, Eye, Gavel, Scale, Lock, UserCheck, FileCheck, AlertTriangle, CheckCircle2, ClipboardCheck, EyeOff, MessageSquare } from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation, getCurrentLocale } from "@/lib/i18n";
import { NoTranslate, Translate } from "@/components/TranslationWrapper";
import TranslationPrompt from "@/components/TranslationPrompt";

export default function CorporateGovernancePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    principles: false,
    framework: false,
    rights: false,
    transparency: false
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
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
              <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
              <a href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</a>
              <a href="/corporate-governance" className="text-blue-600 dark:text-blue-400 font-semibold">Corporate Governance</a>
              <a href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</a>
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
                <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</a>
                <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">About Us</a>
                <a href="/investor-relations" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Investor Relations</a>
                <a href="/corporate-governance" className="text-blue-600 dark:text-blue-400 font-semibold">Corporate Governance</a>
                <a href="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</a>
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
              Corporate Governance
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              High standards of corporate governance ensuring accountability, transparency, and integrity across all operations
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Governance Sections</h3>
                <nav className="space-y-2">
                  <button
                    onClick={() => toggleSection('principles')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Governance Principles</span>
                    {expandedSections.principles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('framework')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Governance Framework</span>
                    {expandedSections.framework ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('rights')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Shareholder Rights</span>
                    {expandedSections.rights ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={() => toggleSection('transparency')}
                    className="w-full flex items-center justify-between p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-medium text-gray-700 dark:text-gray-300">Transparency</span>
                    {expandedSections.transparency ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              {/* Governance Principles Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Principles</h2>
                </div>
                
                {expandedSections.principles && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Global Dot Bank is committed to <strong>high standards of corporate governance</strong>, ensuring accountability, transparency, and integrity across all operations.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          Core Principles
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Accountability to shareholders
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Transparency in operations
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Integrity in all dealings
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Fair treatment of stakeholders
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Scale className="h-5 w-5 mr-2 text-blue-600" />
                          Governance Standards
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Regulatory compliance
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Risk management
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Ethical business practices
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                            Sustainable development
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Governance Framework Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Building className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Governance Framework</h2>
                </div>
                
                {expandedSections.framework && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-blue-600" />
                          Board of Directors
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-blue-600" />
                            Roles and responsibilities
                          </li>
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            Board committees
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-blue-600" />
                            Independent directors
                          </li>
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Regular board meetings
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <UserCheck className="h-5 w-5 mr-2 text-green-600" />
                          Management
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Building className="h-4 w-4 mr-2 text-green-600" />
                            Executive leadership duties
                          </li>
                          <li className="flex items-center">
                            <Target className="h-4 w-4 mr-2 text-green-600" />
                            Strategic oversight
                          </li>
                          <li className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-green-600" />
                            Performance monitoring
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                            Compliance oversight
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Lock className="h-5 w-5 mr-2 text-purple-600" />
                          Internal Controls
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileCheck className="h-4 w-4 mr-2 text-purple-600" />
                            Risk management policies
                          </li>
                          <li className="flex items-center">
                            <ClipboardCheck className="h-4 w-4 mr-2 text-purple-600" />
                            Control procedures
                          </li>
                          <li className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-purple-600" />
                            Risk assessment
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileCheck className="h-5 w-5 mr-2 text-orange-600" />
                          Audit & Compliance
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-orange-600" />
                            Independent audit
                          </li>
                          <li className="flex items-center">
                            <Scale className="h-4 w-4 mr-2 text-orange-600" />
                            Regulatory compliance
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-orange-600" />
                            Compliance monitoring
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <BookOpen className="h-5 w-5 mr-2 text-red-600" />
                          Ethics & Conduct
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-red-600" />
                            Code of conduct
                          </li>
                          <li className="flex items-center">
                            <UserCheck className="h-4 w-4 mr-2 text-red-600" />
                            Employee guidelines
                          </li>
                          <li className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2 text-red-600" />
                            Ethical standards
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Shareholder Rights Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Gavel className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shareholder Rights</h2>
                </div>
                
                {expandedSections.rights && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Global Dot Bank recognizes and protects the fundamental rights of all shareholders, ensuring equitable treatment and meaningful participation in corporate decision-making.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Scale className="h-5 w-5 mr-2 text-purple-600" />
                          Equitable Treatment
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Users2 className="h-4 w-4 mr-2 text-purple-600" />
                            Equal rights for all shareholders
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-purple-600" />
                            Fair treatment regardless of size
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-purple-600" />
                            Protection against discrimination
                          </li>
                          <li className="flex items-center">
                            <Gavel className="h-4 w-4 mr-2 text-purple-600" />
                            Legal recourse for violations
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Access to Information
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-blue-600" />
                            Access to corporate documents
                          </li>
                          <li className="flex items-center">
                            <BarChart3 className="h-4 w-4 mr-2 text-blue-600" />
                            Financial statements
                          </li>
                          <li className="flex items-center">
                            <Newspaper className="h-4 w-4 mr-2 text-blue-600" />
                            Annual reports
                          </li>
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                            Meeting notices and agendas
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                        Voting Rights & Participation
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                            Right to vote on major decisions
                          </li>
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-green-600" />
                            Participation in shareholder meetings
                          </li>
                          <li className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-green-600" />
                            Proxy voting rights
                          </li>
                        </ul>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
                            Right to ask questions
                          </li>
                          <li className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-green-600" />
                            Proposal submission rights
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            Protection of minority rights
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Transparency Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transparency</h2>
                </div>
                
                {expandedSections.transparency && (
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-6">
                      <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                        Global Dot Bank maintains the highest standards of transparency, providing clear and accessible information to all stakeholders while ensuring regulatory compliance across all jurisdictions.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2 text-orange-600" />
                          Financial Disclosure
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <FileBarChart className="h-4 w-4 mr-2 text-orange-600" />
                            Regular financial performance reports
                          </li>
                          <li className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                            Quarterly and annual disclosures
                          </li>
                          <li className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2 text-orange-600" />
                            Performance metrics and KPIs
                          </li>
                          <li className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2 text-orange-600" />
                            Financial statements and audits
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          Governance Reports
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
                            Public access to governance reports
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-blue-600" />
                            Board composition and structure
                          </li>
                          <li className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-blue-600" />
                            Executive compensation disclosure
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-blue-600" />
                            Compliance and audit reports
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Globe className="h-5 w-5 mr-2 text-green-600" />
                        Regulatory Compliance
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <ShieldCheck className="h-4 w-4 mr-2 text-green-600" />
                            Commitment to all jurisdictions
                          </li>
                          <li className="flex items-center">
                            <Scale className="h-4 w-4 mr-2 text-green-600" />
                            Banking regulations compliance
                          </li>
                          <li className="flex items-center">
                            <FileCheck className="h-4 w-4 mr-2 text-green-600" />
                            Regular compliance audits
                          </li>
                        </ul>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-green-600" />
                            Risk disclosure requirements
                          </li>
                          <li className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-green-600" />
                            Transparent reporting standards
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-green-600" />
                            Data protection compliance
                          </li>
                        </ul>
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
                <li><a href="/about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="/investor-relations" className="hover:text-white transition-colors">Investor Relations</a></li>
                <li><a href="/corporate-governance" className="hover:text-white transition-colors">Corporate Governance</a></li>
                <li>Contact</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Help Center</li>
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