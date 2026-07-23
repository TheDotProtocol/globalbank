'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Search,
  Download,
  Calendar,
} from 'lucide-react';
import DashboardPageShell from '@/components/layout/DashboardPageShell';
import TransactionDetailModal, {
  TransactionDetail,
  InternationalTransferDetail,
} from '@/components/modals/TransactionDetailModal';
import StatementExportButtons from '@/components/StatementExportButtons';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
  reference?: string | null;
  account: {
    accountNumber: string;
    accountType: string;
  };
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('365');
  const [selectedTx, setSelectedTx] = useState<TransactionDetail | null>(null);
  const [intlTransfer, setIntlTransfer] = useState<InternationalTransferDetail | null>(null);
  const [relatedTransfer, setRelatedTransfer] = useState<{ id: string; type: string; amount: number; account: { accountNumber: string } } | null>(null);
  const [primaryIntlTx, setPrimaryIntlTx] = useState<import('@/components/modals/TransactionDetailModal').PrimaryIntlTransaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = new URLSearchParams({
        limit: '200',
        days: dateRange,
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });

      const response = await fetch(`/api/transactions?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange, filterType, filterStatus]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleTransactionClick = async (tx: Transaction) => {
    setDetailLoading(true);
    setSelectedTx({
      ...tx,
      reference: tx.reference || null,
      account: { ...tx.account, currency: 'USD' },
    });
    setIntlTransfer(null);
    setRelatedTransfer(null);
    setPrimaryIntlTx(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/transactions/${tx.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedTx(data.transaction);
        setIntlTransfer(data.internationalTransfer);
        setRelatedTransfer(data.relatedTransfer);
        setPrimaryIntlTx(data.primaryIntlTransaction);
      }
    } catch (error) {
      console.error('Error fetching transaction detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.description.toLowerCase().includes(term) ||
      tx.account.accountNumber.includes(term) ||
      tx.type.toLowerCase().includes(term) ||
      (tx.reference && tx.reference.toLowerCase().includes(term))
    );
  });

  const isCreditType = (type: string, description: string) =>
    ['CREDIT', 'DEPOSIT'].includes(type) || description.toLowerCase().includes('interest');

  const getTransactionIcon = (type: string, description: string) => {
    return isCreditType(type, description) ? (
      <ArrowDownLeft className="h-5 w-5 dashboard-tx-icon-credit" />
    ) : (
      <ArrowUpRight className="h-5 w-5 dashboard-tx-icon-debit" />
    );
  };

  const getAmountClass = (type: string, description: string) => {
    return isCreditType(type, description) ? 'dashboard-tx-amount-credit' : 'dashboard-tx-amount-debit';
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'dashboard-badge dashboard-badge-success';
      case 'PENDING':
        return 'dashboard-badge dashboard-badge-warning';
      case 'FAILED':
        return 'dashboard-badge dashboard-badge-danger';
      default:
        return 'dashboard-badge';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Description', 'Amount', 'Status', 'Account', 'Reference'].join(','),
      ...filteredTransactions.map((tx) =>
        [
          formatDate(tx.createdAt),
          tx.type,
          `"${tx.description}"`,
          tx.amount,
          tx.status,
          tx.account.accountNumber,
          tx.reference || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statementDays = parseInt(dateRange, 10) || 365;

  return (
    <DashboardPageShell
      activeTab="transactions"
      title="Transactions"
      subtitle="View and manage your transaction history"
      headerExtra={
        <div className="flex flex-wrap gap-2 items-center">
          <StatementExportButtons days={statementDays} />
          <button onClick={handleExport} className="btn-secondary dashboard-header-btn">
            <Download className="h-4 w-4" />
            Quick CSV
          </button>
        </div>
      }
    >
      <div className="dashboard-card dashboard-card-spaced">
        <div className="dashboard-filters">
          <div className="dashboard-search-wrap">
            <Search className="dashboard-search-icon" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dashboard-input dashboard-search-input"
            />
          </div>
          <div className="dashboard-filter-group">
            <Filter className="h-4 w-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="dashboard-input dashboard-filter-select"
            >
              <option value="all">All Types</option>
              <option value="CREDIT">Credits</option>
              <option value="DEBIT">Debits</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="TRANSFER">Transfers</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="INTEREST">Interest</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="dashboard-input dashboard-filter-select"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="dashboard-input dashboard-filter-select"
            >
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 6 months</option>
              <option value="365">Last year</option>
              <option value="730">All history</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-card">
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading transactions...</p>
          </div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="dashboard-card dashboard-empty-state">
          <div className="dashboard-empty-icon">
            <Calendar className="h-8 w-8" />
          </div>
          <h3 className="dashboard-empty-title">No Transactions Found</h3>
          <p className="dashboard-empty-text">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters or search term.'
              : 'Your transaction history will appear here.'}
          </p>
        </div>
      ) : (
        <div className="dashboard-card">
          <div className="dashboard-list">
            {filteredTransactions.map((tx) => (
              <div
                key={tx.id}
                className="dashboard-list-item dashboard-list-item-clickable"
                onClick={() => handleTransactionClick(tx)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleTransactionClick(tx)}
              >
                <div className="dashboard-list-item-icon">
                  {getTransactionIcon(tx.type, tx.description)}
                </div>
                <div className="dashboard-list-item-content">
                  <div className="dashboard-list-item-main">
                    <span className="dashboard-list-item-title">{tx.description}</span>
                    <span className={`dashboard-list-item-amount ${getAmountClass(tx.type, tx.description)}`}>
                      {isCreditType(tx.type, tx.description) ? '+' : '-'}$
                      {Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="dashboard-list-item-meta">
                    <span>{tx.type}</span>
                    <span>•</span>
                    <span>{tx.account.accountNumber}</span>
                    <span>•</span>
                    <span>{formatDate(tx.createdAt)}</span>
                    <span className={getStatusClass(tx.status)}>{tx.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(selectedTx || detailLoading) && (
        <TransactionDetailModal
          transaction={selectedTx}
          internationalTransfer={intlTransfer}
          primaryIntlTransaction={primaryIntlTx}
          relatedTransfer={relatedTransfer}
          loading={detailLoading}
          onClose={() => { setSelectedTx(null); setIntlTransfer(null); setRelatedTransfer(null); setPrimaryIntlTx(null); }}
        />
      )}
    </DashboardPageShell>
  );
}
