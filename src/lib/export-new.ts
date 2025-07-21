import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  format: 'pdf' | 'csv';
  data: any[];
  filename: string;
  title: string;
  headers: string[];
  fields: string[];
}

interface StatementOptions {
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  account: {
    accountNumber: string;
    accountType: string;
    balance: number;
  };
  transactions: any[];
  startDate: Date;
  endDate: Date;
  openingBalance: number;
}

export class ExportManager {
  static async loadLogo(): Promise<string | null> {
    try {
      const response = await fetch('/logo.png');
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.log('Error loading logo:', error);
      return null;
    }
  }

  static async exportToPDF(options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    
    const logoData = await ExportManager.loadLogo();
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 14, 10, 20, 20);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      } catch (error) {
        console.log('Error adding logo image:', error);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('🏦', 14, 20);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      }
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('🏦', 14, 20);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Global Dot Bank', 40, 20);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('A Dot Protocol Company', 40, 28);
    doc.text('Address: 1075 Terra Bella Ave, Mountain View CA, 94043', 14, 38);
    doc.text('Website: https://globaldotbank.org', 14, 44);
    doc.text('Email: banking@globaldotbank.org', 14, 50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, 70);
    
    const tableData = options.data.map(item => 
      options.fields.map(field => item[field] || '')
    );
    
    autoTable(doc, {
      head: [options.headers],
      body: tableData,
      startY: 80,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(7);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, finalY);
    doc.text('This is a system-generated document. No signature required.', 14, finalY + 5);
    
    return doc.output('blob');
  }

  static async exportStatementToPDF(options: StatementOptions): Promise<Blob> {
    const doc = new jsPDF('portrait');
    
    // 1. Header Section (Top of the PDF)
    const logoData = await ExportManager.loadLogo();
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 14, 10, 20, 20);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      } catch (error) {
        console.log('Error adding logo image:', error);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('🏦', 14, 20);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      }
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('🏦', 14, 20);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Global Dot Bank', 40, 20);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('A Dot Protocol Company', 40, 28);
    doc.text('Address: 1075 Terra Bella Ave, Mountain View CA, 94043', 14, 38);
    doc.text('Website: https://globaldotbank.org', 14, 44);
    doc.text('Email: banking@globaldotbank.org', 14, 50);
    
    // 2. Customer Information Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT STATEMENT', 14, 70);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information:', 14, 85);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Full Name: ${options.user.firstName} ${options.user.lastName}`, 14, 95);
    doc.text(`Account Number: ${options.account.accountNumber}`, 14, 102);
    doc.text(`Account Type: ${options.account.accountType}`, 14, 109);
    doc.text(`Email: ${options.user.email}`, 14, 116);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Period:', 14, 130);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`From: ${options.startDate.toLocaleDateString()}`, 14, 140);
    doc.text(`To: ${options.endDate.toLocaleDateString()}`, 14, 147);
    
    // 3. Transaction Table
    let runningBalance = options.openingBalance;
    const transactionsWithBalance = options.transactions.map((tx, index) => {
      const amount = parseFloat(tx.amount);
      const isCredit = tx.type === 'CREDIT';
      runningBalance += isCredit ? amount : -amount;
      return [
        (index + 1).toString(), // Serial Number
        new Date(tx.createdAt).toLocaleDateString(),
        tx.description.length > 40 ? tx.description.substring(0, 40) + '...' : tx.description,
        isCredit ? '' : `$${amount.toLocaleString()}`,
        isCredit ? `$${amount.toLocaleString()}` : '',
        `$${runningBalance.toLocaleString()}`
      ];
    });
    
    // Add carry forward balance row if applicable
    if (options.openingBalance > 0) {
      transactionsWithBalance.unshift([
        'CF', // Carry Forward
        options.startDate.toLocaleDateString(),
        'Balance Carried Forward',
        '',
        '',
        `$${options.openingBalance.toLocaleString()}`
      ]);
    }
    
    autoTable(doc, {
      head: [['Sl No.', 'Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: transactionsWithBalance,
      startY: 160,
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Calculate totals
    const credits = options.transactions
      .filter(tx => tx.type === 'CREDIT')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const debits = options.transactions
      .filter(tx => tx.type === 'DEBIT')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const closingBalance = options.openingBalance + credits - debits;
    
    // Summary section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Credits: $${credits.toLocaleString()}`, 14, finalY + 8);
    doc.text(`Total Debits: $${debits.toLocaleString()}`, 14, finalY + 15);
    doc.text(`Net Balance: $${closingBalance.toLocaleString()}`, 14, finalY + 22);
    
    // 4. Footer Section
    const footerY = finalY + 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a system-generated statement. No signature required.', 14, footerY);
    doc.text(`Generated on ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()} UTC`, 14, footerY + 6);
    doc.text(`Document ID: STMT-${options.account.accountNumber}-${Date.now()}`, 14, footerY + 12);
    
    return doc.output('blob');
  }

  static exportToCSV(options: ExportOptions): Blob {
    const headers = options.headers.join(',');
    const rows = options.data.map(item => 
      options.fields.map(field => {
        const value = item[field];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  }

  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const exportTemplates = {
  transactions: {
    title: 'Transaction History',
    headers: ['Date', 'Type', 'Description', 'Amount', 'Status', 'Reference'],
    fields: ['createdAt', 'type', 'description', 'amount', 'status', 'reference']
  },
  fixedDeposits: {
    title: 'Fixed Deposits',
    headers: ['Amount', 'Interest Rate', 'Duration', 'Maturity Date', 'Status'],
    fields: ['amount', 'interestRate', 'duration', 'maturityDate', 'status']
  },
  cards: {
    title: 'Cards',
    headers: ['Card Number', 'Type', 'Status', 'Expiry Date'],
    fields: ['cardNumber', 'cardType', 'status', 'expiryDate']
  }
};

export async function exportTransactions(transactions: any[], format: 'pdf' | 'csv') {
  const options: ExportOptions = {
    format,
    data: transactions,
    filename: `transactions-${new Date().toISOString().split('T')[0]}.${format}`,
    ...exportTemplates.transactions
  };
  
  const blob = format === 'pdf' 
    ? await ExportManager.exportToPDF(options)
    : ExportManager.exportToCSV(options);
    
  ExportManager.downloadFile(blob, options.filename);
}

export async function exportStatement(
  user: any, 
  account: any, 
  transactions: any[], 
  format: 'pdf' | 'csv'
) {
  if (format === 'pdf') {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const openingBalance = Math.max(0, parseFloat(account.balance) - 
      transactions.reduce((sum, tx) => {
        const amount = parseFloat(tx.amount);
        return sum + (tx.type === 'CREDIT' ? amount : -amount);
      }, 0)
    );
    
    const statementOptions: StatementOptions = {
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      account: {
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        balance: parseFloat(account.balance)
      },
      transactions: transactions.slice(0, 50),
      startDate,
      endDate,
      openingBalance
    };
    
    const blob = await ExportManager.exportStatementToPDF(statementOptions);
    const filename = `statement-${account.accountNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    ExportManager.downloadFile(blob, filename);
  } else {
    await exportTransactions(transactions, 'csv');
  }
}

export async function exportFixedDeposits(deposits: any[], format: 'pdf' | 'csv') {
  const options: ExportOptions = {
    format,
    data: deposits,
    filename: `fixed-deposits-${new Date().toISOString().split('T')[0]}.${format}`,
    ...exportTemplates.fixedDeposits
  };
  
  const blob = format === 'pdf' 
    ? await ExportManager.exportToPDF(options)
    : ExportManager.exportToCSV(options);
    
  ExportManager.downloadFile(blob, options.filename);
} 