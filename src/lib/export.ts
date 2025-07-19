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

export class ExportManager {
  static async exportToPDF(options: ExportOptions): Promise<Blob> {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(options.title, 14, 22);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Add table
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

// Export templates
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

// Export functions
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