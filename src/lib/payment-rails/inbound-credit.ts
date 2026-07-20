import { prisma } from '@/lib/prisma';
import { corporateBankService } from '@/lib/corporate-bank-service';
import { getDemoAutoCompleteMs, isDemoPaymentRail } from '@/lib/payment-rails/config';
import { recordSettlement } from '@/lib/regulatory/settlement-ledger';
import type { PaymentMethod } from '@prisma/client';

export type InboundCorridor = 'TH' | 'IN';

interface DemoCompleteResult {
  completed: boolean;
  expired?: boolean;
  transactionId?: string;
  message?: string;
}

export async function creditInboundPayment(params: {
  corridor: InboundCorridor;
  userId: string;
  accountId: string;
  amount: number;
  description: string;
  reference: string;
}): Promise<{ id: string }> {
  if (params.corridor === 'TH') {
    return corporateBankService.processCreditTransaction(
      params.userId,
      params.accountId,
      params.amount,
      params.description,
      params.reference
    );
  }

  const bank = await prisma.corporateBank.findFirst({
    where: { currency: 'INR', isActive: true },
  });

  if (!bank) {
    if (!isDemoPaymentRail()) {
      throw new Error('India corporate collection account not configured. Run admin setup or set INDIA_* env vars.');
    }
    return createDirectInboundCredit(params, 'INR', 'India UPI (demo — bank account pending)');
  }

  const bankTransfer = await prisma.bankTransfer.create({
    data: {
      corporateBankId: bank.id,
      fromAccountId: null,
      toAccountNumber: await getAccountNumber(params.accountId),
      toAccountName: await getAccountHolderName(params.accountId),
      amount: params.amount,
      currency: 'INR',
      transferType: 'INBOUND',
      status: 'COMPLETED',
      reference: params.reference,
      description: params.description,
      fee: 0,
      netAmount: params.amount,
      processedAt: new Date(),
    },
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId: params.userId,
      accountId: params.accountId,
      type: 'CREDIT',
      amount: params.amount,
      description: `${params.description} (via ${bank.bankName})`,
      reference: params.reference,
      status: 'COMPLETED',
      transferMode: 'EXTERNAL_TRANSFER',
      sourceAccountNumber: bank.accountNumber,
      destinationAccountNumber: bankTransfer.toAccountNumber,
      sourceAccountHolder: bank.accountHolderName,
      destinationAccountHolder: bankTransfer.toAccountName,
      netAmount: params.amount,
    },
  });

  await prisma.account.update({
    where: { id: params.accountId },
    data: { balance: { increment: params.amount } },
  });

  try {
    await recordSettlement({
      type: 'EXTERNAL_IN',
      amount: params.amount,
      currency: 'INR',
      transactionId: transaction.id,
      reference: params.reference,
      status: 'SETTLED',
      createdBy: 'SYSTEM',
      externalRef: bankTransfer.reference,
      lines: [
        {
          accountCode: '1100',
          debit: params.amount,
          credit: 0,
          description: `India inbound ${params.reference}`,
        },
        {
          accountCode: '2100',
          debit: 0,
          credit: params.amount,
          description: `Customer credit ${params.reference}`,
        },
      ],
    });
  } catch {
    /* settlement optional until ledger seeded */
  }

  return transaction;
}

async function createDirectInboundCredit(
  params: {
    userId: string;
    accountId: string;
    amount: number;
    description: string;
    reference: string;
  },
  currency: string,
  viaLabel: string
) {
  const transaction = await prisma.transaction.create({
    data: {
      userId: params.userId,
      accountId: params.accountId,
      type: 'CREDIT',
      amount: params.amount,
      description: `${params.description} (${viaLabel})`,
      reference: params.reference,
      status: 'COMPLETED',
      transferMode: 'EXTERNAL_TRANSFER',
      netAmount: params.amount,
    },
  });

  await prisma.account.update({
    where: { id: params.accountId },
    data: { balance: { increment: params.amount } },
  });

  return transaction;
}

async function getAccountNumber(accountId: string): Promise<string> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { accountNumber: true },
  });
  return account?.accountNumber || 'Unknown';
}

async function getAccountHolderName(accountId: string): Promise<string> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  return account ? `${account.user.firstName} ${account.user.lastName}` : 'Unknown';
}

export async function tryDemoAutoCompleteInboundPayment(
  payment: {
    id: string;
    userId: string;
    accountId: string;
    amount: { toNumber: () => number };
    reference: string;
    description: string | null;
    createdAt: Date;
    status: string;
    paymentMethod: PaymentMethod;
  },
  corridor: InboundCorridor
): Promise<DemoCompleteResult> {
  if (payment.status !== 'PENDING') {
    return { completed: false, message: 'Payment not pending' };
  }

  const expiresAt = new Date(payment.createdAt.getTime() + 30 * 60 * 1000);
  if (new Date() > expiresAt) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'EXPIRED' },
    });
    return { completed: false, expired: true, message: 'Payment expired' };
  }

  if (!isDemoPaymentRail()) {
    return { completed: false, message: 'Awaiting bank confirmation (live mode)' };
  }

  const elapsed = Date.now() - payment.createdAt.getTime();
  if (elapsed < getDemoAutoCompleteMs()) {
    return {
      completed: false,
      message: `Demo: auto-completes after ${Math.round(getDemoAutoCompleteMs() / 60000)} minutes`,
    };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  const transaction = await creditInboundPayment({
    corridor,
    userId: payment.userId,
    accountId: payment.accountId,
    amount: payment.amount.toNumber(),
    description: payment.description || `${corridor} QR Payment - ${payment.reference}`,
    reference: payment.reference,
  });

  return {
    completed: true,
    transactionId: transaction.id,
    message: 'Payment completed (demo auto-complete)',
  };
}
