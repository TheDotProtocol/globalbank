"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Download, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FixedDeposit {
  id: string;
  amount: string;
  interestRate: string;
  duration: number;
  status: string;
  createdAt: string;
  maturityDate: string;
  accountId: string;
}

export default function FixedDepositsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchFixedDeposits();
  }, []);

  const fetchFixedDeposits = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/fixed-deposits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFixedDeposits(data.fixedDeposits || []);
      } else {
        console.error('Failed to fetch fixed deposits');
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateGeneration = async (depositId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please log in to generate certificates', 'error');
        router.push('/login');
        return;
      }

      console.log('🔍 Generating certificate for deposit:', depositId);
      
      const response = await fetch(`/api/fixed-deposits/${depositId}/certificate`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const certificateData = await response.json();
        console.log('✅ Certificate data received:', certificateData);
        
        // Import the export function dynamically
        const { exportFixedDepositCertificate } = await import('@/lib/export-new');
        await exportFixedDepositCertificate(certificateData.certificate, 'pdf');
        
        showToastMessage('Fixed Deposit Certificate generated successfully', 'success');
      } else {
        const errorText = await response.text();
        console.error('❌ Certificate generation error:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        
        let errorMessage = 'Error generating certificate';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        }
        showToastMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('❌ Error generating certificate:', error);
      showToastMessage('Error generating certificate', 'error');
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'MATURED':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'BROKEN':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Clock className="h-4 w-4" />;
      case 'MATURED':
        return <CheckCircle className="h-4 w-4" />;
      case 'BROKEN':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isMatured = (maturityDate: string) => {
    return new Date() >= new Date(maturityDate);
  };

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="lg:ml-64 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="fixed-deposits" />
        <div className="lg:ml-64 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab="fixed-deposits" />
      
      <div className="lg:ml-64 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fixed Deposits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your fixed deposit investments and generate certificates
          </p>
        </div>

        {/* Create New FD Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create New Fixed Deposit
          </button>
        </div>

        {/* Fixed Deposits Grid */}
        {fixedDeposits.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Fixed Deposits Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start earning higher interest rates with our fixed deposit accounts
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Fixed Deposit
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fixedDeposits.map((deposit) => (
              <div
                key={deposit.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      FD #{deposit.id.slice(-8)}
                    </span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                    {getStatusIcon(deposit.status)}
                    <span className="ml-1">{deposit.status}</span>
                  </span>
                </div>

                {/* Amount */}
                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(deposit.amount)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Principal Amount
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span>Interest Rate</span>
                    </div>
                    <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {parseFloat(deposit.interestRate).toFixed(2)}%
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>Duration</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {deposit.duration} {deposit.duration > 12 ? 'Years' : 'Months'}
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(deposit.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Maturity Date:</span>
                    <span className={`font-medium ${isMatured(deposit.maturityDate) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(deposit.maturityDate)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCertificateGeneration(deposit.id)}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Certificate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          toastType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toastMessage}
        </div>
      )}
    </div>
  );
} 