import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { LedgerAccountType, Prisma, SettlementType } from '@prisma/client';

const CHART_OF_ACCOUNTS: Array<{
  code: string;
  name: string;
  type: LedgerAccountType;
}> = [
  { code: '1100', name: 'Settlement Suspense', type: 'ASSET' },
  { code: '1200', name: 'Loans Receivable', type: 'ASSET' },
  { code: '1210', name: 'Allowance for Loan Losses', type: 'ASSET' },
  { code: '2100', name: 'Customer Deposits Control', type: 'LIABILITY' },
  { code: '2200', name: 'Nostro Payable', type: 'LIABILITY' },
  { code: '2300', name: 'Safeguarded Customer Funds', type: 'LIABILITY' },
  { code: '4100', name: 'Fee Income', type: 'REVENUE' },
  { code: '4200', name: 'Interest Income', type: 'REVENUE' },
  { code: '5100', name: 'Interest Expense', type: 'EXPENSE' },
  { code: '5200', name: 'Loan Loss Provision', type: 'EXPENSE' },
];

export interface JournalLine {
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
}

export interface PostJournalInput {
  lines: JournalLine[];
  reference: string;
  transactionId?: string;
  createdBy: string;
  settlementType?: SettlementType;
  currency?: string;
  externalRef?: string;
  metadata?: Record<string, unknown>;
}

function subLedgerCodeForAccount(accountNumber: string): string {
  const suffix = accountNumber.replace(/\D/g, '').slice(-8) || accountNumber.slice(-8);
  return `2101-${suffix.padStart(8, '0')}`;
}

export async function ensureChartOfAccounts(): Promise<void> {
  for (const acct of CHART_OF_ACCOUNTS) {
    await prisma.ledgerAccount.upsert({
      where: { code: acct.code },
      create: { code: acct.code, name: acct.name, type: acct.type, currency: 'USD' },
      update: {},
    });
  }
}

export async function ensureCustomerSubLedger(accountId: string): Promise<string> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { id: true, accountNumber: true, subLedgerCode: true, currency: true },
  });
  if (!account) throw new Error('Account not found');

  const code = account.subLedgerCode || subLedgerCodeForAccount(account.accountNumber);
  const name = `Customer Deposits — ${account.accountNumber}`;

  await ensureChartOfAccounts();
  await prisma.ledgerAccount.upsert({
    where: { code },
    create: {
      code,
      name,
      type: 'LIABILITY',
      currency: account.currency,
    },
    update: { name },
  });

  if (!account.subLedgerCode) {
    await prisma.account.update({
      where: { id: accountId },
      data: { subLedgerCode: code },
    });
  }

  return code;
}

