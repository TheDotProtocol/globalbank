'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface PDFReceiptGeneratorProps {
  receiptData: {
    transactionRef: string;
    date: Date;
    fromAccount: string;
    toBeneficiary: string;
    toBank: string;
    toSwift: string;
    toAccount: string;
    amount: number;
    currency: string;
    exchangeRate: number;
    convertedAmount: number;
    transferFee: number;
    totalAmount: number;
    description?: string;
    estimatedDelivery: Date;
    status: string;
  };
}

const PDFReceiptGenerator: React.FC<PDFReceiptGeneratorProps> = ({ receiptData }) => {
  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors
    const primaryColor = '#1e40af'; // Blue
    const secondaryColor = '#64748b'; // Gray
    const accentColor = '#059669'; // Green
    
    // Header Section with gradient effect
    doc.setFillColor(30, 64, 175); // Darker blue
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Add logo (we'll use text for now, but you can add actual logo)
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Global Dot Bank', 20, 30);
    
    // Add tagline
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('International Banking Excellence', 20, 40);
    
    // Receipt Title with underline
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('International Transfer Receipt', pageWidth / 2, 70, { align: 'center' });
    
    // Add decorative line
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(2);
    doc.line(60, 75, pageWidth - 60, 75);
    
    // Transaction Reference (highlighted box)
    doc.setFillColor(240, 248, 255);
    doc.rect(20, 85, pageWidth - 40, 20, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1);
    doc.rect(20, 85, pageWidth - 40, 20, 'S');
    
    doc.setFontSize(14);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction Reference:', 25, 95);
    doc.text(receiptData.transactionRef, 25, 100);
    
    // Date and Status in right column
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Date: ${format(new Date(receiptData.date), 'PPP p')}`, pageWidth - 120, 95);
    doc.text(`Status: ${receiptData.status}`, pageWidth - 120, 100);
    
    // Transfer Details Section with background
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 120, pageWidth - 40, 80, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1);
    doc.rect(20, 120, pageWidth - 40, 80, 'S');
    
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Transfer Details', 25, 135);
    
    // From Account
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('From Account:', 25, 150);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.fromAccount, 90, 150);
    
    // Beneficiary Details
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary Name:', 25, 160);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.toBeneficiary, 90, 160);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary Bank:', 25, 170);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.toBank, 90, 170);
    
    doc.setFont('helvetica', 'normal');
    doc.text('SWIFT/BIC Code:', 25, 180);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.toSwift, 90, 180);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Beneficiary Account:', 25, 190);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.toAccount, 90, 190);
    
    if (receiptData.description) {
      doc.setFont('helvetica', 'normal');
      doc.text('Description:', 25, 200);
      doc.setFont('helvetica', 'bold');
      doc.text(receiptData.description, 90, 200);
    }
    
    // Amount Summary Section with professional styling
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 220, pageWidth - 40, 60, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(1);
    doc.rect(20, 220, pageWidth - 40, 60, 'S');
    
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Summary', 25, 235);
    
    // Amount details with better formatting
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    const amountY = 250;
    doc.text('Transfer Amount:', 25, amountY);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${receiptData.amount.toLocaleString()} ${receiptData.currency}`, 120, amountY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Exchange Rate:', 25, amountY + 10);
    doc.setFont('helvetica', 'bold');
    doc.text(`1 ${receiptData.currency} = ${receiptData.exchangeRate} USD`, 120, amountY + 10);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Converted Amount:', 25, amountY + 20);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${receiptData.convertedAmount.toLocaleString()} USD`, 120, amountY + 20);
    
    doc.setFont('helvetica', 'normal');
    doc.text('International Fee (2%):', 25, amountY + 30);
    doc.setTextColor(220, 38, 38); // Red for fee
    doc.setFont('helvetica', 'bold');
    doc.text(`-$${receiptData.transferFee.toLocaleString()} USD`, 120, amountY + 30);
    
    // Total Amount (highlighted with border)
    doc.setFillColor(240, 248, 255);
    doc.rect(20, amountY + 40, pageWidth - 40, 15, 'F');
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(2);
    doc.rect(20, amountY + 40, pageWidth - 40, 15, 'S');
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Total Debit:', 25, amountY + 50);
    doc.text(`$${receiptData.totalAmount.toLocaleString()} USD`, 120, amountY + 50);
    
    // Delivery Information
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Estimated Delivery:', 20, amountY + 70);
    doc.setFont('helvetica', 'bold');
    doc.text(format(new Date(receiptData.estimatedDelivery), 'PPP'), 120, amountY + 70);
    
    // Professional Footer
    const footerY = pageHeight - 40;
    doc.setFillColor(30, 64, 175); // Dark blue footer
    doc.rect(0, footerY, pageWidth, 40, 'F');
    
    // Company info
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Global Dot Bank', 20, footerY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('International Banking Excellence', 20, footerY + 20);
    
    // Contact info
    doc.text('support@globaldotbank.org', pageWidth - 100, footerY + 12);
    doc.text('+1 (555) 123-4567', pageWidth - 100, footerY + 20);
    
    // Security and authenticity
    doc.setFontSize(7);
    doc.setTextColor(200, 200, 255);
    doc.text('SECURITY: This receipt contains encrypted transaction data.', 20, footerY + 30);
    doc.text('Verify authenticity at globaldotbank.org/verify', pageWidth - 120, footerY + 30);
    
    // Generation timestamp
    doc.setFontSize(6);
    doc.setTextColor(180, 180, 255);
    doc.text(`Generated on ${format(new Date(), 'PPP p')}`, pageWidth / 2, footerY + 38, { align: 'center' });
    
    // Save the PDF
    doc.save(`International_Transfer_Receipt_${receiptData.transactionRef}.pdf`);
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Download PDF Receipt</span>
    </button>
  );
};

export default PDFReceiptGenerator;
