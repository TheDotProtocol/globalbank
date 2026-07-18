'use client';

import { X, ArrowUpRight, ArrowDownLeft, Hash, User, Globe } from 'lucide-react';
import PDFReceiptGenerator from '@/components/PDFReceiptGenerator';

export interface TransactionDetail {
  id: string;
  type: string;
  amount: number;
  description: string;
  reference: string | null;
  utr?: string | null;
  status: string;
  createdAt: string;
  transferMode?: string | null;
  sourceAccountNumber?: string | null;
  destinationAccountNumber?: string | null;
  sourceAccountHolder?: string | null;
  destinationAccountHolder?: string | null;
  transferFee?: number | null;
  netAmount?: number | null;
  isDisputed?: boolean;
  disputeStatus?: string | null;
  account: {
    accountNumber: string;
    accountType: string;
    currency: string;
  };
}

export interface InternationalTransferDetail {
  beneficiaryName: string;
  beneficiaryAddress?: string | null;
  beneficiaryCity?: string | null;
  beneficiaryCountry: string;
  bankName: string;
  bankAddress?: string | null;
  swiftCode: string;
  accountNumber: string;
  routingNumber?: string | null;
  amount: number;
  currency: string;
  targetCurrency?: string;
  utr?: string | null;
  exchangeRate: number;
  convertedAmount: number;
  transferFee: number;
  totalAmount: number;
  status: string;
  estimatedDelivery: string;
  completedAt?: string | null;
  reference: string;
}

export interface PrimaryIntlTransaction {
  sourceAccountNumber?: string | null;
  sourceAccountHolder?: string | null;
  destinationAccountNumber?: string | null;
  destinationAccountHolder?: string | null;
  description?: string;
  createdAt: string;
  account: {
    accountNumber: string;
    accountType: string;
    currency: string;
  };
}

interface TransactionDetailModalProps {
  transaction: TransactionDetail | null;
  internationalTransfer?: InternationalTransferDetail | null;
  primaryIntlTransaction?: PrimaryIntlTransaction | null;
  relatedTransfer?: { id: string; type: string; amount: number; account: { accountNumber: string } } | null;
  loading?: boolean;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value && value !== 0) return null;
  return (
    <div className="dashboard-tx-detail-row">
      <span className="dashboard-detail-label">{label}</span>
      <span className="dashboard-detail-value">{value}</span>
    </div>
  );
}

