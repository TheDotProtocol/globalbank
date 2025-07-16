import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// Get analytics data
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Get user's financial data
    const [
      accounts,
      transactions,
      fixedDeposits,
      cards
    ] = await Promise.all([
      prisma.account.findMany({
        where: { userId: user.id, isActive: true }
      }),
      prisma.transaction.findMany({
        where: { 
          userId: user.id,
          createdAt: { gte: daysAgo }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.fixedDeposit.findMany({
        where: { userId: user.id }
      }),
      prisma.card.findMany({
        where: { userId: user.id, isActive: true }
      })
    ]);

    // Calculate analytics
    const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);
    const totalFixedDeposits = fixedDeposits.reduce((sum, deposit) => sum + Number(deposit.amount), 0);
    
    const transactionStats = transactions.reduce((stats, transaction) => {
      if (transaction.type === 'CREDIT') {
        stats.income += Number(transaction.amount);
      } else {
        stats.expenses += Number(transaction.amount);
      }
      return stats;
    }, { income: 0, expenses: 0 });

    // Calculate interest earnings
    const now = new Date();
    const totalInterestEarned = fixedDeposits.reduce((total, deposit) => {
      if (deposit.status === 'ACTIVE') {
        const monthsElapsed = (now.getTime() - deposit.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        const interestEarned = Number(deposit.amount) * Number(deposit.interestRate) / 100 * monthsElapsed / 12;
        return total + interestEarned;
      }
      return total;
    }, 0);

    // Transaction trends
    const transactionTrends = transactions.reduce((trends, transaction) => {
      const date = transaction.createdAt.toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = { count: 0, amount: 0 };
      }
      trends[date].count++;
      trends[date].amount += Number(transaction.amount);
      return trends;
    }, {} as Record<string, { count: number; amount: number }>);

    return NextResponse.json({
      overview: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalFixedDeposits: Math.round(totalFixedDeposits * 100) / 100,
        totalInterestEarned: Math.round(totalInterestEarned * 100) / 100,
        activeCards: cards.length,
        totalAccounts: accounts.length
      },
      transactions: {
        total: transactions.length,
        income: Math.round(transactionStats.income * 100) / 100,
        expenses: Math.round(transactionStats.expenses * 100) / 100,
        netFlow: Math.round((transactionStats.income - transactionStats.expenses) * 100) / 100
      },
      trends: {
        transactionTrends,
        period: `${period} days`
      },
      fixedDeposits: {
        total: fixedDeposits.length,
        active: fixedDeposits.filter(d => d.status === 'ACTIVE').length,
        matured: fixedDeposits.filter(d => d.status === 'MATURED').length,
        totalValue: Math.round(totalFixedDeposits * 100) / 100
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 