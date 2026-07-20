import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { SettlementStatus, SettlementType, Prisma } from '@prisma/client';

const DEFAULT_LEDGER_ACCOUNTS = [
  { code: '1100', name: 'Settlement Suspense', type: 'ASSET' as const },
  { code: '2100', name: 'Customer Deposits', type: 'LIABILITY' as const },
  { code: '2200', name: 'Nostro Payable', type: 'LIABILITY' as const },
  { code: '4100', name: 'Fee Income', type: 'REVENUE' as const },
  { code: '5100', name: 'Operating Expenses', type: 'EXPENSE' as const },
];

export async function ensureLedgerAccounts(): Promise<void> {
  for (const acct of DEFAULT_LEDGER_ACCOUNTS) {
    await prisma.ledgerAccount.upsert({
      where: { code: acct.code },
      create: {
        code: acct.code,
        name: acct.name,
        type: acct.type,
        currency: 'USD',
      },
      update: {},
    });
  }
}

interface LedgerLine {
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
}

interface RecordSettlementInput {
  type: SettlementType;
  amount: number;
  currency?: string;
  transactionId?: string;
  reference: string;
  externalRef?: string;
  status?: SettlementStatus;
  lines: LedgerLine[];
  createdBy: string;
  metadata?: Record<string, unknown>;
}

export async function recordSettlement(input: RecordSettlementInput) {
  await ensureLedgerAccounts();

  const totalDebit = input.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = input.lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(
      `Ledger entries must balance (debit ${totalDebit} != credit ${totalCredit})`
    );
  }

  const journalId = randomUUID();
  const status = input.status ?? 'SETTLED';

  return prisma.$transaction(async (tx) => {
    const settlement = await tx.settlementRecord.create({
      data: {
        transactionId: input.transactionId ?? null,
        reference: input.reference,
        type: input.type,
        status,
        amount: input.amount,
        currency: input.currency ?? 'USD',
        settledAt: status === 'SETTLED' ? new Date() : null,
        externalRef: input.externalRef ?? null,
        metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
      },
    });

    for (const line of input.lines) {
      const account = await tx.ledgerAccount.findUnique({
        where: { code: line.accountCode },
      });
      if (!account) {
        throw new Error(`Ledger account ${line.accountCode} not found`);
      }

      await tx.ledgerEntry.create({
        data: {
          journalId,
          ledgerAccountId: account.id,
          debit: line.debit,
          credit: line.credit,
          currency: input.currency ?? 'USD',
          description: line.description,
          transactionId: input.transactionId ?? null,
          settlementId: settlement.id,
          createdBy: input.createdBy,
        },
      });

      const netChange = line.debit - line.credit;
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        await tx.ledgerAccount.update({
          where: { id: account.id },
          data: { balance: { increment: netChange } },
        });
      } else {
        await tx.ledgerAccount.update({
          where: { id: account.id },
          data: { balance: { increment: line.credit - line.debit } },
        });
      }
    }

    return settlement;
  });
}

/** Internal transfer: DR customer deposits (source), CR customer deposits (dest) */
export async function settleInternalTransfer(params: {
  amount: number;
  currency?: string;
  transactionId: string;
  reference: string;
  sourceAccountNumber: string;
  destAccountNumber: string;
  createdBy: string;
}) {
  return recordSettlement({
    type: 'INTERNAL',
    amount: params.amount,
    currency: params.currency,
    transactionId: params.transactionId,
    reference: params.reference,
    status: 'SETTLED',
    createdBy: params.createdBy,
    metadata: {
      sourceAccountNumber: params.sourceAccountNumber,
      destAccountNumber: params.destAccountNumber,
    },
    lines: [
      {
        accountCode: '2100',
        debit: params.amount,
        credit: 0,
        description: `Internal transfer out ${params.sourceAccountNumber}`,
      },
      {
        accountCode: '2100',
        debit: 0,
        credit: params.amount,
        description: `Internal transfer in ${params.destAccountNumber}`,
      },
    ],
  });
}

/** International outbound: DR customer deposits, CR nostro payable (+ fee to revenue) */
export async function settleInternationalOutbound(params: {
  amount: number;
  fee: number;
  currency?: string;
  transactionId: string;
  reference: string;
  utr: string;
  createdBy: string;
}) {
  const total = params.amount + params.fee;
  const lines: LedgerLine[] = [
    {
      accountCode: '2100',
      debit: total,
      credit: 0,
      description: `Intl outbound ${params.reference}`,
    },
    {
      accountCode: '2200',
      debit: 0,
      credit: params.amount,
      description: `Nostro payable UTR ${params.utr}`,
    },
  ];
  if (params.fee > 0) {
    lines.push({
      accountCode: '4100',
      debit: 0,
      credit: params.fee,
      description: `Transfer fee ${params.reference}`,
    });
  }

  return recordSettlement({
    type: 'INTERNATIONAL',
    amount: total,
    currency: params.currency,
    transactionId: params.transactionId,
    reference: params.reference,
    externalRef: params.utr,
    status: 'PENDING',
    createdBy: params.createdBy,
    lines,
  });
}

export async function markSettlementSettled(settlementId: string, externalRef?: string) {
  return prisma.settlementRecord.update({
    where: { id: settlementId },
    data: {
      status: 'SETTLED',
      settledAt: new Date(),
      externalRef: externalRef ?? undefined,
    },
  });
}

export async function getSettlementSummary() {
  const [pending, settled, failed] = await Promise.all([
    prisma.settlementRecord.count({ where: { status: 'PENDING' } }),
    prisma.settlementRecord.count({ where: { status: 'SETTLED' } }),
    prisma.settlementRecord.count({ where: { status: 'FAILED' } }),
  ]);
  return { pending, settled, failed };
}
