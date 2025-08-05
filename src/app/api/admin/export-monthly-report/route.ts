import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

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
            OR: [
              // Regular transactions from the specified month
              {
                createdAt: {
                  gte: new Date(year, month - 1, 1),
                  lt: new Date(year, month, 1)
                }
              },
              // Interest transactions (regardless of date)
              {
                description: {
                  contains: 'Interest'
                }
              }
            ]
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

      return {
        accountNumber: account.accountNumber,
        balance: balance,
        interest: monthlyInterest,
        transactions: monthlyTransactions,
        totalBalance: balance + monthlyInterest,
        creditedOn: account.transactions
          .filter(tx => tx.description.includes('Interest'))
          .map(tx => new Date(tx.createdAt).toLocaleDateString())
          .join(', ') || 'N/A'
      };
    });

    // Create HTML for PDF generation
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Global Dot Bank - Monthly Interest Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .logo-container { margin-bottom: 15px; }
          .logo-image { max-width: 200px; max-height: 80px; }
          .logo-text { font-size: 24px; font-weight: bold; color: #1e40af; margin-bottom: 10px; }
          .title { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
          .subtitle { font-size: 14px; color: #666; margin-bottom: 20px; }
          .summary { background: #f8fafc; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .summary h3 { margin: 0 0 10px 0; color: #1e40af; }
          .summary p { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #1e40af; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-container">
            <img src="https://globaldotbank.org/logo.png" alt="Global Dot Bank Logo" class="logo-image">
          </div>
          <div class="logo-text">🏦 Global Dot Bank</div>
          <div class="title">Monthly Interest Calculation Report</div>
          <div class="subtitle">
            Period: ${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}<br>
            Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
          </div>
        </div>

        <div class="summary">
          <h3>📊 Summary</h3>
          <p><strong>Total Accounts:</strong> ${accounts.length}</p>
          <p><strong>Total Balance:</strong> $${totalBalance.toLocaleString()}</p>
          <p><strong>Total Interest Paid:</strong> $${totalInterest.toFixed(2)}</p>
          <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>A/c Num</th>
              <th>Balance</th>
              <th>Interest</th>
              <th>Credited On</th>
              <th>Total Balance</th>
            </tr>
          </thead>
          <tbody>
            ${tableData.map(row => `
              <tr>
                <td>${row.accountNumber}</td>
                <td>$${row.balance.toFixed(2)}</td>
                <td>$${row.interest.toFixed(2)}</td>
                <td>${row.creditedOn}</td>
                <td>$${row.totalBalance.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>🏦 Global Dot Bank - Professional Banking Services</p>
          <p>This report was generated automatically by the Global Dot Bank system.</p>
        </div>
      </body>
      </html>
    `;

    // Convert HTML to base64 for frontend
    const htmlBase64 = btoa(unescape(encodeURIComponent(htmlContent)));

    return NextResponse.json({
      success: true,
      htmlData: `data:text/html;base64,${htmlBase64}`,
      message: 'Monthly report generated successfully',
      summary: {
        totalAccounts: accounts.length,
        totalBalance: totalBalance,
        totalInterest: totalInterest,
        totalTransactions: totalTransactions
      }
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