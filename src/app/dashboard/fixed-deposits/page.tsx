'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';

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
  const [fixedDeposits, setFixedDeposits] = useState<FixedDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFixedDeposits(data.fixedDeposits || []);
      }
    } catch (error) {
      console.error('Error fetching fixed deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
  };

  const handleCertificateGeneration = async (depositId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToastMessage('Please log in to generate certificates', 'error');
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/fixed-deposits/${depositId}/certificate`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const certificateData = await response.json();
        const { exportFixedDepositCertificate } = await import('@/lib/export-new');
        await exportFixedDepositCertificate(certificateData.certificate, 'pdf');
        showToastMessage('Fixed Deposit Certificate generated successfully', 'success');
      } else {
        const errorText = await response.text();
        let errorMessage = 'Error generating certificate';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${errorText}`;
        }
        showToastMessage(errorMessage, 'error');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      showToastMessage('Error generating certificate', 'error');
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'dashboard-badge dashboard-badge-success';
      case 'MATURED':
        return 'dashboard-badge dashboard-badge-info';
      case 'BROKEN':
        return 'dashboard-badge dashboard-badge-danger';
      default:
        return 'dashboard-badge dashboard-badge-default';
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

  return (
    <DashboardPageShell
      activeTab="fixed-deposits"
      title="Fixed Deposits"
      subtitle="Manage your fixed deposit investments and generate certificates"
      headerExtra={
        <button
          onClick={() => router.push('/dashboard')}
          className="btn-primary dashboard-header-btn"
        >
          <Plus className="h-4 w-4" />
          Create New FD
        </button>
      }
    >
      {loading ? (
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading fixed deposits...</p>
          </div>
        </div>
      ) : fixedDeposits.length === 0 ? (
        <div className="dashboard-card dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <TrendingUp className="h-8 w-8" />
          </div>
          <h3 className="dashboard-empty-title">No Fixed Deposits Yet</h3>
          <p className="dashboard-empty-text">
            Start earning higher interest rates with our fixed deposit accounts
          </p>
          <button onClick={() => router.push('/dashboard')} className="btn-primary">
            <Plus className="h-4 w-4" />
            Create Your First Fixed Deposit
          </button>
        </div>
      ) : (
        <div className="dashboard-card-grid">
          {fixedDeposits.map((deposit) => (
            <div key={deposit.id} className="dashboard-card dashboard-card-item">
              <div className="dashboard-card-item-header">
                <div className="dashboard-card-item-icon">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="dashboard-card-item-meta">
                  <h3 className="dashboard-card-item-title">
                    FD #{deposit.id.slice(-8)}
                  </h3>
                  <span className={getStatusClass(deposit.status)}>
                    {getStatusIcon(deposit.status)}
                    <span>{deposit.status}</span>
                  </span>
                </div>
              </div>

              <div className="dashboard-fd-amount">{formatCurrency(deposit.amount)}</div>
              <p className="dashboard-detail-label">Principal Amount</p>

              <div className="dashboard-card-limits">
                <div>
                  <span className="dashboard-detail-label">Interest Rate</span>
                  <span className="dashboard-detail-value dashboard-fd-rate">
                    {parseFloat(deposit.interestRate).toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="dashboard-detail-label">Duration</span>
                  <span className="dashboard-detail-value">
                    {deposit.duration} {deposit.duration > 12 ? 'Years' : 'Months'}
                  </span>
                </div>
              </div>

              <div className="dashboard-fd-dates">
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Start Date</span>
                  <span className="dashboard-detail-value">{formatDate(deposit.createdAt)}</span>
                </div>
                <div className="dashboard-fd-date-row">
                  <span className="dashboard-detail-label">Maturity Date</span>
                  <span
                    className={`dashboard-detail-value ${
                      isMatured(deposit.maturityDate) ? 'dashboard-fd-matured' : ''
                    }`}
                  >
                    {formatDate(deposit.maturityDate)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleCertificateGeneration(deposit.id)}
                className="btn-primary dashboard-fd-cert-btn"
              >
                <Download className="h-4 w-4" />
                Generate Certificate
              </button>
            </div>
          ))}
        </div>
      )}

      {showToast && (
        <div
          className={`dashboard-toast ${
            toastType === 'success' ? 'dashboard-toast-success' : 'dashboard-toast-error'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </DashboardPageShell>
  );
}
