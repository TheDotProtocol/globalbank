'use client';

import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Logo variant="icon" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-900">Global Dot Bank</span>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> January 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences, 
                analyzing how you use our site, and personalizing content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function properly. They enable basic 
                    functions like page navigation, secure login, and form submissions.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Authentication and security</li>
                    <li>Session management</li>
                    <li>Fraud prevention</li>
                    <li>Load balancing</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Performance Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how visitors interact with our website by collecting 
                    and reporting information anonymously.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Website analytics</li>
                    <li>Error tracking</li>
                    <li>Performance monitoring</li>
                    <li>User behavior analysis</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies enable enhanced functionality and personalization, such as remembering 
                    your preferences and settings.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Language preferences</li>
                    <li>Display settings</li>
                    <li>Form data retention</li>
                    <li>Personalized content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are used to track visitors across websites to display relevant and 
                    engaging advertisements.
                  </p>
                  <ul className="list-disc pl-6 text-gray-700">
                    <li>Advertising personalization</li>
                    <li>Social media integration</li>
                    <li>Retargeting campaigns</li>
                    <li>Conversion tracking</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                We may use third-party services that place cookies on your device:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Google Analytics:</strong> Website analytics and performance monitoring</li>
                <li><strong>Stripe:</strong> Payment processing and security</li>
                <li><strong>Cloudflare:</strong> Security and performance optimization</li>
                <li><strong>Social Media Platforms:</strong> Integration with social media features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookie Management</h2>
              <p className="text-gray-700 mb-4">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Browser Settings:</strong> Most browsers allow you to block or delete cookies</li>
                <li><strong>Cookie Consent:</strong> Use our cookie consent banner to manage preferences</li>
                <li><strong>Opt-Out Tools:</strong> Use industry opt-out mechanisms for advertising cookies</li>
                <li><strong>Device Settings:</strong> Manage cookies through your device settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Cookie Retention</h2>
              <p className="text-gray-700 mb-4">
                Different types of cookies are retained for different periods:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain until manually deleted or expired</li>
                <li><strong>Analytics Cookies:</strong> Typically retained for 2 years</li>
                <li><strong>Marketing Cookies:</strong> Usually retained for 1-2 years</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Impact of Disabling Cookies</h2>
              <p className="text-gray-700 mb-4">
                Disabling certain cookies may affect your experience:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Some website features may not work properly</li>
                <li>You may need to re-enter information repeatedly</li>
                <li>Personalized content may not be available</li>
                <li>Security features may be limited</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Mobile Applications</h2>
              <p className="text-gray-700 mb-4">
                Our mobile applications may use similar technologies to cookies, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Device identifiers</li>
                <li>Local storage</li>
                <li>Session storage</li>
                <li>Push notification tokens</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this cookie policy from time to time. We will notify you of any 
                material changes through our website or other communication channels.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about our use of cookies, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@globaldotbank.org<br />
                  <strong>Phone:</strong> +1 (555) 123-4567<br />
                  <strong>Address:</strong> 123 Banking Street, Financial District, NY 10001
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 