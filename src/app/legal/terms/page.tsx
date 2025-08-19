'use client';

import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function TermsOfUse() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Use</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> January 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using Global Dot Bank's digital banking services, you agree to be bound by these Terms of Use. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                Global Dot Bank provides digital banking services including but not limited to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Online account management</li>
                <li>Digital payments and transfers</li>
                <li>Virtual card services</li>
                <li>Investment and savings products</li>
                <li>Mobile banking applications</li>
                <li>Customer support services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Account Registration</h2>
              <p className="text-gray-700 mb-4">
                To use our services, you must:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Security and Privacy</h2>
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your information. 
                You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Keeping your login credentials secure</li>
                <li>Not sharing your account information with others</li>
                <li>Logging out of your account when using shared devices</li>
                <li>Reporting suspicious activity immediately</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Acceptable Use</h2>
              <p className="text-gray-700 mb-4">
                You agree not to use our services for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Illegal activities or transactions</li>
                <li>Money laundering or terrorist financing</li>
                <li>Fraudulent or deceptive practices</li>
                <li>Violation of any applicable laws or regulations</li>
                <li>Attempting to gain unauthorized access to our systems</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Fees and Charges</h2>
              <p className="text-gray-700 mb-4">
                We may charge fees for certain services. All fees will be clearly disclosed 
                before you incur them. You authorize us to deduct fees from your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                Global Dot Bank's liability is limited to the extent permitted by law. 
                We are not liable for indirect, incidental, or consequential damages.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account at any time for violation of these terms. 
                You may close your account at any time by contacting customer support.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We may update these terms from time to time. We will notify you of any material changes 
                through email or in-app notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these terms, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@globaldotbank.org<br />
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