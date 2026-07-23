'use client';

import React, { useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { BANK_BRANDING, getTransferVerifyUrl } from '@/lib/bank-branding';
import { normalizeUTR } from '@/lib/reference-generator';

export interface InternationalReceiptData {
  transactionRef: string;
  utr: string;
  date: Date | string;
  fromAccount: string;
  fromAccountHolder: string;
  toBeneficiary: string;
  toBank: string;
  toSwift: string;
  toAccount: string;
  toCountry?: string;
  amount: number;
  currency: string;
  targetCurrency: string;
  exchangeRate: number;
  convertedAmount: number;
  transferFee: number;
  totalAmount: number;
  description?: string;
  estimatedDelivery?: Date | string;
  completedAt?: Date | string;
  status: string;
}

interface PDFReceiptGeneratorProps {
  receiptData: InternationalReceiptData;
  className?: string;
}

async function loadLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch('/logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateInternationalReceiptPDF(receiptData: InternationalReceiptData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const [r, g, b] = BANK_BRANDING.primaryColor;
  const utr = normalizeUTR(receiptData.utr);

  const [logoData, qrData] = await Promise.all([
    loadLogoDataUrl(),
    QRCode.toDataURL(getTransferVerifyUrl(utr), {
      width: 140,
      margin: 1,
      color: { dark: '#1e40af', light: '#ffffff' },
    }),
  ]);

  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 48, 'F');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 14, 10, 26, 26);
    } catch {
      // skip logo
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(BANK_BRANDING.shortName, 44, 22);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_BRANDING.legalName, 44, 29);
  doc.text('International Transfer Confirmation Slip', 44, 36);

  doc.setFontSize(7);
  doc.text(`Ref: ${receiptData.transactionRef}`, pageWidth - 14, 18, { align: 'right' });
  doc.text(format(new Date(receiptData.date), 'dd MMM yyyy, HH:mm'), pageWidth - 14, 24, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  let y = 58;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Account Holder', 18, y + 8);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(receiptData.fromAccountHolder || 'Account Holder', 18, y + 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Account: ${receiptData.fromAccount}`, 18, y + 22);

  y += 30;

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('UTR — Unique Transaction Reference', 18, y + 7);
  doc.setFontSize(14);
  doc.setFont('courier', 'bold');
  doc.setTextColor(r, g, b);
  doc.text(utr, 18, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(`Status: ${receiptData.status.toUpperCase()}`, pageWidth - 18, y + 16, { align: 'right' });

  y += 28;

  const addSection = (title: string) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text(title, 14, y);
    y += 6;
  };

  const addRow = (label: string, value: string, bold = false) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 18, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(value, pageWidth - 100);
    doc.text(lines, 70, y);
    y += Math.max(6, lines.length * 5);
  };

  addSection('Beneficiary Details');
  addRow('Name:', receiptData.toBeneficiary);
  addRow('Bank:', receiptData.toBank);
  addRow('SWIFT/BIC:', receiptData.toSwift);
  addRow('Account:', receiptData.toAccount);
  if (receiptData.toCountry) addRow('Country:', receiptData.toCountry);
  y += 4;

  addSection('Amount Details');
  addRow('Transfer Amount:', `$${receiptData.amount.toFixed(2)} ${receiptData.currency}`);
  addRow('Exchange Rate:', `1 ${receiptData.currency} = ${receiptData.exchangeRate} ${receiptData.targetCurrency}`);
  addRow(
    'Converted Amount:',
    `${receiptData.targetCurrency === 'INR' ? '₹' : ''}${receiptData.convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${receiptData.targetCurrency}`,
    true
  );
  addRow('Transfer Fee (2%):', `$${receiptData.transferFee.toFixed(2)}`);
  addRow('Total Debited:', `$${receiptData.totalAmount.toFixed(2)} ${receiptData.currency}`, true);
  if (receiptData.description) addRow('Description:', receiptData.description);
  if (receiptData.completedAt) {
    addRow('Completed:', format(new Date(receiptData.completedAt), 'dd MMM yyyy, HH:mm'));
  }

  const footerY = pageHeight - 42;
  doc.setFillColor(r, g, b);
  doc.rect(0, footerY, pageWidth, 42, 'F');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 14, footerY + 8, 16, 16);
    } catch {
      // skip
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(BANK_BRANDING.legalName, 34, footerY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(BANK_BRANDING.address, 34, footerY + 18);
  doc.text(`${BANK_BRANDING.websiteDisplay} | ${BANK_BRANDING.supportEmail}`, 34, footerY + 24);
  doc.text('Scan QR code to verify this transfer is genuine.', 34, footerY + 30);

  try {
    doc.addImage(qrData, 'PNG', pageWidth - 38, footerY + 6, 28, 28);
  } catch {
    // skip QR
  }

  doc.setFontSize(6);
  doc.text('Verify Transfer', pageWidth - 24, footerY + 36, { align: 'center' });

  doc.save(`Transfer_Confirmation_${utr}.pdf`);
}

const PDFReceiptGenerator: React.FC<PDFReceiptGeneratorProps> = ({ receiptData, className }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generateInternationalReceiptPDF(receiptData);
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className={className || 'btn-primary'}
    >
      {loading ? 'Generating PDF…' : 'Download Confirmation Slip (PDF)'}
    </button>
  );
};

export default PDFReceiptGenerator;