export default function TransactionDetailModal({
  transaction,
  internationalTransfer,
  primaryIntlTransaction,
  relatedTransfer,
  loading,
  onClose,
}: TransactionDetailModalProps) {
  if (!transaction && !loading) return null;

  const isCredit = ['CREDIT', 'DEPOSIT'].includes(transaction?.type || '');
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isFeeLine = transaction?.description?.toLowerCase().includes('international transfer fee');
  const receiptSource = primaryIntlTransaction || transaction;

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal-backdrop" onClick={onClose} />
      <div className="dashboard-modal dashboard-tx-detail-modal">
        <div className="dashboard-modal-header">
          <h2 className="dashboard-modal-title">Transaction Details</h2>
          <button type="button" onClick={onClose} className="dashboard-icon-btn">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="dashboard-loading-wrap">
            <div className="dashboard-spinner" />
            <p>Loading details...</p>
          </div>
        ) : transaction ? (
          <div className="dashboard-tx-detail-body">
            <div className="dashboard-tx-detail-hero">
              <div className="dashboard-tx-detail-icon">
                {isCredit ? (
                  <ArrowDownLeft className="h-6 w-6 dashboard-tx-icon-credit" />
                ) : (
                  <ArrowUpRight className="h-6 w-6 dashboard-tx-icon-debit" />
                )}
              </div>
              <div>
                <p className="dashboard-tx-detail-amount">
                  {isCredit ? '+' : '-'}$
                  {Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="dashboard-tx-detail-desc">{transaction.description}</p>
              </div>
              <span className={`dashboard-badge ${
                transaction.status === 'COMPLETED' ? 'dashboard-badge-success' :
                transaction.status === 'PENDING' ? 'dashboard-badge-warning' : 'dashboard-badge-danger'
              }`}>
                {transaction.status}
              </span>
            </div>

            <div className="dashboard-tx-detail-section">
              <h3 className="dashboard-tx-detail-section-title">
                <Hash className="h-4 w-4" /> General
              </h3>
              <DetailRow label="Transaction ID" value={transaction.id} />
              <DetailRow label="UTR Number" value={transaction.utr || internationalTransfer?.utr} />
              <DetailRow label="Reference" value={transaction.reference} />
              <DetailRow label="Type" value={transaction.type} />
              <DetailRow label="Date" value={formatDate(transaction.createdAt)} />
              <DetailRow label="Account" value={`${transaction.account.accountNumber} (${transaction.account.accountType})`} />
              <DetailRow label="Currency" value={transaction.account.currency} />
            </div>

            {(transaction.transferMode || transaction.sourceAccountNumber || transaction.destinationAccountNumber) && (
              <div className="dashboard-tx-detail-section">
                <h3 className="dashboard-tx-detail-section-title">
                  <User className="h-4 w-4" /> Transfer Details
                </h3>
                <DetailRow label="Transfer Mode" value={transaction.transferMode?.replace(/_/g, ' ')} />
                <DetailRow label="From Account" value={transaction.sourceAccountNumber} />
                <DetailRow label="From Holder" value={transaction.sourceAccountHolder} />
                <DetailRow label="To Account" value={transaction.destinationAccountNumber} />
                <DetailRow label="To Holder" value={transaction.destinationAccountHolder} />
                <DetailRow label="Transfer Fee" value={transaction.transferFee != null ? `$${transaction.transferFee.toFixed(2)}` : null} />
                <DetailRow label="Net Amount" value={transaction.netAmount != null ? `$${transaction.netAmount.toFixed(2)}` : null} />
                {relatedTransfer && (
                  <DetailRow
                    label="Related Entry"
                    value={`${relatedTransfer.type} $${relatedTransfer.amount.toFixed(2)} → ${relatedTransfer.account.accountNumber}`}
                  />
                )}
              </div>
            )}

            {internationalTransfer && (
              <div className="dashboard-tx-detail-section">
                <h3 className="dashboard-tx-detail-section-title">
                  <Globe className="h-4 w-4" /> International Transfer
                </h3>
                <DetailRow label="UTR Number" value={internationalTransfer.utr || transaction.utr} />
                <DetailRow label="Beneficiary" value={internationalTransfer.beneficiaryName} />
                <DetailRow label="Country" value={internationalTransfer.beneficiaryCountry} />
                <DetailRow label="Bank" value={internationalTransfer.bankName} />
                <DetailRow label="SWIFT Code" value={internationalTransfer.swiftCode} />
                <DetailRow label="Beneficiary Account" value={internationalTransfer.accountNumber} />
                <DetailRow label="Exchange Rate" value={`1 ${internationalTransfer.currency} = ${internationalTransfer.exchangeRate} ${internationalTransfer.targetCurrency || 'USD'}`} />
                <DetailRow
                  label="Converted Amount"
                  value={`${internationalTransfer.targetCurrency === 'INR' ? '₹' : ''}${internationalTransfer.convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${internationalTransfer.targetCurrency || internationalTransfer.currency}`}
                />
                <DetailRow label="Transfer Fee" value={`$${internationalTransfer.transferFee.toFixed(2)}`} />
                <DetailRow label="Total Amount" value={`$${internationalTransfer.totalAmount.toFixed(2)}`} />
                <DetailRow label="Estimated Delivery" value={formatDate(internationalTransfer.estimatedDelivery)} />
                {internationalTransfer.completedAt && (
                  <DetailRow label="Completed At" value={formatDate(internationalTransfer.completedAt)} />
                )}
                <DetailRow label="Status" value={internationalTransfer.status} />
              </div>
            )}

            {internationalTransfer && (
              <div className="dashboard-tx-detail-actions">
                {isFeeLine && (
                  <p className="dashboard-tx-detail-fee-note">
                    This is the transfer fee for the international payment below. Download the full confirmation slip.
                  </p>
                )}
                <PDFReceiptGenerator
                  receiptData={{
                    transactionRef: internationalTransfer.reference,
                    utr: internationalTransfer.utr || transaction.utr || '',
                    date: receiptSource?.createdAt || transaction.createdAt,
                    fromAccount: receiptSource?.sourceAccountNumber || receiptSource?.account.accountNumber || transaction.account.accountNumber,
                    fromAccountHolder: receiptSource?.sourceAccountHolder || transaction.sourceAccountHolder || '',
                    toBeneficiary: internationalTransfer.beneficiaryName,
                    toBank: internationalTransfer.bankName,
                    toSwift: internationalTransfer.swiftCode,
                    toAccount: internationalTransfer.accountNumber,
                    toCountry: internationalTransfer.beneficiaryCountry,
                    amount: internationalTransfer.amount,
                    currency: internationalTransfer.currency,
                    targetCurrency: internationalTransfer.targetCurrency || 'USD',
                    exchangeRate: internationalTransfer.exchangeRate,
                    convertedAmount: internationalTransfer.convertedAmount,
                    transferFee: internationalTransfer.transferFee,
                    totalAmount: internationalTransfer.totalAmount,
                    description: receiptSource?.description || transaction.description,
                    completedAt: internationalTransfer.completedAt || undefined,
                    status: internationalTransfer.status,
                  }}
                  className="dashboard-btn dashboard-btn-primary dashboard-btn-full"
                />
              </div>
            )}

            {transaction.isDisputed && (
              <div className="dashboard-alert dashboard-alert-warning">
                Dispute status: {transaction.disputeStatus}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
