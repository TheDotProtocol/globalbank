'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

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

export function generateInternationalReceiptPDF(receiptData: InternationalReceiptData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = '#1e40af';

  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, pageWidth, 50, 'F');
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Global Dot Bank', 20, 28);
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('International Transfer Confirmation', 20, 40);

  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.text('Transfer Confirmation Slip', pageWidth / 2, 65, { align: 'center' });

  doc.setDrawColor(30, 64, 175);
  doc.setLineWidth(1);
  doc.line(40, 70, pageWidth - 40, 70);

  let y = 82;
  const addRow = (label: string, value: string, bold = false) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(value, 80, y);
    y += 8;
  };

  doc.setFillColor(240, 248, 255);
  doc.rect(15, 75, pageWidth - 30, 28, 'F');
  y = 85;
  addRow('UTR Number:', receiptData.utr, true);
  addRow('Reference:', receiptData.transactionRef, true);
  addRow('Status:', receiptData.status.toUpperCase(), true);
  addRow('Date:', format(new Date(receiptData.date), 'dd MMM yyyy, HH:mm'), false);
  y += 6;

  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('Sender Details', 20, y);
  y += 10;
  addRow('Account Holder:', receiptData.fromAccountHolder);
  addRow('Account Number:', receiptData.fromAccount);
  y += 4;

  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('Beneficiary Details', 20, y);
  y += 10;
  addRow('Name:', receiptData.toBeneficiary);
  addRow('Bank:', receiptData.toBank);
  addRow('SWIFT/BIC:', receiptData.toSwift);
  addRow('Account Number:', receiptData.toAccount);
  if (receiptData.toCountry) addRow('Country:', receiptData.toCountry);
  y += 4;

  doc.setFontSize(12);
  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount Details', 20, y);
  y += 10;
  addRow('Transfer Amount:', `$${receiptData.amount.toFixed(2)} ${receiptData.currency}`);
  addRow('Exchange Rate:', `1 ${receiptData.currency} = ${receiptData.exchangeRate} ${receiptData.targetCurrency}`);
  addRow('Converted Amount:', `${receiptData.targetCurrency === 'INR' ? '₹' : ''}${receiptData.convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${receiptData.targetCurrency}`, true);
  addRow('Transfer Fee (2%):', `$${receiptData.transferFee.toFixed(2)}`);
  addRow('Total Debited:', `$${receiptData.totalAmount.toFixed(2)} ${receiptData.currency}`, true);
  if (receiptData.description) addRow('Description:', receiptData.description);
  if (receiptData.completedAt) {
    addRow('Completed:', format(new Date(receiptData.completedAt), 'dd MMM yyyy, HH:mm'));
  }

  doc.setFillColor(30, 64, 175);
  doc.rect(0, pageHeight - 35, pageWidth, 35, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Global Dot Bank | support@globaldotbank.org | This is a system-generated confirmation slip.', 20, pageHeight - 20);
  doc.text(`UTR: ${receiptData.utr} | Verify at globaldotbank.org`, 20, pageHeight - 12);

  doc.save(`Transfer_Confirmation_${receiptData.utr}.pdf`);
}

const PDFReceiptGenerator: React.FC<PDFReceiptGeneratorProps> = ({ receiptData, className }) => {
  return (
    <button
      type="button"
      onClick={() => generateInternationalReceiptPDF(receiptData)}
      className={className || 'btn-primary'}
    >
      Download Confirmation Slip (PDF)
    </button>
  );
};

export default PDFReceiptGenerator;
