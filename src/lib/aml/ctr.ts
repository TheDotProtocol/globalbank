import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

const CTR_THRESHOLD_USD = Number(process.env.CTR_THRESHOLD_USD || '10000');

export async function maybeFileCtr(params: {
  userId: string;
  transactionId: string;
  amount: number;
  currency?: string;
  filedBy?: string;
}): Promise<{ filed: boolean; reportId?: string }> {
  if (params.amount < CTR_THRESHOLD_USD) {
    return { filed: false };
  }

  const reference = `CTR-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;

  const report = await prisma.regulatoryReport.create({
    data: {
      reportType: 'CTR',
      jurisdiction: 'BVI',
      status: 'DRAFT',
      reference,
      userId: params.userId,
      filedBy: params.filedBy ?? 'SYSTEM',
      content: {
        transactionId: params.transactionId,
        amount: params.amount,
        currency: params.currency ?? 'USD',
        threshold: CTR_THRESHOLD_USD,
        note: 'Auto-generated currency transaction report threshold breach',
      },
    },
  });

  return { filed: true, reportId: report.id };
}
