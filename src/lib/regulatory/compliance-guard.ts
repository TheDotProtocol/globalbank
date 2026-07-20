import { prisma } from '@/lib/prisma';
import { analyzeTransaction, type ComplianceCheckResult } from '@/lib/compliance-detector';
import type { ComplianceStatus, KycStatus } from '@prisma/client';

const BLOCKING_COMPLIANCE_STATUSES: ComplianceStatus[] = [
  'FLAGGED',
  'ON_HOLD',
  'UNDER_REVIEW',
  'REJECTED',
];

export function isComplianceStatusBlocking(status: ComplianceStatus): boolean {
  return BLOCKING_COMPLIANCE_STATUSES.includes(status);
}

export async function assertUserCanTransact(userId: string): Promise<
  { ok: true } | { ok: false; code: string; reason: string }
> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { kycStatus: true, emailVerified: true },
  });

  if (!user) {
    return { ok: false, code: 'USER_NOT_FOUND', reason: 'User account not found' };
  }

  if (user.kycStatus !== 'VERIFIED') {
    return {
      ok: false,
      code: 'KYC_REQUIRED',
      reason: 'KYC verification must be completed before transacting',
    };
  }

  const activeHold = await prisma.transaction.findFirst({
    where: {
      userId,
      complianceStatus: { in: BLOCKING_COMPLIANCE_STATUSES },
      status: { in: ['PENDING', 'COMPLETED'] },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (activeHold) {
    return {
      ok: false,
      code: 'COMPLIANCE_HOLD',
      reason: `Account under compliance review (${activeHold.complianceStatus}). Contact support.`,
    };
  }

  return { ok: true };
}

export interface PreTransferParams {
  userId: string;
  amount: number;
  type: string;
  transferMode?: string | null;
  destinationCountry?: string | null;
  description?: string;
}

export interface PreTransferResult extends ComplianceCheckResult {
  blockTransfer: boolean;
  holdForReview: boolean;
}

export async function preTransferComplianceCheck(
  params: PreTransferParams
): Promise<PreTransferResult> {
  const eligibility = await assertUserCanTransact(params.userId);
  if (!eligibility.ok) {
    return {
      shouldFlag: true,
      flag: 'MANUAL_FLAG',
      reason: eligibility.reason,
      riskScore: 100,
      blockTransfer: true,
      holdForReview: false,
    };
  }

  const result = await analyzeTransaction(params);

  return {
    ...result,
    blockTransfer: result.shouldFlag && result.riskScore >= 40,
    holdForReview: result.shouldFlag && result.riskScore < 40,
  };
}

export async function userHasBlockingCompliance(userId: string): Promise<boolean> {
  const count = await prisma.transaction.count({
    where: {
      userId,
      complianceStatus: { in: BLOCKING_COMPLIANCE_STATUSES },
    },
  });
  return count > 0;
}

export function kycBlocksLogin(status: KycStatus): boolean {
  return status === 'PENDING' || status === 'REJECTED';
}
