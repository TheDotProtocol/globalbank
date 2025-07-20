import { jsPDF } from 'jspdf';
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
      const logoUrl = '/logo.png';
      const response = await fetch(logoUrl);
      if (response.ok) {
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    } catch (error) {
      console.log('Could not load logo image:', error);
    }
    return null;
  }

  static async exportToPDF(options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(options.title, 14, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData = options.data.map(item => 
      options.fields.map(field => item[field] || '')
    );
    
    autoTable(doc, {
      head: [options.headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255
      }
    });
    
    return doc.output('blob');
  }

  static async exportStatementToPDF(options: StatementOptions): Promise<Blob> {
    const doc = new jsPDF('landscape');
    
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
      doc.text('��', 14, 20);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Global Dot Bank', 40, 20);
    }
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('2261 Market St, San Francisco, CA 94140', 14, 30);
    doc.text('Website: https://globaldotbank.org', 14, 35);
    doc.text('Email: bankingsupport@globaldotbank.org', 14, 40);
    doc.text('Phone: +1 650 338 8168 - America', 14, 45);
    doc.text('WhatsApp: +66 966 92 1260 - Asia', 14, 50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT STATEMENT', 14, 65);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Holder Details:', 14, 80);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${options.user.firstName} ${options.user.lastName}`, 14, 88);
    doc.text(`Account Number: ${options.account.accountNumber}`, 14, 92);
    doc.text(`Account Type: ${options.account.accountType}`, 14, 96);
    doc.text(`Email: ${options.user.email}`, 14, 100);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Statement Period:', 14, 115);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`From: ${options.startDate.toLocaleDateString()}`, 14, 123);
    doc.text(`To: ${options.endDate.toLocaleDateString()}`, 14, 127);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Opening Balance: $${options.openingBalance.toLocaleString()}`, 14, 140);
    
    let runningBalance = options.openingBalance;
    const transactionsWithBalance = options.transactions.map(tx => {
      const amount = parseFloat(tx.amount);
      const isCredit = tx.type === 'CREDIT';
      runningBalance += isCredit ? amount : -amount;
      return [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.description.length > 50 ? tx.description.substring(0, 50) + '...' : tx.description,
        isCredit ? '' : `$${amount.toLocaleString()}`,
        isCredit ? `$${amount.toLocaleString()}` : '',
        `$${runningBalance.toLocaleString()}`
      ];
    });
    
    autoTable(doc, {
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: transactionsWithBalance,
      startY: 150,
      styles: {
        fontSize: 7,
        cellPadding: 2
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
        0: { cellWidth: 25 },
        1: { cellWidth: 80 },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 30, halign: 'right' }
      },
      margin: { left: 14, right: 14 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    const credits = options.transactions
      .filter(tx => tx.type === 'CREDIT')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const debits = options.transactions
      .filter(tx => tx.type === 'DEBIT')
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
    
    const closingBalance = options.openingBalance + credits - debits;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary:', 14, finalY);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Balance Carried Forward: $${options.openingBalance.toLocaleString()}`, 14, finalY + 8);
    doc.text(`Total Credits: $${credits.toLocaleString()}`, 14, finalY + 12);
    doc.text(`Total Debits: $${debits.toLocaleString()}`, 14, finalY + 16);
    doc.text(`Total Balance: $${closingBalance.toLocaleString()}`, 14, finalY + 20);
    
    doc.setFontSize(7);
    doc.text(`Statement generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, finalY + 35);
    doc.text(`Document ID: STMT-${options.account.accountNumber}-${Date.now()}`, 14, finalY + 39);
    doc.text('', 14, finalY + 43);
    doc.text('This is a digitally generated bank statement provided by Global Dot Bank, a project under Dot Protocol Co., Ltd.', 14, finalY + 47);
    doc.text('All information herein is accurate as of the time of generation. Protected under applicable international', 14, finalY + 51);
    doc.text('financial compliance standards. For any queries, please contact our support team.', 14, finalY + 55);
    
    return doc.output('blob');
  }

  static async exportAccountDetailsToPDF(accountDetails: any): Promise<Blob> {
    const doc = new jsPDF('landscape');
    
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
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('2261 Market St, San Francisco, CA 94140', 14, 30);
    doc.text('Website: https://globaldotbank.org', 14, 35);
    doc.text('Email: bankingsupport@globaldotbank.org', 14, 40);
    doc.text('Phone: +1 650 338 8168 - America', 14, 45);
    doc.text('WhatsApp: +66 966 92 1260 - Asia', 14, 50);
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT DETAILS REPORT', 14, 65);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Information:', 14, 80);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Account Number: ${accountDetails.accountNumber}`, 14, 88);
    doc.text(`Account Type: ${accountDetails.accountType}`, 14, 92);
    doc.text(`Current Balance: $${accountDetails.balance.toLocaleString()}`, 14, 96);
    doc.text(`Currency: ${accountDetails.currency}`, 14, 100);
    doc.text(`Status: ${accountDetails.isActive ? 'Active' : 'Inactive'}`, 14, 104);
    doc.text(`Created: ${new Date(accountDetails.createdAt).toLocaleDateString()}`, 14, 108);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Account Statistics:', 14, 125);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Transactions: ${accountDetails.statistics?.totalTransactions || 0}`, 14, 133);
    doc.text(`Total Credits: $${(accountDetails.statistics?.totalCredits || 0).toLocaleString()}`, 14, 137);
    doc.text(`Total Debits: $${(accountDetails.statistics?.totalDebits || 0).toLocaleString()}`, 14, 141);
    doc.text(`Average Transaction: $${(accountDetails.statistics?.averageTransactionAmount || 0).toLocaleString()}`, 14, 145);
    
    const transactions = accountDetails.transactions || [];
    const transactionData = transactions.map((tx: any) => [
      new Date(tx.createdAt).toLocaleDateString(),
      new Date(tx.createdAt).toLocaleTimeString(),
      tx.description.length > 40 ? tx.description.substring(0, 40) + '...' : tx.description,
      tx.type,
      `$${parseFloat(tx.amount).toLocaleString()}`,
      tx.status,
      tx.reference || '-'
    ]);
    
    autoTable(doc, {
      head: [['Date', 'Time', 'Description', 'Type', 'Amount', 'Status', 'Reference']],
      body: transactionData,
      startY: 155,
      styles: {
        fontSize: 7,
        cellPadding: 2
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
        0: { cellWidth: 20 },
        1: { cellWidth: 18 },
        2: { cellWidth: 50 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20, halign: 'right' },
        5: { cellWidth: 15 },
        6: { cellWidth: 25 }
      },
      margin: { left: 14, right: 14 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(7);
    doc.text(`Report generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 14, finalY);
    doc.text(`Document ID: ACC-${accountDetails.accountNumber}-${Date.now()}`, 14, finalY + 4);
    doc.text('', 14, finalY + 8);
    doc.text('This is a digitally generated account details report provided by Global Dot Bank, a project under Dot Protocol Co., Ltd.', 14, finalY + 12);
    doc.text('All information herein is accurate as of the time of generation. Protected under applicable international', 14, finalY + 16);
    doc.text('financial compliance standards. For any queries, please contact our support team.', 14, finalY + 20);
    
    return doc.output('blob');
  }

  static async exportFixedDepositCertificateToPDF(certificate: any): Promise<Blob> {
    const doc = new jsPDF();
    
    const logoData = await ExportManager.loadLogo();
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 14, 10, 20, 20);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      } catch (error) {
        console.log('Error adding logo image:', error);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('🏦', 14, 20);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('Global Dot Bank', 40, 20);
      }
    } else {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('🏦', 14, 20);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Global Dot Bank', 40, 20);
    }
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('2261 Market St, San Francisco, CA 94140', 14, 30);
    doc.text('Website: https://globaldotbank.org', 14, 35);
    doc.text('Email: bankingsupport@globaldotbank.org', 14, 40);
    doc.text('Phone: +1 650 338 8168 - America', 14, 45);
    doc.text('WhatsApp: +66 966 92 1260 - Asia', 14, 50);
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FIXED DEPOSIT CERTIFICATE', 14, 65);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Certificate Number: ${certificate.certificateNumber}`, 14, 80);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 14, 95);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${certificate.customerName}`, 14, 103);
    doc.text(`Email: ${certificate.customerEmail}`, 14, 107);
    doc.text(`Account Number: ${certificate.accountNumber}`, 14, 111);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Deposit Details:', 14, 125);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Amount: $${certificate.depositAmount.toLocaleString()}`, 14, 133);
    doc.text(`Interest Rate: ${certificate.interestRate}% p.a.`, 14, 137);
    doc.text(`Duration: ${certificate.duration} months`, 14, 141);
    doc.text(`Start Date: ${new Date(certificate.startDate).toLocaleDateString()}`, 14, 145);
    doc.text(`Maturity Date: ${new Date(certificate.maturityDate).toLocaleDateString()}`, 14, 149);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Interest Calculation:', 14, 163);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Interest Earned: $${certificate.interestEarned}`, 14, 171);
    doc.text(`Maturity Amount: $${certificate.maturityAmount}`, 14, 175);
    doc.text(`Status: ${certificate.status}`, 14, 179);
    doc.text(`Matured: ${certificate.isMatured ? 'Yes' : 'No'}`, 14, 183);
    
    const progress = certificate.daysElapsed / certificate.totalDays;
    const barWidth = 150;
    const barHeight = 8;
    const barX = 14;
    const barY = 195;
    
    doc.setFillColor(240, 240, 240);
    doc.rect(barX, barY, barWidth, barHeight, 'F');
    
    doc.setFillColor(41, 128, 185);
    doc.rect(barX, barY, barWidth * progress, barHeight, 'F');
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Progress: ${Math.round(progress * 100)}% (${certificate.daysElapsed} of ${certificate.totalDays} days)`, 14, barY + 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms and Conditions:', 14, barY + 30);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    certificate.terms.forEach((term: string, index: number) => {
      doc.text(`${index + 1}. ${term}`, 14, barY + 38 + (index * 4));
    });
    
    const finalY = barY + 38 + (certificate.terms.length * 4) + 20;
    doc.setFontSize(8);
    doc.text(`Certificate generated on: ${new Date(certificate.generatedAt).toLocaleDateString()} at ${new Date(certificate.generatedAt).toLocaleTimeString()}`, 14, finalY);
    doc.text(`Document ID: FD-${certificate.certificateNumber}`, 14, finalY + 4);
    doc.text('', 14, finalY + 8);
    doc.text('This is a digitally generated fixed deposit certificate provided by Global Dot Bank, a project under', 14, finalY + 12);
    doc.text('Dot Protocol Co., Ltd. All information herein is accurate as of the time of generation. Protected', 14, finalY + 16);
    doc.text('under applicable international financial compliance standards.', 14, finalY + 20);
    
    return doc.output('blob');
  }
  
  static exportToCSV(options: ExportOptions): Blob {
    const csvContent = [
      options.headers.join(','),
      ...options.data.map(item => 
        options.fields.map(field => {
          const value = item[field] || '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
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
    headers: ['Date', 'Type', 'Amount', 'Description', 'Status', 'Reference'],
    fields: ['createdAt', 'type', 'amount', 'description', 'status', 'reference']
  },
  
  fixedDeposits: {
    title: 'Fixed Deposits Report',
    headers: ['Amount', 'Interest Rate', 'Duration', 'Maturity Date', 'Status', 'Interest Earned'],
    fields: ['amount', 'interestRate', 'duration', 'maturityDate', 'status', 'interestEarned']
  },
  
  cards: {
    title: 'Card Management Report',
    headers: ['Card Number', 'Type', 'Expiry Date', 'Daily Limit', 'Monthly Limit', 'Status'],
    fields: ['cardNumber', 'cardType', 'expiryDate', 'dailyLimit', 'monthlyLimit', 'isActive']
  },
  
  eChecks: {
    title: 'E-Checks Report',
    headers: ['Check Number', 'Payee', 'Amount', 'Memo', 'Status', 'Created Date'],
    fields: ['checkNumber', 'payeeName', 'amount', 'memo', 'status', 'createdAt']
  },
  
  kycDocuments: {
    title: 'KYC Documents Report',
    headers: ['Document Type', 'Status', 'Uploaded Date', 'Verified Date'],
    fields: ['documentType', 'status', 'uploadedAt', 'verifiedAt']
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

export async function exportAccountDetails(accountDetails: any, format: 'pdf' | 'csv') {
  if (format === 'pdf') {
    const blob = await ExportManager.exportAccountDetailsToPDF(accountDetails);
    const filename = `account-details-${accountDetails.accountNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    ExportManager.downloadFile(blob, filename);
  } else {
    const csvContent = [
      'Account Number,Account Type,Balance,Currency,Status,Created Date,Total Transactions,Total Credits,Total Debits,Average Transaction',
      `${accountDetails.accountNumber},${accountDetails.accountType},${accountDetails.balance},${accountDetails.currency},${accountDetails.isActive ? 'Active' : 'Inactive'},${new Date(accountDetails.createdAt).toLocaleDateString()},${accountDetails.statistics?.totalTransactions || 0},${accountDetails.statistics?.totalCredits || 0},${accountDetails.statistics?.totalDebits || 0},${accountDetails.statistics?.averageTransactionAmount || 0}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const filename = `account-details-${accountDetails.accountNumber}-${new Date().toISOString().split('T')[0]}.csv`;
    ExportManager.downloadFile(blob, filename);
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

export async function exportFixedDepositCertificate(certificate: any, format: 'pdf' | 'csv') {
  if (format === 'pdf') {
    const blob = await ExportManager.exportFixedDepositCertificateToPDF(certificate);
    const filename = `fixed-deposit-certificate-${certificate.certificateNumber}-${new Date().toISOString().split('T')[0]}.pdf`;
    ExportManager.downloadFile(blob, filename);
  } else {
    const csvContent = [
      'Certificate Number,Name,Email,Account Number,Amount,Interest Rate,Duration,Start Date,Maturity Date,Interest Earned,Maturity Amount,Status',
      `${certificate.certificateNumber},${certificate.customerName},${certificate.customerEmail},${certificate.accountNumber},${certificate.depositAmount},${certificate.interestRate},${certificate.duration},${new Date(certificate.startDate).toLocaleDateString()},${new Date(certificate.maturityDate).toLocaleDateString()},${certificate.interestEarned},${certificate.maturityAmount},${certificate.status}`
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const filename = `fixed-deposit-certificate-${certificate.certificateNumber}-${new Date().toISOString().split('T')[0]}.csv`;
    ExportManager.downloadFile(blob, filename);
  }
}

export async function exportCards(cards: any[], format: 'pdf' | 'csv') {
  const options: ExportOptions = {
    format,
    data: cards,
    filename: `cards-${new Date().toISOString().split('T')[0]}.${format}`,
    ...exportTemplates.cards
  };
  
  const blob = format === 'pdf' 
    ? await ExportManager.exportToPDF(options)
    : ExportManager.exportToCSV(options);
    
  ExportManager.downloadFile(blob, options.filename);
}

export async function exportEChecks(checks: any[], format: 'pdf' | 'csv') {
  const options: ExportOptions = {
    format,
    data: checks,
    filename: `e-checks-${new Date().toISOString().split('T')[0]}.${format}`,
    ...exportTemplates.eChecks
  };
  
  const blob = format === 'pdf' 
    ? await ExportManager.exportToPDF(options)
    : ExportManager.exportToCSV(options);
    
  ExportManager.downloadFile(blob, options.filename);
}
