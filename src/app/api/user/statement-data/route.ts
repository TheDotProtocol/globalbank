import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { resolveBankCodes } from '@/lib/bank-branding';

function parseDays(searchParams: URLSearchParams): number {
  const days = parseInt(searchParams.get('days') || '365', 10);
  return Number.isFinite(days) && days > 0 ? days : 365;
}

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const days = parseDays(searchParams);
    const accountId = searchParams.get('accountId');

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const userRecord = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        branchId: true,
      },
    });

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const branch = userRecord.branchId
      ? await prisma.branch.findUnique({
          where: { id: userRecord.branchId },
          select: { name: true, city: true, country: true, address: true },
        })
      : null;

    const account = await prisma.account.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        ...(accountId ? { id: accountId } : {}),
      },
      orderBy: { createdAt: 'asc' },
    });

    if (!account) {
      return NextResponse.json({ error: 'No active account found' }, { status: 404 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        accountId: account.id,
        createdAt: { gte: startDate, lte: endDate },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        status: true,
        createdAt: true,
        reference: true,
        utr: true,
      },
    });

    const [loans, loanApplications] = await Promise.all([
      prisma.loan.findMany({
        where: { userId: user.id },
        include: { product: { select: { name: true, jurisdiction: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.loanApplication.findMany({
        where: { userId: user.id },
        include: { product: { select: { name: true, jurisdiction: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    const isCredit = (type: string, description: string) =>
      type === 'CREDIT' || type === 'DEPOSIT' || description.toLowerCase().includes('interest');

    const credits = transactions
      .filter((tx) => isCredit(tx.type, tx.description))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const debits = transactions
      .filter((tx) => !isCredit(tx.type, tx.description))
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    const currentBalance = Number(account.balance);
    const openingBalance = Math.max(0, currentBalance - credits + debits);
    const closingBalance = openingBalance + credits - debits;

    const bankCodes = resolveBankCodes(branch?.country);

    return NextResponse.json({
      success: true,
      customer: {
        name: `${userRecord.firstName} ${userRecord.lastName}`,
        email: userRecord.email,
        branch: branch
          ? `${branch.name}, ${branch.city}, ${branch.country}`
          : 'Global Dot Bank — Digital Branch',
        branchDetails: branch,
      },
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountType: account.accountType,
        currency: account.currency,
        balance: currentBalance,
      },
      ifsc: bankCodes.ifsc,
      swift: bankCodes.swift,
      period: {
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        days,
      },
      balances: {
        opening: openingBalance,
        closing: closingBalance,
        totalCredits: credits,
        totalDebits: debits,
      },
      loans: loans.map((loan) => ({
        reference: loan.reference,
        product: loan.product.name,
        jurisdiction: loan.product.jurisdiction,
        principal: Number(loan.principal),
        outstanding: Number(loan.outstanding),
        apr: Number(loan.apr),
        termMonths: loan.termMonths,
        status: loan.status,
        disbursedAt: loan.disbursedAt,
        maturityDate: loan.maturityDate,
      })),
      loanApplications: loanApplications.map((app) => ({
        reference: app.reference,
        product: app.product.name,
        jurisdiction: app.product.jurisdiction,
        requestedAmount: Number(app.requestedAmount),
        termMonths: app.termMonths,
        status: app.status,
        submittedAt: app.submittedAt,
        purpose: app.purpose,
      })),
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: Number(tx.amount),
        accountNumber: account.accountNumber,
      })),
    });
  } catch (error) {
    console.error('Statement data error:', error);
    return NextResponse.json({ error: 'Failed to load statement data' }, { status: 500 });
  }
});
