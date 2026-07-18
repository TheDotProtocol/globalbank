'use client';

import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function TermsOfUse() {
  return (
    <LegalPageLayout title="Terms of Use" subtitle="Legal terms governing use of Global Dot Bank services">
      <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Terms of Use</h1>
          
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
    </LegalPageLayout>
  );
} 