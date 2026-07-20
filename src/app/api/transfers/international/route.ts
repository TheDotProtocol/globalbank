import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { generateInternationalReference, generateUTR } from '@/lib/reference-generator';
import { applyComplianceFlags } from '@/lib/compliance-detector';
import { preTransferComplianceCheck } from '@/lib/regulatory/compliance-guard';
import { settleInternationalOutbound } from '@/lib/regulatory/settlement-ledger';
import { auditUserAction } from '@/lib/regulatory/audit-log';

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.85,
  GBP: 0.73,
  INR: 74.5,
  JPY: 110,
  CAD: 1.25,
  AUD: 1.35,
};

function getExchangeRate(sourceCurrency: string, targetCurrency: string): number {
  if (sourceCurrency === targetCurrency) return 1;
  const toTarget = EXCHANGE_RATES[targetCurrency] || 1;
  const fromSource = EXCHANGE_RATES[sourceCurrency] || 1;
  if (sourceCurrency === 'USD') return toTarget;
  return toTarget / fromSource;
}

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();

    const {
      sourceAccountId,
      amount,
      currency = 'USD',
      targetCurrency = 'USD',
      description,
      beneficiary,
      markCompleted = false,
    } = body;

    if (!sourceAccountId || !amount || !beneficiary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const sourceAccount = await prisma.account.findFirst({
      where: { id: sourceAccountId, userId: user.id, isActive: true },
    });

    if (!sourceAccount) {
      return NextResponse.json({ error: 'Source account not found' }, { status: 404 });
    }

    const transferFee = amount * 0.02;
    const totalAmount = amount + transferFee;

    if (sourceAccount.balance.toNumber() < totalAmount) {
      return NextResponse.json(
        {
          error: 'Insufficient balance including international transfer fee',
          details: {
            requestedAmount: amount,
            transferFee,
            totalRequired: totalAmount,
            availableBalance: sourceAccount.balance.toNumber(),
          },
        },
        { status: 400 }
      );
    }

    const compliance = await preTransferComplianceCheck({
      userId: user.id,
      amount: Number(amount),
      type: 'DEBIT',
      transferMode: 'INTERNATIONAL_TRANSFER',
      destinationCountry: beneficiary.country,
      description,
    });

    if (compliance.blockTransfer) {
      await auditUserAction(request, user, 'INTL_TRANSFER_BLOCKED', 'Transaction', null, {
        reason: compliance.reason,
        amount,
        beneficiaryCountry: beneficiary.country,
      });
      return NextResponse.json(
        {
          error: 'International transfer blocked by compliance controls',
          code: 'COMPLIANCE_BLOCK',
          reason: compliance.reason,
        },
        { status: 403 }
      );
    }

    const transactionRef = generateInternationalReference();
    const utr = generateUTR();
    const exchangeRate = getExchangeRate(currency, targetCurrency);
    const convertedAmount = Math.round(amount * exchangeRate * 100) / 100;
    const transferStatus = markCompleted ? 'COMPLETED' : 'PENDING';
    const now = new Date();

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { branchId: true } });

    const result = await prisma.$transaction(async (tx) => {
      const updatedSourceAccount = await tx.account.update({
        where: { id: sourceAccountId },
        data: { balance: { decrement: totalAmount } },
      });

      const debitTransaction = await tx.transaction.create({
        data: {
          accountId: sourceAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount,
          description: `International transfer to ${beneficiary.name} - ${description || 'International Transfer'}`,
          reference: transactionRef,
          utr,
          status: markCompleted ? 'COMPLETED' : 'PENDING',
          transferMode: 'INTERNATIONAL_TRANSFER',
          sourceAccountId,
          sourceAccountNumber: sourceAccount.accountNumber,
          sourceAccountHolder: `${user.firstName} ${user.lastName}`,
          destinationAccountNumber: beneficiary.accountNumber,
          destinationAccountHolder: beneficiary.name,
          transferFee,
          netAmount: amount,
          branchId: dbUser?.branchId,
          complianceStatus: compliance.shouldFlag ? 'FLAGGED' : 'CLEAR',
          complianceFlag: compliance.shouldFlag ? (compliance.flag as any) : null,
          flagReason: compliance.reason ?? null,
          flaggedAt: compliance.shouldFlag ? new Date() : null,
          flaggedBy: compliance.shouldFlag ? 'SYSTEM' : null,
          riskScore: compliance.riskScore,
        },
      });

      await tx.transaction.create({
        data: {
          accountId: sourceAccountId,
          userId: user.id,
          type: 'DEBIT',
          amount: transferFee,
          description: `International transfer fee - UTR ${utr}`,
          reference: `${transactionRef}-FEE`,
          utr: `${utr}-FEE`,
          status: 'COMPLETED',
        },
      });

      const internationalTransfer = await tx.internationalTransfer.create({
        data: {
          userId: user.id,
          accountId: sourceAccountId,
          transactionId: debitTransaction.id,
          amount,
          currency,
          targetCurrency,
          exchangeRate,
          convertedAmount,
          transferFee,
          totalAmount,
          beneficiaryName: beneficiary.name,
          beneficiaryAddress: beneficiary.address,
          beneficiaryCity: beneficiary.city,
          beneficiaryCountry: beneficiary.country,
          bankName: beneficiary.bankName,
          bankAddress: beneficiary.bankAddress,
          swiftCode: beneficiary.swiftCode,
          accountNumber: beneficiary.accountNumber,
          routingNumber: beneficiary.routingNumber,
          description,
          reference: transactionRef,
          utr,
          status: transferStatus,
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          completedAt: markCompleted ? now : null,
        },
      });

      return { updatedSourceAccount, debitTransaction, internationalTransfer };
    });

    await applyComplianceFlags(result.debitTransaction.id);

    await settleInternationalOutbound({
      amount: Number(amount),
      fee: Number(transferFee),
      currency,
      transactionId: result.debitTransaction.id,
      reference: transactionRef,
      utr,
      createdBy: user.id,
    });

    await auditUserAction(request, user, 'INTERNATIONAL_TRANSFER', 'Transaction', result.debitTransaction.id, {
      amount,
      utr,
      beneficiaryCountry: beneficiary.country,
      complianceFlagged: compliance.shouldFlag,
    });

    const receiptData = {
      transactionId: result.debitTransaction.id,
      reference: transactionRef,
      utr,
      amount,
      currency,
      targetCurrency,
      exchangeRate,
      convertedAmount,
      transferFee,
      totalAmount,
      beneficiary,
      sourceAccount: {
        accountNumber: sourceAccount.accountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`,
      },
      timestamp: now.toISOString(),
      status: transferStatus,
      completedAt: markCompleted ? now.toISOString() : null,
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: markCompleted
        ? 'International transfer completed successfully'
        : 'International transfer initiated successfully',
      transaction: result.debitTransaction,
      internationalTransfer: result.internationalTransfer,
      receipt: receiptData,
    });
  } catch (error) {
    console.error('International transfer error:', error);
    return NextResponse.json(
      { error: 'Failed to process international transfer', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const [transfers, totalCount] = await Promise.all([
      prisma.internationalTransfer.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          account: { select: { accountNumber: true, accountType: true, currency: true } },
        },
      }),
      prisma.internationalTransfer.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      transfers,
      pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) },
    });
  } catch (error) {
    console.error('Get international transfers error:', error);
    return NextResponse.json({ error: 'Failed to fetch international transfers' }, { status: 500 });
  }
});
