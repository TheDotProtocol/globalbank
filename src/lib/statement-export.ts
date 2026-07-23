import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BANK_BRANDING } from '@/lib/bank-branding';

export interface StatementData {
  customer: {
    name: string;
    email: string;
    branch: string;
  };
  account: {
    accountNumber: string;
    accountType: string;
    currency: string;
  };
  ifsc: string;
  swift: string;
  period: { from: string; to: string };
  balances: {
    opening: number;
    closing: number;
    totalCredits: number;
    totalDebits: number;
  };
  loans: Array<{
    reference: string;
    product: string;
    jurisdiction: string;
    principal: number;
    outstanding: number;
    apr: number;
    termMonths: number;
    status: string;
  }>;
  loanApplications: Array<{
    reference: string;
    product: string;
    requestedAmount: number;
    termMonths: number;
    status: string;
    purpose?: string | null;
  }>;
  transactions: Array<{
    createdAt: string;
    type: string;
    description: string;
    amount: number;
    status: string;
    accountNumber: string;
    reference?: string | null;
    utr?: string | null;
  }>;
}

function csvCell(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatMoney(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

async function loadLogo(): Promise<string | null> {
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

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportStatementToCSV(data: StatementData): void {
  const lines: string[] = [];
  const currency = data.account.currency || 'USD';

  lines.push(`${BANK_BRANDING.shortName} - Account Statement`);
  lines.push('');
  lines.push(['Field', 'Value'].join(','));
  lines.push(['Customer Name', csvCell(data.customer.name)].join(','));
  lines.push(['Email', csvCell(data.customer.email)].join(','));
  lines.push(['Branch', csvCell(data.customer.branch)].join(','));
  lines.push(['Account Number', csvCell(data.account.accountNumber)].join(','));
  lines.push(['Account Type', csvCell(data.account.accountType)].join(','));
  lines.push(['IFSC Code', csvCell(data.ifsc)].join(','));
  lines.push(['SWIFT Code', csvCell(data.swift)].join(','));
  lines.push(['Date From', csvCell(formatDate(data.period.from))].join(','));
  lines.push(['Date To', csvCell(formatDate(data.period.to))].join(','));
  lines.push('');

  lines.push('Loans');
  if (data.loans.length === 0) {
    lines.push('No active loans');
  } else {
    lines.push(
      ['Reference', 'Product', 'Jurisdiction', 'Principal', 'Outstanding', 'APR (%)', 'Term (Months)', 'Status'].join(',')
    );
    data.loans.forEach((loan) => {
      lines.push(
        [
          csvCell(loan.reference),
          csvCell(loan.product),
          csvCell(loan.jurisdiction),
          loan.principal,
          loan.outstanding,
          loan.apr,
          loan.termMonths,
          csvCell(loan.status),
        ].join(',')
      );
    });
  }
  lines.push('');

  if (data.loanApplications.length > 0) {
    lines.push('Loan Applications');
    lines.push(['Reference', 'Product', 'Requested Amount', 'Term (Months)', 'Status', 'Purpose'].join(','));
    data.loanApplications.forEach((app) => {
      lines.push(
        [
          csvCell(app.reference),
          csvCell(app.product),
          app.requestedAmount,
          app.termMonths,
          csvCell(app.status),
          csvCell(app.purpose || ''),
        ].join(',')
      );
    });
    lines.push('');
  }

  lines.push('Transactions');
  lines.push(['Date', 'Type', 'Description', 'Amount', 'Status', 'Account', 'Reference', 'UTR'].join(','));
  data.transactions.forEach((tx) => {
    lines.push(
      [
        csvCell(formatDate(tx.createdAt)),
        csvCell(tx.type),
        csvCell(tx.description),
        tx.amount,
        csvCell(tx.status),
        csvCell(tx.accountNumber),
        csvCell(tx.reference || ''),
        csvCell(tx.utr || ''),
      ].join(',')
    );
  });
  lines.push('');

  lines.push(['Opening Balance', formatMoney(data.balances.opening, currency)].join(','));
  lines.push(['Closing Balance', formatMoney(data.balances.closing, currency)].join(','));
  lines.push('');
  lines.push(`Generated by ${BANK_BRANDING.legalName} on ${new Date().toLocaleString()}`);

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `statement-${data.account.accountNumber}-${new Date().toISOString().split('T')[0]}.csv`);
}

export async function exportStatementToPDF(data: StatementData): Promise<void> {
  const doc = new jsPDF('portrait');
  const pageWidth = doc.internal.pageSize.getWidth();
  const [r, g, b] = BANK_BRANDING.primaryColor;
  const currency = data.account.currency || 'USD';

  const logoData = await loadLogo();

  doc.setFillColor(r, g, b);
  doc.rect(0, 0, pageWidth, 42, 'F');

  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 14, 8, 22, 22);
    } catch {
      // skip
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(BANK_BRANDING.shortName, logoData ? 40 : 14, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_BRANDING.tagline, logoData ? 40 : 14, 26);
  doc.text(BANK_BRANDING.legalName, logoData ? 40 : 14, 33);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ACCOUNT STATEMENT', pageWidth - 14, 20, { align: 'right' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Document ID: STMT-${data.account.accountNumber}-${Date.now()}`, pageWidth - 14, 28, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  let y = 52;

  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, pageWidth - 28, 38, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 18, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.customer.name}`, 18, y + 16);
  doc.text(`Email: ${data.customer.email}`, 18, y + 22);
  doc.text(`Branch: ${data.customer.branch}`, 18, y + 28);
  doc.text(`Account: ${data.account.accountNumber} (${data.account.accountType})`, 18, y + 34);

  doc.text(`IFSC: ${data.ifsc}`, pageWidth / 2 + 4, y + 16);
  doc.text(`SWIFT: ${data.swift}`, pageWidth / 2 + 4, y + 22);
  doc.text(`Period: ${formatDate(data.period.from)} — ${formatDate(data.period.to)}`, pageWidth / 2 + 4, y + 28);
  doc.text(`Currency: ${currency}`, pageWidth / 2 + 4, y + 34);

  y += 48;

  if (data.loans.length > 0 || data.loanApplications.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(r, g, b);
    doc.text('Loans', 14, y);
    y += 4;

    if (data.loans.length > 0) {
      autoTable(doc, {
        head: [['Reference', 'Product', 'Principal', 'Outstanding', 'APR', 'Term', 'Status']],
        body: data.loans.map((loan) => [
          loan.reference,
          loan.product,
          formatMoney(loan.principal, currency),
          formatMoney(loan.outstanding, currency),
          `${loan.apr}%`,
          `${loan.termMonths} mo`,
          loan.status,
        ]),
        startY: y + 2,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: BANK_BRANDING.primaryColor, textColor: 255 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }

    if (data.loanApplications.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Loan Applications', 14, y);
      autoTable(doc, {
        head: [['Reference', 'Product', 'Amount', 'Term', 'Status', 'Purpose']],
        body: data.loanApplications.map((app) => [
          app.reference,
          app.product,
          formatMoney(app.requestedAmount, currency),
          `${app.termMonths} mo`,
          app.status,
          app.purpose || '—',
        ]),
        startY: y + 4,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [100, 116, 139], textColor: 255 },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(r, g, b);
  doc.text('Transaction History', 14, y);
  y += 4;

  autoTable(doc, {
    head: [['Date', 'Type', 'Description', 'Amount', 'Status', 'Account', 'Reference']],
    body: data.transactions.map((tx) => [
      formatDate(tx.createdAt),
      tx.type,
      tx.description.length > 35 ? `${tx.description.slice(0, 35)}…` : tx.description,
      formatMoney(tx.amount, currency),
      tx.status,
      tx.accountNumber,
      tx.reference || tx.utr || '—',
    ]),
    startY: y + 2,
    styles: { fontSize: 7, cellPadding: 2.5 },
    headStyles: { fillColor: BANK_BRANDING.primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 18 },
      2: { cellWidth: 48 },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 20 },
      5: { cellWidth: 26 },
      6: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  });

  const tableEndY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFillColor(r, g, b);
  doc.roundedRect(14, tableEndY, pageWidth - 28, 28, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Opening Balance: ${formatMoney(data.balances.opening, currency)}`, 20, tableEndY + 10);
  doc.text(`Total Credits: ${formatMoney(data.balances.totalCredits, currency)}`, 20, tableEndY + 18);
  doc.text(`Total Debits: ${formatMoney(data.balances.totalDebits, currency)}`, pageWidth / 2, tableEndY + 10);
  doc.setFontSize(12);
  doc.text(`Closing Balance: ${formatMoney(data.balances.closing, currency)}`, pageWidth / 2, tableEndY + 20);

  const footerY = tableEndY + 38;
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(BANK_BRANDING.legalName, 14, footerY);
  doc.text(BANK_BRANDING.address, 14, footerY + 5);
  doc.text(`${BANK_BRANDING.websiteDisplay} | ${BANK_BRANDING.email} | ${BANK_BRANDING.phone}`, 14, footerY + 10);
  doc.text('This is a system-generated bank statement. No signature required.', 14, footerY + 16);
  doc.text(`Generated on ${new Date().toLocaleString()}`, 14, footerY + 22);

  downloadBlob(
    doc.output('blob'),
    `statement-${data.account.accountNumber}-${new Date().toISOString().split('T')[0]}.pdf`
  );
}

export async function fetchAndExportStatement(
  token: string,
  format: 'pdf' | 'csv',
  days = 365
): Promise<void> {
  const response = await fetch(`/api/user/statement-data?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch statement data');
  }

  const payload = await response.json();
  const statementData: StatementData = {
    customer: payload.customer,
    account: payload.account,
    ifsc: payload.ifsc,
    swift: payload.swift,
    period: payload.period,
    balances: payload.balances,
    loans: payload.loans,
    loanApplications: payload.loanApplications,
    transactions: payload.transactions,
  };

  if (format === 'csv') {
    exportStatementToCSV(statementData);
  } else {
    await exportStatementToPDF(statementData);
  }
}