export async function postJournal(input: PostJournalInput) {
  await ensureChartOfAccounts();

  const totalDebit = input.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = input.lines.reduce((s, l) => s + l.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Journal must balance (debit ${totalDebit} != credit ${totalCredit})`);
  }

  const journalId = randomUUID();

  return prisma.$transaction(async (tx) => {
    let settlementId: string | undefined;

    if (input.settlementType) {
      const settlement = await tx.settlementRecord.create({
        data: {
          transactionId: input.transactionId ?? null,
          reference: input.reference,
          type: input.settlementType,
          status: 'SETTLED',
          amount: totalDebit,
          currency: input.currency ?? 'USD',
          settledAt: new Date(),
          externalRef: input.externalRef ?? null,
          metadata: input.metadata ? (input.metadata as Prisma.InputJsonValue) : undefined,
        },
      });
      settlementId = settlement.id;
    }

    for (const line of input.lines) {
      const account = await tx.ledgerAccount.findUnique({ where: { code: line.accountCode } });
      if (!account) throw new Error(`Ledger account ${line.accountCode} not found`);

      await tx.ledgerEntry.create({
        data: {
          journalId,
          ledgerAccountId: account.id,
          debit: line.debit,
          credit: line.credit,
          currency: input.currency ?? 'USD',
          description: line.description,
          transactionId: input.transactionId ?? null,
          settlementId: settlementId ?? null,
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

    return { journalId, settlementId };
  });
}

export async function postCustomerCredit(params: {
  accountId: string;
  amount: number;
  reference: string;
  transactionId: string;
  createdBy: string;
  sourceAccountCode?: string;
  description: string;
  currency?: string;
}) {
  const subCode = await ensureCustomerSubLedger(params.accountId);
  const source = params.sourceAccountCode ?? '1100';

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: params.accountId },
      data: { balance: { increment: params.amount } },
    });
  });

  return postJournal({
    reference: params.reference,
    transactionId: params.transactionId,
    createdBy: params.createdBy,
    settlementType: 'EXTERNAL_IN',
    currency: params.currency,
    lines: [
      {
        accountCode: source,
        debit: params.amount,
        credit: 0,
        description: params.description,
      },
      {
        accountCode: subCode,
        debit: 0,
        credit: params.amount,
        description: `Customer credit — ${params.description}`,
      },
    ],
  });
}

export async function postCustomerDebit(params: {
  accountId: string;
  amount: number;
  reference: string;
  transactionId: string;
  createdBy: string;
  destAccountCode?: string;
  description: string;
  currency?: string;
}) {
  const subCode = await ensureCustomerSubLedger(params.accountId);
  const dest = params.destAccountCode ?? '1100';

  const account = await prisma.account.findUnique({
    where: { id: params.accountId },
    select: { balance: true, holdAmount: true },
  });
  if (!account) throw new Error('Account not found');

  const available = Number(account.balance) - Number(account.holdAmount);
  if (available < params.amount) {
    throw new Error('Insufficient available balance');
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: params.accountId },
      data: { balance: { decrement: params.amount } },
    });
  });

  return postJournal({
    reference: params.reference,
    transactionId: params.transactionId,
    createdBy: params.createdBy,
    settlementType: 'EXTERNAL_OUT',
    currency: params.currency,
    lines: [
      {
        accountCode: subCode,
        debit: params.amount,
        credit: 0,
        description: `Customer debit — ${params.description}`,
      },
      {
        accountCode: dest,
        debit: 0,
        credit: params.amount,
        description: params.description,
      },
    ],
  });
}

export async function postInternalTransferJournal(params: {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  reference: string;
  transactionId: string;
  createdBy: string;
  currency?: string;
}) {
  const fromCode = await ensureCustomerSubLedger(params.fromAccountId);
  const toCode = await ensureCustomerSubLedger(params.toAccountId);

  const fromAccount = await prisma.account.findUnique({
    where: { id: params.fromAccountId },
    select: { balance: true, holdAmount: true },
  });
  if (!fromAccount) throw new Error('Source account not found');

  const available = Number(fromAccount.balance) - Number(fromAccount.holdAmount);
  if (available < params.amount) {
    throw new Error('Insufficient available balance');
  }

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: params.fromAccountId },
      data: { balance: { decrement: params.amount } },
    });
    await tx.account.update({
      where: { id: params.toAccountId },
      data: { balance: { increment: params.amount } },
    });
  });

  return postJournal({
    reference: params.reference,
    transactionId: params.transactionId,
    createdBy: params.createdBy,
    settlementType: 'INTERNAL',
    currency: params.currency,
    lines: [
      {
        accountCode: fromCode,
        debit: params.amount,
        credit: 0,
        description: `Internal transfer out`,
      },
      {
        accountCode: toCode,
        debit: 0,
        credit: params.amount,
        description: `Internal transfer in`,
      },
    ],
  });
}

export async function postLoanDisbursement(params: {
  accountId: string;
  loanId: string;
  amount: number;
  reference: string;
  createdBy: string;
}) {
  const subCode = await ensureCustomerSubLedger(params.accountId);

  await prisma.$transaction(async (tx) => {
    await tx.account.update({
      where: { id: params.accountId },
      data: { balance: { increment: params.amount } },
    });
  });

  return postJournal({
    reference: params.reference,
    createdBy: params.createdBy,
    settlementType: 'INTERNAL',
    metadata: { loanId: params.loanId },
    lines: [
      {
        accountCode: '1200',
        debit: params.amount,
        credit: 0,
        description: `Loan disbursement ${params.reference}`,
      },
      {
        accountCode: subCode,
        debit: 0,
        credit: params.amount,
        description: `Loan proceeds credited`,
      },
    ],
  });
}

export async function runLedgerReconciliation() {
  await ensureChartOfAccounts();

  const accounts = await prisma.account.findMany({
    where: { isActive: true },
    select: { balance: true, subLedgerCode: true },
  });

  const customerBalanceSum = accounts.reduce((s, a) => s + Number(a.balance), 0);

  const subCodes = accounts.map((a) => a.subLedgerCode).filter(Boolean) as string[];
  const subLedgers = subCodes.length
    ? await prisma.ledgerAccount.findMany({ where: { code: { in: subCodes } } })
    : [];

  const subLedgerBalanceSum = subLedgers.reduce((s, l) => s + Number(l.balance), 0);
  const pool = await prisma.ledgerAccount.findUnique({ where: { code: '2100' } });
  const poolBalance = Number(pool?.balance ?? 0);
  const variance = customerBalanceSum - subLedgerBalanceSum;
  const status = Math.abs(variance) < 0.01 ? 'OK' : 'BREAK';

  const record = await prisma.ledgerReconciliation.create({
    data: {
      customerBalanceSum,
      subLedgerBalanceSum,
      poolBalance,
      variance,
      status,
      breaks:
        status === 'BREAK'
          ? {
              message: 'Customer balances do not match sub-ledger sum',
              variance,
            }
          : undefined,
    },
  });

  return record;
}
