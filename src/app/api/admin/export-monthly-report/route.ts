import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { month, year } = await request.json();
    
    // Get all accounts with their balances and transactions
    const accounts = await prisma.account.findMany({
      where: {
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        transactions: {
          where: {
            createdAt: {
              gte: new Date(year, month - 1, 1),
              lt: new Date(year, month, 1)
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      },
      orderBy: {
        accountNumber: 'asc'
      }
    });

    // Create PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Global Dot Bank - Monthly Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Period: ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`, 20, 30);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 40);

    // Calculate totals
    let totalBalance = 0;
    let totalInterest = 0;
    let totalTransactions = 0;

    // Prepare table data
    const tableData = accounts.map(account => {
      const balance = parseFloat(account.balance.toString());
      const monthlyTransactions = account.transactions.length;
      const monthlyInterest = account.transactions
        .filter(tx => tx.description.includes('Interest'))
        .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0);

      totalBalance += balance;
      totalInterest += monthlyInterest;
      totalTransactions += monthlyTransactions;

      return [
        account.accountNumber,
        `$${balance.toLocaleString()}`,
        `$${monthlyInterest.toFixed(2)}`,
        monthlyTransactions.toString(),
        `$${(balance + monthlyInterest).toLocaleString()}`
      ];
    });

    // Add summary
    doc.setFontSize(14);
    doc.text('Summary', 20, 60);
    doc.setFontSize(10);
    doc.text(`Total Accounts: ${accounts.length}`, 20, 70);
    doc.text(`Total Balance: $${totalBalance.toLocaleString()}`, 20, 80);
    doc.text(`Total Interest Paid: $${totalInterest.toFixed(2)}`, 20, 90);
    doc.text(`Total Transactions: ${totalTransactions}`, 20, 100);

    // Add table
    (doc as any).autoTable({
      startY: 120,
      head: [['A/c Num', 'Balance', 'Interest', 'Transaction', 'Total Balance']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255
      },
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 30 }
      }
    });

    // Convert to base64
    const pdfBase64 = doc.output('datauristring');
    
    return NextResponse.json({
      success: true,
      pdfData: pdfBase64,
      message: 'Monthly report generated successfully'
    });

  } catch (error) {
    console.error('❌ Error generating monthly report:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate monthly report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}); 