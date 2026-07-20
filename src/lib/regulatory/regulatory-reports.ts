import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import type { RegulatoryReportType, ReportStatus, Prisma } from '@prisma/client';

function generateReportReference(type: RegulatoryReportType, jurisdiction: string): string {
  const prefix = jurisdiction.toUpperCase();
  const ts = Date.now().toString(36).toUpperCase();
  return `${prefix}-${type}-${ts}`;
}

export interface CreateRegulatoryReportInput {
  reportType: RegulatoryReportType;
  jurisdiction: 'IN' | 'TH' | string;
  filedBy: string;
  transactionIds?: string[];
  userId?: string;
  content: Record<string, unknown>;
  notes?: string;
  status?: ReportStatus;
}

export async function createRegulatoryReport(input: CreateRegulatoryReportInput) {
  return prisma.regulatoryReport.create({
    data: {
      reportType: input.reportType,
      jurisdiction: input.jurisdiction,
      status: input.status ?? 'DRAFT',
      reference: generateReportReference(input.reportType, input.jurisdiction),
      transactionIds: input.transactionIds ?? [],
      userId: input.userId ?? null,
      filedBy: input.filedBy,
      content: input.content as Prisma.InputJsonValue,
      notes: input.notes ?? null,
    },
  });
}

export async function submitRegulatoryReport(reportId: string, filedBy: string) {
  return prisma.regulatoryReport.update({
    where: { id: reportId },
    data: {
      status: 'SUBMITTED',
      filedBy,
      filedAt: new Date(),
    },
  });
}

export async function createStrFromTransaction(
  transactionId: string,
  filedBy: string,
  jurisdiction: 'IN' | 'TH',
  notes?: string
) {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      account: { select: { accountNumber: true } },
    },
  });
  if (!tx) throw new Error('Transaction not found');

  const reportType: RegulatoryReportType =
    jurisdiction === 'IN' ? 'STR' : 'SAR';

  return createRegulatoryReport({
    reportType,
    jurisdiction,
    filedBy,
    transactionIds: [transactionId],
    userId: tx.userId,
    notes,
    status: 'PENDING_REVIEW',
    content: {
      generatedAt: new Date().toISOString(),
      reference: tx.reference,
      utr: tx.utr,
      amount: Number(tx.amount),
      type: tx.type,
      complianceStatus: tx.complianceStatus,
      complianceFlag: tx.complianceFlag,
      flagReason: tx.flagReason,
      customer: {
        id: tx.user.id,
        email: tx.user.email,
        name: `${tx.user.firstName} ${tx.user.lastName}`,
      },
      accountNumber: tx.account.accountNumber,
      description: tx.description,
    },
  });
}

export function inferJurisdictionFromBranchCountry(country?: string | null): 'IN' | 'TH' {
  if (!country) return 'IN';
  const c = country.toUpperCase();
  if (c.includes('THAILAND') || c === 'TH') return 'TH';
  return 'IN';
}
