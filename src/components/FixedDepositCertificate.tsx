'use client';

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Calendar, TrendingUp, DollarSign, Clock } from 'lucide-react';

interface FixedDepositCertificateProps {
  deposit: {
    id: string;
    amount: number;
    interestRate: number;
    duration: number;
    maturityDate: Date;
    status: string;
    certificateUrl?: string;
    maturityValue?: number;
    isRenewable: boolean;
    createdAt: Date;
  };
  onRenew?: (depositId: string) => void;
  onDownload?: (depositId: string) => void;
}

export default function FixedDepositCertificate({
  deposit,
  onRenew,
  onDownload
}: FixedDepositCertificateProps) {
  const [currentValue, setCurrentValue] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isMatured, setIsMatured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    calculateCurrentValue();
    const interval = setInterval(calculateCurrentValue, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deposit]);

  const calculateCurrentValue = () => {
    const now = new Date();
    const startDate = new Date(deposit.createdAt);
    const maturityDate = new Date(deposit.maturityDate);
    
    setIsMatured(now >= maturityDate);
    
    if (isMatured) {
      setCurrentValue(deposit.maturityValue || deposit.amount * (1 + deposit.interestRate / 100));
      setDaysRemaining(0);
    } else {
      const totalDays = Math.ceil((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const elapsedDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, totalDays - elapsedDays);
      
      setDaysRemaining(remainingDays);
      
      // Calculate current value with accrued interest
      const dailyRate = deposit.interestRate / 365 / 100;
      const currentValue = deposit.amount * (1 + dailyRate * elapsedDays);
      setCurrentValue(currentValue);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'MATURED':
        return 'text-blue-600 bg-blue-100';
      case 'WITHDRAWN':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleRenew = async () => {
    if (!onRenew) return;
    
    setLoading(true);
    try {
      await onRenew(deposit.id);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!onDownload) return;
    
    setLoading(true);
    try {
      await onDownload(deposit.id);
    } finally {
      setLoading(false);
    }
  };

  const totalInterest = currentValue - deposit.amount;
  const interestPercentage = ((totalInterest / deposit.amount) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Certificate Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Fixed Deposit Certificate</h2>
            <p className="text-blue-100">Global Dot Bank</p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(deposit.status)}`}>
              {deposit.status}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Content */}
      <div className="p-6 space-y-6">
        {/* Deposit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deposit Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Deposit ID:</span>
                  <span className="font-mono text-gray-900">{deposit.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Principal Amount:</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(deposit.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-semibold text-green-600">{deposit.interestRate}% p.a.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold text-gray-900">{deposit.duration} months</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(deposit.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maturity Date:</span>
                  <span className="font-semibold text-gray-900">{formatDate(deposit.maturityDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Days Remaining:</span>
                  <span className={`font-semibold ${daysRemaining === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                    {daysRemaining === 0 ? 'Matured' : `${daysRemaining} days`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Value and Interest */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Current Value</h4>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentValue)}</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Interest Earned</h4>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalInterest)}</p>
              <p className="text-sm text-gray-500">({interestPercentage.toFixed(2)}%)</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-600 mb-1">Maturity Value</h4>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(deposit.maturityValue || deposit.amount * (1 + deposit.interestRate / 100))}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {!isMatured && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress to Maturity</span>
              <span>{Math.round(((deposit.amount * (1 + deposit.interestRate / 100)) - currentValue) / ((deposit.amount * (1 + deposit.interestRate / 100)) - deposit.amount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, Math.max(0, ((deposit.amount * (1 + deposit.interestRate / 100)) - currentValue) / ((deposit.amount * (1 + deposit.interestRate / 100)) - deposit.amount) * 100))}%` 
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          {deposit.certificateUrl && (
            <button
              onClick={handleDownload}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Certificate</span>
            </button>
          )}
          
          {isMatured && deposit.isRenewable && (
            <button
              onClick={handleRenew}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Renew Deposit</span>
            </button>
          )}
          
          <button
            onClick={calculateCurrentValue}
            disabled={loading}
            className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Terms and Conditions */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Interest is calculated daily and compounded monthly</li>
            <li>• Early withdrawal may incur penalties</li>
            <li>• Minimum deposit amount: $100</li>
            <li>• Certificate is valid until maturity date</li>
            <li>• Automatic renewal available upon maturity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Fixed Deposit Calculator Component
export function FixedDepositCalculator() {
  const [amount, setAmount] = useState(1000);
  const [duration, setDuration] = useState(12);
  const [interestRate, setInterestRate] = useState(9.0);

  const calculateMaturityValue = () => {
    const rate = interestRate / 100;
    const time = duration / 12; // Convert months to years
    return amount * Math.pow(1 + rate, time);
  };

  const maturityValue = calculateMaturityValue();
  const totalInterest = maturityValue - amount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fixed Deposit Calculator</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Principal Amount ($)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min="100"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (Months)
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={3}>3 Months (6.5%)</option>
            <option value={6}>6 Months (7.5%)</option>
            <option value={12}>12 Months (9.0%)</option>
            <option value={24}>24 Months (10.0%)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate (% p.a.)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Results */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-3">
          <h4 className="font-semibold text-blue-900">Projected Returns</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-blue-700">Principal:</span>
              <p className="font-semibold text-blue-900">{formatCurrency(amount)}</p>
            </div>
            <div>
              <span className="text-sm text-blue-700">Interest Earned:</span>
              <p className="font-semibold text-green-600">{formatCurrency(totalInterest)}</p>
            </div>
            <div>
              <span className="text-sm text-blue-700">Maturity Value:</span>
              <p className="font-semibold text-blue-900">{formatCurrency(maturityValue)}</p>
            </div>
            <div>
              <span className="text-sm text-blue-700">Effective Rate:</span>
              <p className="font-semibold text-blue-900">{((totalInterest / amount) * 100).toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 