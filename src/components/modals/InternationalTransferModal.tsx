'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Globe, Building, User, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface InternationalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onSuccess: () => void;
}

interface BeneficiaryDetails {
  name: string;
  address: string;
  city: string;
  country: string;
  bankName: string;
  bankAddress: string;
  swiftCode: string;
  accountNumber: string;
  routingNumber?: string;
}

export default function InternationalTransferModal({ 
  isOpen, 
  onClose, 
  accounts, 
  onSuccess 
}: InternationalTransferModalProps) {
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    amount: '',
    currency: 'USD',
    description: '',
    beneficiaryName: '',
    beneficiaryAddress: '',
    beneficiaryCity: '',
    beneficiaryCountry: '',
    bankName: '',
    bankAddress: '',
    swiftCode: '',
    accountNumber: '',
    routingNumber: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sourceAccountId || !formData.amount || !formData.beneficiaryName || 
        !formData.bankName || !formData.swiftCode || !formData.accountNumber) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    // Find source account to check balance
    const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);
    if (sourceAccount && sourceAccount.balance < amount) {
      showToast('Insufficient balance', 'error');
      return;
    }

    // Simulate exchange rate (in real implementation, this would come from an API)
    const simulatedRate = formData.currency === 'USD' ? 1 : 0.85; // Simulate EUR rate
    setExchangeRate(simulatedRate);

    // Calculate fees (2% for international transfers)
    const transferFee = amount * 0.02;
    const totalAmount = amount + transferFee;

    // Show transfer details for confirmation
    setTransferDetails({
      sourceAccount,
      amount,
      currency: formData.currency,
      description: formData.description,
      transferFee,
      totalAmount,
      exchangeRate: simulatedRate,
      beneficiary: {
        name: formData.beneficiaryName,
        address: formData.beneficiaryAddress,
        city: formData.beneficiaryCity,
        country: formData.beneficiaryCountry,
        bankName: formData.bankName,
        bankAddress: formData.bankAddress,
        swiftCode: formData.swiftCode,
        accountNumber: formData.accountNumber,
        routingNumber: formData.routingNumber
      }
    });
    setStep(2);
  };

  const confirmTransfer = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      const response = await fetch('/api/transfers/international', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sourceAccountId: formData.sourceAccountId,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          beneficiary: {
            name: formData.beneficiaryName,
            address: formData.beneficiaryAddress,
            city: formData.beneficiaryCity,
            country: formData.beneficiaryCountry,
            bankName: formData.bankName,
            bankAddress: formData.bankAddress,
            swiftCode: formData.swiftCode,
            accountNumber: formData.accountNumber,
            routingNumber: formData.routingNumber
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        showToast('International transfer initiated successfully', 'success');
        onSuccess();
        handleClose();
      } else {
        showToast(data.error || 'Transfer failed', 'error');
      }
    } catch (error) {
      console.error('International transfer error:', error);
      showToast('Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sourceAccountId: '',
      amount: '',
      currency: 'USD',
      description: '',
      beneficiaryName: '',
      beneficiaryAddress: '',
      beneficiaryCity: '',
      beneficiaryCountry: '',
      bankName: '',
      bankAddress: '',
      swiftCode: '',
      accountNumber: '',
      routingNumber: ''
    });
    setStep(1);
    setTransferDetails(null);
    setLoading(false);
    onClose();
  };

  const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Globe className="w-5 h-5 mr-2 text-blue-600" />
            {step === 1 ? 'International Transfer' : 'Confirm International Transfer'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Source Account */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Source Account
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Account *
                </label>
                <select
                  name="sourceAccountId"
                  value={formData.sourceAccountId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.accountNumber} - ${account.balance.toLocaleString()} ({account.currency})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transfer Details */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                Transfer Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {sourceAccount && formData.amount && (
                    <p className="text-sm text-gray-500 mt-1">
                      Available: ${sourceAccount.balance.toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency *
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Purpose of transfer"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Beneficiary Details */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2" />
                Beneficiary Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beneficiary Name *
                  </label>
                  <input
                    type="text"
                    name="beneficiaryName"
                    value={formData.beneficiaryName}
                    onChange={handleInputChange}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="beneficiaryCountry"
                    value={formData.beneficiaryCountry}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="beneficiaryAddress"
                    value={formData.beneficiaryAddress}
                    onChange={handleInputChange}
                    placeholder="Street address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="beneficiaryCity"
                    value={formData.beneficiaryCity}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                <Building className="w-4 h-4 mr-2" />
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Bank name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SWIFT Code *
                  </label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    placeholder="SWIFT/BIC code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Beneficiary account number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    name="routingNumber"
                    value={formData.routingNumber}
                    onChange={handleInputChange}
                    placeholder="Bank routing number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Address
                  </label>
                  <input
                    type="text"
                    name="bankAddress"
                    value={formData.bankAddress}
                    onChange={handleInputChange}
                    placeholder="Bank address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">International Transfer Details</h3>
              
              <div className="space-y-4">
                {/* Source Account */}
                <div className="border-b pb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">From Account</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account:</span>
                    <span className="text-sm font-medium">
                      {transferDetails?.sourceAccount?.accountNumber}
                    </span>
                  </div>
                </div>
                
                {/* Transfer Amount */}
                <div className="border-b pb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Transfer Amount</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${transferDetails?.amount?.toLocaleString()} {transferDetails?.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Exchange Rate:</span>
                      <span className="text-sm text-gray-900">
                        1 USD = {transferDetails?.exchangeRate} {transferDetails?.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">International Fee (2%):</span>
                      <span className="text-sm text-red-600">
                        ${transferDetails?.transferFee?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <span className="text-sm font-medium text-gray-900">Total Amount:</span>
                      <span className="text-lg font-bold text-blue-600">
                        ${transferDetails?.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beneficiary Details */}
                <div className="border-b pb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Beneficiary</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium">
                        {transferDetails?.beneficiary?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Country:</span>
                      <span className="text-sm font-medium">
                        {transferDetails?.beneficiary?.country}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="border-b pb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Bank Details</h4>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Bank:</span>
                      <span className="text-sm font-medium">
                        {transferDetails?.beneficiary?.bankName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">SWIFT:</span>
                      <span className="text-sm font-medium">
                        {transferDetails?.beneficiary?.swiftCode}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Account:</span>
                      <span className="text-sm font-medium">
                        {transferDetails?.beneficiary?.accountNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {transferDetails?.description && (
                  <div>
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="text-sm text-gray-900 mt-1">
                      {transferDetails?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">International Transfer Notice</p>
                  <p className="mt-1">This is a simulated international transfer. In production, this would be processed through SWIFT network with real banking partners.</p>
                  <p className="mt-1">Processing time: 1-3 business days.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm International Transfer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
