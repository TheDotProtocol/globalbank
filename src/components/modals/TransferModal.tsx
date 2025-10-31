'use client';

import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, QrCode, Building2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import QRCode from 'qrcode';
import PromptPayReceipt from '@/components/PromptPayReceipt';

// Thai Banks List
const THAI_BANKS = [
  { code: '001', name: 'Bangkok Bank (BBL)', swift: 'BKKBTHBK' },
  { code: '002', name: 'Krung Thai Bank (KTB)', swift: 'KRTHTHBK' },
  { code: '004', name: 'Kasikorn Bank (K Bank)', swift: 'KASITHBK' },
  { code: '006', name: 'Siam Commercial Bank (SCB)', swift: 'SICOTHTH' },
  { code: '011', name: 'TMB Bank (TMB)', swift: 'TMBKTHBK' },
  { code: '014', name: 'Government Savings Bank (GSB)', swift: 'GSBATHBK' },
  { code: '022', name: 'CIMB Thai Bank', swift: 'CIMBTHBK' },
  { code: '024', name: 'United Overseas Bank (UOB)', swift: 'UOVBTHBK' },
  { code: '025', name: 'Standard Chartered Bank (SCBT)', swift: 'SCBLTHBX' },
  { code: '030', name: 'Ayudhya Bank (BAY)', swift: 'AYUDTHBK' },
  { code: '033', name: 'Government Housing Bank (GHB)', swift: 'GHBKTHBK' },
  { code: '034', name: 'Thanachart Bank (TBank)', swift: 'THBKTHBK' },
  { code: '067', name: 'Tisco Bank', swift: 'TISCTHBK' },
  { code: '069', name: 'Kiatnakin Bank', swift: 'KKBATHBK' },
  { code: '070', name: 'Land and Houses Bank', swift: 'LHBATHBK' },
  { code: '071', name: 'ICBC Thailand', swift: 'ICBKTHBK' },
  { code: '098', name: 'Krungsri Bank (Bank of Ayudhya)', swift: 'AYUDTHBK' },
  { code: '099', name: 'RHB Bank Thailand', swift: 'RHBATHBK' }
];

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: any[];
  onSuccess: () => void;
}

type TransferType = 'INTERNAL' | 'THAI_BANK' | 'THAI_QR';

