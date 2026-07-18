'use client';

import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function CookiePolicy() {
  return (
    <LegalPageLayout title="Cookie Policy" subtitle="How Global Dot Bank uses cookies and similar technologies">
      <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Cookie Policy</h1>
          
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
    </LegalPageLayout>
  );
} 