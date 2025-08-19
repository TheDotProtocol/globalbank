"use client";
import { useState, useEffect } from "react";
import { Sun, Moon, ArrowRight, ShieldCheck, CheckCircle, Award, Globe, Users, Zap, Star, Building, Target, Calendar, TrendingUp, Heart, Leaf, BookOpen, GraduationCap, Newspaper, ArrowUpRight, CheckSquare, Star as StarIcon, Award as AwardIcon, Zap as ZapIcon, MapPin, Phone, Mail, Globe2, BarChart3, Clock3 } from "lucide-react";
import Image from "next/image";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation, getCurrentLocale } from "@/lib/i18n";
import { NoTranslate, Translate } from "@/components/TranslationWrapper";
import TranslationPrompt from "@/components/TranslationPrompt";

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
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

  const values = [
    {
      title: "Innovation",
      description: "Continuously developing new banking solutions",
      icon: Zap,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Integrity",
      description: "Full compliance with regulatory standards",
      icon: ShieldCheck,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Customer-Centricity",
      description: "Putting customers first in all operations",
      icon: Heart,
      color: "from-red-500 to-red-600"
    },
    {
      title: "Sustainability",
      description: "Promoting eco-friendly finance and green banking practices",
      icon: Leaf,
      color: "from-emerald-500 to-emerald-600"
    }
  ];

  const milestones = [
    {
      year: "2024",
      title: "Founding of Dot Protocol Blockchain",
      description: "Foundation for banking innovation established",
      icon: BookOpen
    },
    {
      year: "2025",
      title: "Establishment of Global Dot Bank",
      description: "Digital-first financial platform launched",
      icon: Building
    },
    {
      year: "2025",
      title: "Banking Licenses Applied & Approved",
      description: "Licenses applied for Thailand, USA, India, and Singapore. Approved by the Bank of Thailand",
      icon: Award
    }
  ];

  const sustainablePractices = [
    "Supporting green and eco-friendly projects",
    "Reducing carbon footprint via digital-first banking",
    "Promoting responsible lending and investment",
    "Implementing paperless banking operations",
    "Supporting renewable energy initiatives"
  ];

  const newsEvents = [
    "Announcements, partnerships, and product launches",
    "Updates on licensing approvals and regulatory milestones",
    "Scheduled bank holidays",
    "Technology updates and security enhancements",
    "Community engagement and educational initiatives"
  ];

  const careerOpportunities = [
    "Technology and software development",
    "Operations and customer service",
    "Finance and risk management",
    "Marketing and business development",
    "Legal and compliance"
  ];

  const scholarshipPrograms = [
    "Fintech innovation scholarships",
    "Blockchain technology education",
    "Digital banking certification programs",
    "AI and machine learning in finance",
    "Sustainable finance initiatives"
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
                <button onClick={() => window.location.href = "/"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Home</button>
                <button className="text-blue-600 dark:text-blue-400 font-medium">About Us</button>
                <button className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Support</button>
                <button onClick={() => window.location.href = "/login"} className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">Login</button>
                <button onClick={() => window.location.href = "/register"} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium">Open Account</button>
                <LanguageSwitcher />
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                  About <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Global Dot Bank</span>
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                  A next-generation digital financial institution committed to combining banking reliability with cutting-edge innovation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="px-6 py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Mission */}
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Global Dot Bank is a next-generation digital financial institution committed to combining <strong>banking reliability</strong> with <strong>cutting-edge innovation</strong>. We leverage AI, blockchain, and modern banking technology to provide seamless, secure, and intelligent financial services worldwide.
                </p>
              </div>

              {/* Vision */}
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Vision</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  To become a <strong>trusted global digital bank</strong> that empowers individuals and businesses to manage their finances smarter, faster, and more securely.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="px-6 py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Our Values</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                The core principles that guide everything we do at Global Dot Bank
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={value.title} className={`text-center p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200/50 dark:border-gray-700/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 100}ms` }}>
                  <div className={`h-16 w-16 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bank History */}
        <section className="px-6 py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Bank History</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our journey from blockchain innovation to global banking leadership
              </p>
            </div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-start space-x-6 p-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 dark:border-gray-700/50 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} 
                     style={{ transitionDelay: `${index * 200}ms` }}>
                  <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <milestone.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{milestone.year}</span>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{milestone.title}</h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sustainable Development */}
        <section className="px-6 py-16 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Sustainable Development</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Global Dot Bank is committed to sustainable banking practices and environmental responsibility.
                </p>
                <ul className="space-y-3">
                  {sustainablePractices.map((practice, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Environmental Impact</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Carbon Footprint Reduction</span>
                      <span className="text-green-600 font-semibold">85%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Paperless Operations</span>
                      <span className="text-green-600 font-semibold">100%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Green Project Support</span>
                      <span className="text-green-600 font-semibold">$2M+</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* News & Events */}
        <section className="px-6 py-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">News & Events</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay up-to-date with Global Dot Bank's latest developments and announcements
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <Newspaper className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Latest Updates</h3>
                <ul className="space-y-3">
                  {newsEvents.map((event, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <ArrowUpRight className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{event}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white">
                  <h3 className="text-xl font-semibold mb-4">Subscribe to Updates</h3>
                  <p className="mb-6 text-blue-100">
                    Get notified about our latest news, product launches, and important announcements.
                  </p>
                  <div className="flex space-x-4">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    />
                    <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Careers & Scholarships */}
        <section className="px-6 py-16 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Careers & Scholarships</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                We are building a team of forward-thinking innovators. Join us in shaping the future of banking.
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Careers */}
              <div className={`transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Career Opportunities</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Join our dynamic team and help us revolutionize the banking industry.
                </p>
                <ul className="space-y-3 mb-6">
                  {careerOpportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{opportunity}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  View Open Positions
                </button>
              </div>

              {/* Scholarships */}
              <div className={`transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
                <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Scholarship Programs</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Supporting the next generation of fintech innovators and leaders.
                </p>
                <ul className="space-y-3 mb-6">
                  {scholarshipPrograms.map((program, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{program}</span>
                    </li>
                  ))}
                </ul>
                <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
                  Apply for Scholarships
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Join the Future of Banking?</h2>
            <p className="text-lg text-blue-100 mb-8">
              Experience the next generation of digital banking with Global Dot Bank. Secure, innovative, and designed for the modern world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.href = "/register"} className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl">
                Open Account Now
              </button>
              <button onClick={() => window.location.href = "/"} className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-300 border-2 border-white">
                Learn More
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
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company</h3>
                <ul className="space-y-2">
                  <li><a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">News</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Support</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Terms of Service</a></li>
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