export default function TransferModal({ isOpen, onClose, accounts, onSuccess }: TransferModalProps) {
  const [transferType, setTransferType] = useState<TransferType>('INTERNAL');
  const [formData, setFormData] = useState({
    sourceAccountId: '',
    destinationAccountNumber: '',
    amount: '',
    description: '',
    // Thai Bank Transfer fields
    thaiBankCode: '',
    thaiBankName: '',
    accountHolderName: '',
    bankCode: '', // Thai bank code (similar to IFSC)
    reason: '',
    // Thai QR fields
    promptPayPhone: '',
    promptPayId: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [transferDetails, setTransferDetails] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string>('');
  const [successData, setSuccessData] = useState<any>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto-fill bank name when bank code is selected
    if (name === 'thaiBankCode') {
      const selectedBank = THAI_BANKS.find(bank => bank.code === value);
      if (selectedBank) {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          thaiBankName: selectedBank.name,
          bankCode: selectedBank.swift
        }));
        return; // Return early to prevent double update
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTransferTypeChange = (type: TransferType) => {
    setTransferType(type);
    // Reset form when changing transfer type
    setFormData({
      sourceAccountId: formData.sourceAccountId, // Keep source account
      destinationAccountNumber: '',
      amount: '',
      description: '',
      thaiBankCode: '',
      thaiBankName: '',
      accountHolderName: '',
      bankCode: '',
      reason: '',
      promptPayPhone: '',
      promptPayId: ''
    });
    setStep(1);
    setTransferDetails(null);
    setQrCode('');
  };

  const validateForm = () => {
    if (!formData.sourceAccountId || !formData.amount) {
      showToast('Please fill in all required fields', 'error');
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return false;
    }

    const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);
    if (sourceAccount && sourceAccount.balance < amount) {
      showToast('Insufficient balance', 'error');
      return false;
    }

    if (transferType === 'INTERNAL') {
      if (!formData.destinationAccountNumber || !formData.description) {
        showToast('Please fill in all fields', 'error');
        return false;
      }
    } else if (transferType === 'THAI_BANK') {
      if (!formData.thaiBankCode || !formData.destinationAccountNumber || !formData.accountHolderName || !formData.reason) {
        showToast('Please fill in all Thai bank transfer fields', 'error');
        return false;
      }
    } else if (transferType === 'THAI_QR') {
      if ((!formData.promptPayPhone && !formData.promptPayId) || !formData.reason) {
        showToast('Please enter PromptPay phone or ID and reason for transfer', 'error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const amount = parseFloat(formData.amount);
    const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);

    if (transferType === 'INTERNAL') {
      // Find destination account
      const destinationAccount = accounts.find(acc => acc.accountNumber === formData.destinationAccountNumber);
      if (!destinationAccount) {
        showToast('Destination account not found', 'error');
        return;
      }

      // Show transfer details for confirmation
      setTransferDetails({
        sourceAccount,
        destinationAccount,
        amount,
        description: formData.description,
        transferFee: 0,
        netAmount: amount,
        type: 'INTERNAL'
      });
      setStep(2);
    } else if (transferType === 'THAI_BANK') {
      // Show transfer details for confirmation
      setTransferDetails({
        sourceAccount,
        amount,
        reason: formData.reason,
        destinationAccountNumber: formData.destinationAccountNumber,
        accountHolderName: formData.accountHolderName,
        bankName: formData.thaiBankName,
        bankCode: formData.bankCode,
        transferFee: amount * 0.01, // 1% fee for Thai bank transfers
        netAmount: amount + (amount * 0.01),
        type: 'THAI_BANK'
      });
      setStep(2);
    } else if (transferType === 'THAI_QR') {
      // Generate Thai QR code and show confirmation
      try {
        const promptPayId = formData.promptPayPhone || formData.promptPayId;
        
        // Generate Thai QR code (PromptPay format)
        const qrString = generatePromptPayQR(promptPayId, amount);
        
        const qrCodeUrl = await QRCode.toDataURL(qrString, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          },
          errorCorrectionLevel: 'M'
        });

        setQrCode(qrCodeUrl);
        setTransferDetails({
          sourceAccount,
          amount,
          reason: formData.reason,
          promptPayId,
          transferFee: 0, // No fee for PromptPay transfers
          netAmount: amount,
          type: 'THAI_QR'
        });
        setStep(2);
      } catch (error) {
        console.error('QR generation error:', error);
        showToast('Failed to generate QR code', 'error');
      }
    }
  };

  // Generate PromptPay QR code string
  const generatePromptPayQR = (id: string, amount: number): string => {
    // PromptPay QR format: 00020101021129370016A0000006770101120113[ID]53037645406[AMOUNT]5802TH6304[CRC]
    const merchantId = id.length === 13 ? '0113' + id : id.length === 10 ? '0110' + id : '0113' + id; // Phone or ID
    const amountStr = amount.toFixed(2);
    
    // Build QR string
    const qrData = {
      payloadFormatIndicator: '01',
      pointOfInitiationMethod: '11', // Static QR
      merchantAccountInformation: {
        length: (merchantId.length + 4).toString().padStart(2, '0'),
        tag: '29',
        guid: '0016A000000677010112',
        merchantId: merchantId
      },
      merchantCategoryCode: '0000',
      transactionCurrency: '764', // THB
      transactionAmount: amountStr,
      countryCode: 'TH',
      crc: '' // Will be calculated
    };

    // Simplified PromptPay QR string
    const qrString = `000201010212${qrData.merchantAccountInformation.tag}${qrData.merchantAccountInformation.length}0016A000000677010112${merchantId.length.toString().padStart(2, '0')}${merchantId}53037645406${amountStr.length.toString().padStart(2, '0')}${amountStr}5802TH6304`;
    
    return qrString;
  };

  const confirmTransfer = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Authentication required', 'error');
        return;
      }

      let response;

      if (transferType === 'INTERNAL') {
        response = await fetch('/api/transactions/transfer', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceAccountId: formData.sourceAccountId,
            destinationAccountNumber: formData.destinationAccountNumber,
            amount: formData.amount,
            description: formData.description,
            transferMode: 'INTERNAL_TRANSFER'
          })
        });
      } else if (transferType === 'THAI_BANK') {
        response = await fetch('/api/transfers/thai-bank', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceAccountId: formData.sourceAccountId,
            amount: parseFloat(formData.amount),
            destinationAccountNumber: formData.destinationAccountNumber,
            accountHolderName: formData.accountHolderName,
            bankCode: formData.bankCode,
            bankName: formData.thaiBankName,
            reason: formData.reason
          })
        });
      } else if (transferType === 'THAI_QR') {
        response = await fetch('/api/transfers/thai-qr', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sourceAccountId: formData.sourceAccountId,
            amount: parseFloat(formData.amount),
            promptPayId: formData.promptPayPhone || formData.promptPayId,
            reason: formData.reason,
            qrCode: qrCode
          })
        });
      }

      if (!response) {
        showToast('Invalid transfer type', 'error');
        return;
      }

      const data = await response.json();

      if (response.ok) {
        showToast('Transfer completed successfully', 'success');
        
        // For PromptPay transfers, show success step with receipt
        if (transferType === 'THAI_QR' && data.transaction) {
          const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);
          
          // Fetch user data for receipt
          try {
            const userResponse = await fetch('/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const userData = await userResponse.json();
            const userName = userData.user 
              ? `${userData.user.firstName || ''} ${userData.user.lastName || ''}`.trim()
              : 'Account Holder';
            
            setSuccessData({
              transactionId: data.transaction.reference,
              date: new Date(),
              senderName: userName || 'Account Holder',
              senderAccount: sourceAccount?.accountNumber || '',
              promptPayId: formData.promptPayPhone || formData.promptPayId,
              amount: parseFloat(formData.amount),
              fee: data.transaction.fee || 0,
              reason: formData.reason,
              qrCode: qrCode
            });
            setStep(3); // Go to success step
          } catch (error) {
            console.error('Error fetching user data:', error);
            // Fallback without user name
            setSuccessData({
              transactionId: data.transaction.reference,
              date: new Date(),
              senderName: 'Account Holder',
              senderAccount: sourceAccount?.accountNumber || '',
              promptPayId: formData.promptPayPhone || formData.promptPayId,
              amount: parseFloat(formData.amount),
              fee: data.transaction.fee || 0,
              reason: formData.reason,
              qrCode: qrCode
            });
            setStep(3);
          }
        } else {
          // For other transfers, close immediately
          onSuccess();
          handleClose();
        }
      } else {
        showToast(data.error || 'Transfer failed', 'error');
      }
    } catch (error) {
      console.error('Transfer error:', error);
      showToast('Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      sourceAccountId: '',
      destinationAccountNumber: '',
      amount: '',
      description: '',
      thaiBankCode: '',
      thaiBankName: '',
      accountHolderName: '',
      bankCode: '',
      reason: '',
      promptPayPhone: '',
      promptPayId: ''
    });
    setTransferType('INTERNAL');
    setStep(1);
    setTransferDetails(null);
    setQrCode('');
    setSuccessData(null);
    setLoading(false);
    onClose();
  };

  const sourceAccount = accounts.find(acc => acc.id === formData.sourceAccountId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {step === 1 ? 'Transfer Money' : step === 2 ? 'Confirm Transfer' : 'Transfer Completed'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transfer Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transfer Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTransferTypeChange('INTERNAL')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    transferType === 'INTERNAL'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <ArrowRight className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Internal</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTransferTypeChange('THAI_BANK')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    transferType === 'THAI_BANK'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Building2 className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Thai Bank</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleTransferTypeChange('THAI_QR')}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    transferType === 'THAI_QR'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">PromptPay</div>
                </button>
              </div>
            </div>

            {/* From Account */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Account
              </label>
              <select
                name="sourceAccountId"
                value={formData.sourceAccountId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.accountNumber} - ${account.balance.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Internal Transfer Fields */}
            {transferType === 'INTERNAL' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    To Account Number
                  </label>
                  <input
                    type="text"
                    name="destinationAccountNumber"
                    value={formData.destinationAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="What's this transfer for?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            {/* Thai Bank Transfer Fields */}
            {transferType === 'THAI_BANK' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Select Destination Bank
                  </label>
                  <select
                    name="thaiBankCode"
                    value={formData.thaiBankCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  >
                    <option value="">Select bank</option>
                    {THAI_BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    name="destinationAccountNumber"
                    value={formData.destinationAccountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Enter account holder name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bank Code / SWIFT Code
                  </label>
                  <input
                    type="text"
                    name="bankCode"
                    value={formData.bankCode}
                    onChange={handleInputChange}
                    placeholder="Auto-filled from bank selection"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    This is automatically filled when you select a bank
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Transfer
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason for transfer"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            {/* Thai QR / PromptPay Fields */}
            {transferType === 'THAI_QR' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PromptPay Phone Number (10 digits)
                  </label>
                  <input
                    type="tel"
                    name="promptPayPhone"
                    value={formData.promptPayPhone}
                    onChange={handleInputChange}
                    placeholder="08XXXXXXXX"
                    maxLength={10}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Or enter PromptPay ID below
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    PromptPay ID / National ID (13 digits)
                  </label>
                  <input
                    type="text"
                    name="promptPayId"
                    value={formData.promptPayId}
                    onChange={handleInputChange}
                    placeholder="1XXXXXXXXXXXX"
                    maxLength={13}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for Transfer
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Enter reason for transfer"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            {/* Amount (always shown) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
              {sourceAccount && formData.amount && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Available: ${sourceAccount.balance.toLocaleString()}
                </p>
              )}
              {transferType === 'THAI_BANK' && formData.amount && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Fee (1%): ${(parseFloat(formData.amount) * 0.01).toFixed(2)} | Total: ${(parseFloat(formData.amount) * 1.01).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-3">Transfer Details</h3>
              
              {transferDetails?.type === 'INTERNAL' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">From:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.sourceAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">To:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.destinationAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="border-t pt-3 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${transferDetails?.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Net Amount:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${transferDetails?.netAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Description:</span>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {transferDetails?.description}
                    </p>
                  </div>
                </div>
              )}

              {transferDetails?.type === 'THAI_BANK' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">From Account:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.sourceAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Bank:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.bankName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Number:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.destinationAccountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Account Holder:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.accountHolderName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">SWIFT Code:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.bankCode}
                    </span>
                  </div>
                  <div className="border-t pt-3 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${transferDetails?.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fee (1%):</span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        ${transferDetails?.transferFee?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${transferDetails?.netAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {transferDetails?.reason}
                    </p>
                  </div>
                </div>
              )}

              {transferDetails?.type === 'THAI_QR' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">From Account:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.sourceAccount?.accountNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">PromptPay ID:</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {transferDetails?.promptPayId}
                    </span>
                  </div>
                  <div className="border-t pt-3 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        ${transferDetails?.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 dark:border-gray-600">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${transferDetails?.netAmount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reason:</span>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {transferDetails?.reason}
                    </p>
                  </div>
                  {qrCode && (
                    <div className="mt-4 text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Scan to Pay</p>
                      <img src={qrCode} alt="PromptPay QR Code" className="mx-auto w-48 h-48 border-2 border-gray-300 dark:border-gray-600 rounded-lg" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Scan this QR code with your banking app to complete the transfer
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800 dark:text-yellow-300">
                  <p className="font-medium">Please confirm your transfer</p>
                  <p className="mt-1">This action cannot be undone once completed.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Back
              </button>
              <button
                onClick={confirmTransfer}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && successData && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-3">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-green-800 dark:text-green-200 text-center mb-2">
                Transfer Completed Successfully!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300 text-center">
                Your PromptPay transfer has been processed
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Transaction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{successData.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{successData.amount.toFixed(2)} Baht</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{successData.fee.toFixed(2)} Baht</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">PromptPay ID:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {successData.promptPayId.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3') || 
                     successData.promptPayId.replace(/(\d{1})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(successData.date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <PromptPayReceipt
                receiptData={successData}
                onDownload={() => {
                  showToast('Receipt downloaded successfully', 'success');
                }}
              />
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => {
                  onSuccess();
                  handleClose();
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}