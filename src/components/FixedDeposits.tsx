'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Clock, DollarSign, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

interface FixedDeposit {
  id: string;
  amount: number;
  interestRate: number;
  duration: number;
  maturityDate: string;
  status: string;
  createdAt: string;
  currentValue: number;
  interestEarned: number;
  isMatured: boolean;
  daysRemaining: number;
  canWithdraw: boolean;
}

interface InterestRates {
  savings: {
    BASIC: { minBalance: number; maxBalance: number; rate: number };
    STANDARD: { minBalance: number; maxBalance: number; rate: number };
    PREMIUM: { minBalance: number; maxBalance: null; rate: number };
  };
  fixedDeposits: {
    3: { rate: number; minAmount: number; name: string };
    6: { rate: number; minAmount: number; name: string };
    12: { rate: number; minAmount: number; name: string };
    24: { rate: number; minAmount: number; name: string };
  };
}

export default function FixedDeposits() {
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [interestRates, setInterestRates] = useState<InterestRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ amount: '', duration: 12 });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchFixedDeposits();
    fetchInterestRates();
  }, []);

  const fetchFixedDeposits = async () => {
    try {
      const response = await fetch('/api/fixed-deposits');
      if (response.ok) {
        const data = await response.json();
        setFixedDeposits(data.fixedDeposits);
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
    }
  };

  const fetchInterestRates = async () => {
    try {
      const response = await fetch('/api/interest-rates');
      if (response.ok) {
        const data = await response.json();
        setInterestRates(data.availableRates);
      }
    } catch (error) {
      console.error('Error fetching interest rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch('/api/fixed-deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Fixed deposit created successfully!');
        setShowCreateForm(false);
        setFormData({ amount: '', duration: 12 });
        fetchFixedDeposits();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create fixed deposit');
      }
    } catch (error) {
      console.error('Error creating fixed deposit:', error);
      alert('Failed to create fixed deposit');
    } finally {
      setCreating(false);
    }
  };

  const handleWithdraw = async (depositId: string) => {
    if (!confirm('Are you sure you want to withdraw this matured fixed deposit?')) return;

    try {
      const response = await fetch(`/api/fixed-deposits/${depositId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'withdraw' })
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Withdrawn successfully! Total amount: $${data.withdrawal.totalAmount}`);
        fetchFixedDeposits();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to withdraw');
      }
    } catch (error) {
      console.error('Error withdrawing fixed deposit:', error);
      alert('Failed to withdraw');
    }
  };

  const getStatusColor = (status: string, isMatured: boolean) => {
    if (status === 'WITHDRAWN') return 'text-gray-500';
    if (isMatured) return 'text-green-600';
    return 'text-blue-600';
  };

  const getStatusIcon = (status: string, isMatured: boolean) => {
    if (status === 'WITHDRAWN') return <CheckCircle className="h-4 w-4" />;
    if (isMatured) return <CheckCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Fixed Deposits</h2>
              <p className="text-sm text-gray-500">Grow your money with competitive interest rates</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Deposit</span>
          </button>
        </div>

        {/* Interest Rates Overview */}
        {interestRates && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(interestRates.fixedDeposits).map(([duration, rate]) => (
              <div key={duration} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-lg font-semibold text-gray-900">{rate.name}</div>
                <div className="text-2xl font-bold text-green-600">{rate.rate}%</div>
                <div className="text-sm text-gray-500">Min: ${rate.minAmount}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create New Deposit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Fixed Deposit</h3>
          <form onSubmit={handleCreateDeposit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                min="100"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter amount (minimum $100)"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={3}>3 Months (6.5% p.a.)</option>
                <option value={6}>6 Months (7.5% p.a.)</option>
                <option value={12}>12 Months (9.0% p.a.)</option>
                <option value={24}>24 Months (10.0% p.a.)</option>
              </select>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={creating}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Deposit'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Current Fixed Deposits */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Fixed Deposits</h3>
        {fixedDeposits.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No fixed deposits yet</p>
            <p className="text-sm text-gray-400">Create your first fixed deposit to start earning higher interest</p>
          </div>
        ) : (
          <div className="space-y-4">
            {fixedDeposits.map((deposit) => (
              <div key={deposit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      deposit.status === 'WITHDRAWN' ? 'bg-gray-100' : 
                      deposit.isMatured ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {getStatusIcon(deposit.status, deposit.isMatured)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          ${deposit.amount.toLocaleString()}
                        </span>
                        <span className={`text-sm ${getStatusColor(deposit.status, deposit.isMatured)}`}>
                          {deposit.status === 'WITHDRAWN' ? 'Withdrawn' :
                           deposit.isMatured ? 'Matured' : 'Active'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {deposit.duration} months at {deposit.interestRate}% p.a.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      ${deposit.currentValue.toLocaleString()}
                    </div>
                    <div className="text-sm text-green-600">
                      +${deposit.interestEarned.toFixed(2)} interest
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Matures: {new Date(deposit.maturityDate).toLocaleDateString()}</span>
                    </div>
                    {!deposit.isMatured && deposit.status === 'ACTIVE' && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{deposit.daysRemaining} days remaining</span>
                      </div>
                    )}
                  </div>
                  
                  {deposit.canWithdraw && (
                    <button
                      onClick={() => handleWithdraw(deposit.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 