import { prisma } from '@/lib/prisma';

export type ComplianceFlagType =
  | 'HIGH_AMOUNT'
  | 'RAPID_SUCCESSION'
  | 'UNUSUAL_PATTERN'
  | 'INTERNATIONAL_HIGH_RISK'
  | 'STRUCTURING'
  | 'MANUAL_FLAG';

const HIGH_RISK_COUNTRIES = ['NG', 'PK', 'AF', 'IR', 'KP', 'SY', 'YE', 'MM'];
const LARGE_AMOUNT_THRESHOLD = 10000;
const STRUCTURING_THRESHOLD = 9500;

export interface ComplianceCheckResult {
  shouldFlag: boolean;
  flag?: ComplianceFlagType;
  reason?: string;
  riskScore: number;
}

export async function analyzeTransaction(params: {
  userId: string;
  amount: number;
  type: string;
  transferMode?: string | null;
  destinationCountry?: string | null;
  description?: string;
}): Promise<ComplianceCheckResult> {
  const { userId, amount, type, transferMode, destinationCountry } = params;
  let riskScore = 0;
  const reasons: string[] = [];

  if (amount >= LARGE_AMOUNT_THRESHOLD) {
    riskScore += 40;
    reasons.push(`Large transaction: $${amount.toLocaleString()}`);
    return {
      shouldFlag: true,
      flag: 'HIGH_AMOUNT',
      reason: reasons.join('; '),
      riskScore,
    };
  }

  if (transferMode === 'INTERNATIONAL_TRANSFER' && destinationCountry) {
    const country = destinationCountry.toUpperCase();
    if (HIGH_RISK_COUNTRIES.some((c) => country.includes(c))) {
      riskScore += 50;
      return {
        shouldFlag: true,
        flag: 'INTERNATIONAL_HIGH_RISK',
        reason: `International transfer to high-risk jurisdiction: ${destinationCountry}`,
        riskScore,
      };
    }
    if (amount >= 5000) {
      riskScore += 25;
      reasons.push(`International transfer $${amount.toLocaleString()}`);
    }
  }

  if (amount >= STRUCTURING_THRESHOLD && amount < LARGE_AMOUNT_THRESHOLD) {
    const recent = await prisma.transaction.count({
      where: {
        userId,
        type: 'DEBIT',
        amount: { gte: STRUCTURING_THRESHOLD },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    });
    if (recent >= 2) {
      riskScore += 45;
      return {
        shouldFlag: true,
        flag: 'STRUCTURING',
        reason: `Multiple near-threshold debits ($${STRUCTURING_THRESHOLD}+) within 24 hours`,
        riskScore,
      };
    }
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.transaction.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= 5 && amount >= 1000) {
    riskScore += 35;
    return {
      shouldFlag: true,
      flag: 'RAPID_SUCCESSION',
      reason: `${recentCount + 1} transactions within 1 hour including $${amount.toLocaleString()} ${type}`,
      riskScore,
    };
  }

  if (reasons.length > 0 && riskScore >= 25) {
    return {
      shouldFlag: true,
      flag: 'UNUSUAL_PATTERN',
      reason: reasons.join('; '),
      riskScore,
    };
  }

  return { shouldFlag: false, riskScore };
}

export async function applyComplianceFlags(transactionId: string): Promise<void> {
  const tx = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: { select: { id: true, branchId: true } },
    },
  });
  if (!tx) return;

  let destinationCountry: string | null = null;
  if (tx.transferMode === 'INTERNATIONAL_TRANSFER') {
    const intl = await prisma.internationalTransfer.findFirst({
      where: { transactionId: tx.id },
      select: { beneficiaryCountry: true },
    });
    destinationCountry = intl?.beneficiaryCountry || null;
  }

  const result = await analyzeTransaction({
    userId: tx.userId,
    amount: Number(tx.amount),
    type: tx.type,
    transferMode: tx.transferMode,
    destinationCountry,
    description: tx.description,
  });

  if (result.shouldFlag) {
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        complianceStatus: 'FLAGGED',
        complianceFlag: result.flag as any,
        flagReason: result.reason,
        flaggedAt: new Date(),
        flaggedBy: 'SYSTEM',
        riskScore: result.riskScore,
        branchId: tx.user.branchId || tx.branchId,
      },
    });
  }
}
