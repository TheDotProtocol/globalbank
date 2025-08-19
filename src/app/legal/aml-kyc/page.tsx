'use client';

import { ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';

export default function AMLKYCPolicy() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">AML/KYC Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> January 2024
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                Global Dot Bank is committed to preventing money laundering and terrorist financing. 
                Our Anti-Money Laundering (AML) and Know Your Customer (KYC) policies ensure 
                compliance with international regulations and protect our customers and the 
                financial system.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Customer Due Diligence (CDD)</h2>
              <p className="text-gray-700 mb-4">
                We conduct thorough customer due diligence for all account holders:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li><strong>Identity Verification:</strong> Government-issued ID, passport, or driver's license</li>
                <li><strong>Address Verification:</strong> Utility bills, bank statements, or lease agreements</li>
                <li><strong>Source of Funds:</strong> Employment information, business details, or investment sources</li>
                <li><strong>Risk Assessment:</strong> Evaluation based on customer profile and transaction patterns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Enhanced Due Diligence (EDD)</h2>
              <p className="text-gray-700 mb-4">
                Enhanced due diligence is required for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Politically Exposed Persons (PEPs)</li>
                <li>High-value customers with significant transaction volumes</li>
                <li>Customers from high-risk jurisdictions</li>
                <li>Complex business structures or ownership arrangements</li>
                <li>Unusual transaction patterns or activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Transaction Monitoring</h2>
              <p className="text-gray-700 mb-4">
                We monitor all transactions for suspicious activity, including:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Unusual transaction patterns or frequencies</li>
                <li>Transactions inconsistent with customer profile</li>
                <li>High-value transactions without clear purpose</li>
                <li>Transactions involving high-risk jurisdictions</li>
                <li>Structuring or smurfing attempts</li>
                <li>Transactions with sanctioned entities or individuals</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Suspicious Activity Reporting</h2>
              <p className="text-gray-700 mb-4">
                We are required to report suspicious activities to regulatory authorities. 
                This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Transactions that appear to be money laundering</li>
                <li>Activities that may involve terrorist financing</li>
                <li>Attempts to evade reporting requirements</li>
                <li>Unusual or suspicious customer behavior</li>
                <li>Transactions with no apparent lawful purpose</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Record Keeping</h2>
              <p className="text-gray-700 mb-4">
                We maintain comprehensive records for regulatory compliance:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Customer identification and verification documents</li>
                <li>Account opening and maintenance records</li>
                <li>Transaction records for at least 5 years</li>
                <li>Correspondence and communication records</li>
                <li>Risk assessments and due diligence reports</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Sanctions Compliance</h2>
              <p className="text-gray-700 mb-4">
                We screen all customers and transactions against:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>OFAC (Office of Foreign Assets Control) sanctions lists</li>
                <li>UN Security Council sanctions</li>
                <li>EU sanctions and restrictive measures</li>
                <li>Other applicable international sanctions</li>
                <li>Domestic sanctions and watchlists</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Employee Training</h2>
              <p className="text-gray-700 mb-4">
                All employees receive regular training on:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>AML/KYC regulations and requirements</li>
                <li>Recognizing suspicious activities</li>
                <li>Customer due diligence procedures</li>
                <li>Reporting obligations and procedures</li>
                <li>Sanctions compliance and screening</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Customer Responsibilities</h2>
              <p className="text-gray-700 mb-4">
                As a customer, you are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Providing accurate and complete information</li>
                <li>Updating your information when it changes</li>
                <li>Not using your account for illegal activities</li>
                <li>Cooperating with our due diligence requests</li>
                <li>Reporting any suspicious activities you encounter</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Consequences of Non-Compliance</h2>
              <p className="text-gray-700 mb-4">
                Failure to comply with AML/KYC requirements may result in:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Account restrictions or closure</li>
                <li>Transaction delays or rejections</li>
                <li>Reporting to regulatory authorities</li>
                <li>Legal action or criminal prosecution</li>
                <li>Fines or penalties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about our AML/KYC policies, please contact:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>AML Officer:</strong> aml@globaldotbank.org<br />
                  <strong>Compliance Team:</strong> compliance@globaldotbank.org<br />
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