'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import QRCode from 'qrcode';

interface PromptPayReceiptProps {
  receiptData: {
    transactionId: string;
    date: Date;
    senderName: string;
    senderAccount: string;
    promptPayId: string;
    amount: number;
    fee: number;
    reason?: string;
    qrCode?: string;
  };
  onDownload?: () => void;
}

const PromptPayReceipt: React.FC<PromptPayReceiptProps> = ({ receiptData, onDownload }) => {
  const generatePDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colors matching KBank style
    const primaryColor = '#00A650'; // KBank green
    const backgroundColor = '#F5F5F5'; // Light grey background
    const textColor = '#333333'; // Dark grey text
    const borderColor = '#DDDDDD'; // Light border
    
    // Background color
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Header Section
    doc.setFontSize(24);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'bold');
    doc.text('Transfer Completed', 20, 30);
    
    // Date and time
    doc.setFontSize(11);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    const formattedDate = format(new Date(receiptData.date), 'dd MMM yy hh:mm a');
    doc.text(formattedDate, 20, 38);
    
    // Bank logo area (top right) - using text for now
    doc.setFontSize(16);
    doc.setTextColor(0, 166, 80); // KBank green
    doc.setFont('helvetica', 'bold');
    doc.text('GDB+', pageWidth - 30, 30); // Global Dot Bank logo placeholder
    
    // Separator line
    doc.setDrawColor(221, 221, 221);
    doc.setLineWidth(0.5);
    doc.line(20, 45, pageWidth - 20, 45);
    
    let currentY = 60;
    
    // Sender Section
    // Logo placeholder (circle)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(255, 0, 0); // Red border like KBank
    doc.setLineWidth(2);
    doc.circle(35, currentY + 15, 12, 'FD'); // Circle with fill and draw
    
    // Logo text inside circle (GDB)
    doc.setFontSize(10);
    doc.setTextColor(0, 166, 80);
    doc.setFont('helvetica', 'bold');
    doc.text('GDB', 31, currentY + 17);
    
    // Sender details (right of logo)
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'bold');
    doc.text(receiptData.senderName.toUpperCase(), 60, currentY + 10);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Global Dot Bank', 60, currentY + 17);
    
    // Mask account number
    const maskedAccount = maskAccountNumber(receiptData.senderAccount);
    doc.text(maskedAccount, 60, currentY + 24);
    
    currentY += 40;
    
    // Down arrow indicator
    doc.setDrawColor(153, 153, 153);
    doc.setLineWidth(1);
    const arrowX = pageWidth / 2;
    const arrowY = currentY;
    doc.line(arrowX, arrowY - 5, arrowX, arrowY + 10); // Vertical line
    doc.line(arrowX - 3, arrowY + 7, arrowX, arrowY + 10); // Left arrow
    doc.line(arrowX + 3, arrowY + 7, arrowX, arrowY + 10); // Right arrow
    
    currentY += 25;
    
    // Recipient Section (PromptPay)
    // PromptPay circle
    doc.setFillColor(230, 230, 230); // Grey circle
    doc.setDrawColor(153, 153, 153);
    doc.setLineWidth(1);
    doc.circle(35, currentY + 15, 12, 'FD');
    
    // PromptPay text inside circle
    doc.setFontSize(8);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    const promptPayText = 'Prompt Pay';
    doc.text(promptPayText.split(' ')[0], 28, currentY + 12);
    doc.text(promptPayText.split(' ')[1] || '', 28, currentY + 17);
    
    // Recipient details - NO NAME, just PromptPay ID
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PromptPay ID', 60, currentY + 10);
    
    // Mask PromptPay ID
    const maskedPromptPayId = maskPromptPayId(receiptData.promptPayId);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(maskedPromptPayId, 60, currentY + 20);
    
    currentY += 45;
    
    // Separator
    doc.setDrawColor(221, 221, 221);
    doc.setLineWidth(0.5);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;
    
    // Transaction Details
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    
    // Transaction ID
    doc.text('Transaction ID:', 20, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(receiptData.transactionId, 75, currentY);
    currentY += 8;
    
    // Separator
    doc.setDrawColor(221, 221, 221);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;
    
    // Amount
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    doc.text('Amount:', 20, currentY);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(`${receiptData.amount.toFixed(2)} Baht`, 75, currentY);
    currentY += 10;
    
    // Separator
    doc.setDrawColor(221, 221, 221);
    doc.line(20, currentY, pageWidth - 20, currentY);
    currentY += 10;
    
    // Fee
    doc.setFontSize(10);
    doc.setTextColor(102, 102, 102);
    doc.setFont('helvetica', 'normal');
    doc.text('Fee:', 20, currentY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text(`${receiptData.fee.toFixed(2)} Baht`, 75, currentY);
    
    // QR Code for verification (bottom right)
    if (receiptData.qrCode) {
      try {
        const qrSize = 35;
        const qrX = pageWidth - 50;
        const qrY = pageHeight - 60;
        
        // Add QR code image directly from base64
        doc.addImage(receiptData.qrCode, 'PNG', qrX, qrY, qrSize, qrSize);
        
        // "Scan for Verify Slip" text below QR
        doc.setFontSize(8);
        doc.setTextColor(102, 102, 102);
        doc.setFont('helvetica', 'normal');
        doc.text('Scan for Verify Slip', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });
      } catch (error) {
        console.error('Error adding QR code to PDF:', error);
      }
    }
    
    // Save the PDF
    const fileName = `PromptPay_Receipt_${receiptData.transactionId}.pdf`;
    doc.save(fileName);
    
    if (onDownload) {
      onDownload();
    }
  };

  // Mask account number: xxx-x-x9230-x
  const maskAccountNumber = (accountNumber: string): string => {
    if (accountNumber.length <= 4) return accountNumber;
    const last4 = accountNumber.slice(-4);
    const masked = 'xxx-'.repeat(Math.floor((accountNumber.length - 4) / 4)) + last4;
    return masked;
  };

  // Mask PromptPay ID: xxx-xxx-7874
  const maskPromptPayId = (id: string): string => {
    const cleaned = id.replace(/\D/g, '');
    if (cleaned.length <= 4) return id;
    const last4 = cleaned.slice(-4);
    if (cleaned.length === 10) {
      // Phone number format: xxx-xxx-7874
      return `xxx-xxx-${last4}`;
    } else if (cleaned.length === 13) {
      // National ID format: xxx-xxx-xxx-7874
      return `xxx-xxx-xxx-${last4}`;
    }
    return `xxx-${last4}`;
  };

  return (
    <button
      onClick={generatePDF}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span>Download Receipt</span>
    </button>
  );
};

export default PromptPayReceipt;

