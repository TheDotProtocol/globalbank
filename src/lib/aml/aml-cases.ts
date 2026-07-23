import { prisma } from '@/lib/prisma';
import type { AmlCasePriority, AmlCaseStatus } from '@prisma/client';

function caseReference(): string {
  return `AML-${Date.now().toString(36).toUpperCase()}`;
}

export async function openAmlCase(params: {
  userId?: string;
  transactionId?: string;
  title: string;
  description?: string;
  priority?: AmlCasePriority;
  sanctionsHit?: boolean;
  fraudScore?: number;
}) {
  return prisma.amlCase.create({
    data: {
      reference: caseReference(),
      userId: params.userId ?? null,
      transactionId: params.transactionId ?? null,
      title: params.title,
      description: params.description,
      priority: params.priority ?? (params.sanctionsHit ? 'CRITICAL' : 'HIGH'),
      sanctionsHit: params.sanctionsHit ?? false,
      fraudScore: params.fraudScore ?? 0,
      status: 'OPEN',
    },
  });
}

export async function updateAmlCaseStatus(
  caseId: string,
  status: AmlCaseStatus,
  resolution?: string,
  assignee?: string
) {
  return prisma.amlCase.update({
    where: { id: caseId },
    data: {
      status,
      resolution: resolution ?? undefined,
      assignee: assignee ?? undefined,
      closedAt: status === 'CLOSED' || status === 'SAR_FILED' ? new Date() : null,
    },
  });
}

export async function listAmlCases(filters?: {
  status?: AmlCaseStatus;
  limit?: number;
}) {
  return prisma.amlCase.findMany({
    where: filters?.status ? { status: filters.status } : undefined,
    orderBy: { openedAt: 'desc' },
    take: filters?.limit ?? 100,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, riskRating: true } },
    },
  });
}
