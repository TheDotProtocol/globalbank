import { prisma } from '@/lib/prisma';
import { runFullAmlScreen } from '@/lib/aml/screening';
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
    select: { kycStatus: true, emailVerified: true, riskRating: true },
  });

  if (!user) {
    return { ok: false, code: 'USER_NOT_FOUND', reason: 'User account not found' };
  }

  if (user.riskRating === 'PROHIBITED') {
    return { ok: false, code: 'RISK_PROHIBITED', reason: 'Account prohibited — contact compliance' };
  }

  if (user.kycStatus !== 'VERIFIED') {
    return {
      ok: false,
      code: 'KYC_REQUIRED',
      reason: 'KYC verification must be completed before transacting',
    };
  }

  const openSanctionsCase = await prisma.amlCase.count({
    where: { userId, sanctionsHit: true, status: { in: ['OPEN', 'INVESTIGATING', 'ESCALATED'] } },
  });
  if (openSanctionsCase > 0) {
    return {
      ok: false,
      code: 'SANCTIONS_HOLD',
      reason: 'Account under sanctions review. Contact compliance.',
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
  transactionId?: string;
}

export interface PreTransferResult {
  shouldFlag: boolean;
  flag?: string;
  reason?: string;
  riskScore: number;
  blockTransfer: boolean;
  holdForReview: boolean;
  sanctionsHit: boolean;
  amlCaseId?: string;
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
      sanctionsHit: eligibility.code === 'SANCTIONS_HOLD',
    };
  }

  const screen = await runFullAmlScreen(params);

  return {
    shouldFlag: screen.shouldFlag,
    flag: screen.shouldFlag ? 'MANUAL_FLAG' : undefined,
    reason: screen.reason,
    riskScore: screen.riskScore,
    blockTransfer: screen.blockTransfer,
    holdForReview: screen.holdForReview,
    sanctionsHit: screen.sanctionsHit,
    amlCaseId: screen.amlCaseId,
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
