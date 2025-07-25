'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Info, Calculator } from 'lucide-react';
import { InterestCalculator, InterestRate } from '@/lib/interest-calculator';

interface InterestRatesDisplayProps {
  className?: string;
  userBalance?: number;
}

export default function InterestRatesDisplay({ className = '', userBalance = 0 }: InterestRatesDisplayProps) {
  const [rates, setRates] = useState<InterestRate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('/api/admin/calculate-interest');
        if (response.ok) {
          const data = await response.json();
          setRates(data.interestRates || []);
        } else {
          // Fallback to local rates
          setRates(InterestCalculator.getAllInterestRates());
        }
      } catch (error) {
        console.error('Failed to fetch interest rates:', error);
        // Fallback to local rates
        setRates(InterestCalculator.getAllInterestRates());
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/90 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Interest Rates</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">Earn money on your deposits</p>
        </div>
      </div>

      <div className="space-y-4">
        {rates.map((rate) => {
          const projectedMonthly = InterestCalculator.calculateProjectedInterest(userBalance, rate.accountType, 1);
          const projectedYearly = InterestCalculator.calculateProjectedInterest(userBalance, rate.accountType, 12);
          
          return (
            <div key={rate.accountType} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {rate.accountType.charAt(0) + rate.accountType.slice(1).toLowerCase()} Account
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {rate.annualRate}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Annual Rate</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-300">Min. Balance</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${rate.minimumBalance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-300">Monthly Rate</div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(rate.monthlyRate).toFixed(3)}%
                  </div>
                </div>
              </div>

              {userBalance >= rate.minimumBalance && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Your Projected Earnings
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-700 dark:text-blue-300">Monthly</div>
                      <div className="font-bold text-blue-900 dark:text-blue-100">
                        ${projectedMonthly.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-700 dark:text-blue-300">Yearly</div>
                      <div className="font-bold text-blue-900 dark:text-blue-100">
                        ${projectedYearly.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {userBalance < rate.minimumBalance && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Need ${(rate.minimumBalance - userBalance).toFixed(2)} more to earn interest
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Interest Payment Schedule
          </span>
        </div>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Interest is automatically calculated and paid on the last working day of each month. 
          No action required from you!
        </p>
      </div>
    </div>
  );
} 