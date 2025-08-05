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
        totalBalance: balance + monthlyInterest
      };
    });

    // Create CSV data instead of PDF for now
    const csvData = [
      ['A/c Num', 'Balance', 'Interest', 'Transaction', 'Total Balance'],
      ...tableData.map(row => [
        row.accountNumber,
        `$${row.balance.toLocaleString()}`,
        `$${row.interest.toFixed(2)}`,
        row.transactions.toString(),
        `$${row.totalBalance.toLocaleString()}`
      ])
    ].map(row => row.join(',')).join('\n');

    // Convert to base64
    const csvBase64 = btoa(csvData);
    
    return NextResponse.json({
      success: true,
      csvData: `data:text/csv;base64,${csvBase64}`,
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