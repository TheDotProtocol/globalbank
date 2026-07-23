import { prisma } from '@/lib/prisma';

export type FraudAction = 'ALLOW' | 'BLOCK' | 'REVIEW';

export interface FraudCheckResult {
  isFraudulent: boolean;
  riskScore: number;
  reasons: string[];
  action: FraudAction;
}

const HIGH_THRESHOLD = 80;
const MEDIUM_THRESHOLD = 50;

export async function detectTransactionFraud(params: {
  userId: string;
  amount: number;
  type: string;
  transferMode?: string | null;
  description?: string;
}): Promise<FraudCheckResult> {
  const reasons: string[] = [];
  let riskScore = 0;

  if (params.amount >= 10000) {
    riskScore += 30;
    reasons.push('High amount transaction');
  }

  if (params.amount > 0 && params.amount < 1) {
    riskScore += 20;
    reasons.push('Suspiciously low amount');
  }

  const hour = new Date().getHours();
  if (hour >= 2 && hour <= 5) {
    riskScore += 15;
    reasons.push('Unusual transaction time');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.transaction.count({
    where: {
      userId: params.userId,
      createdAt: { gte: oneHourAgo },
      status: 'COMPLETED',
    },
  });

  if (recentCount >= 5) {
    riskScore += 35;
    reasons.push('High transaction velocity (5+ in 1 hour)');
  }

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { riskRating: true, pepStatus: true },
  });

  if (user?.riskRating === 'HIGH' || user?.riskRating === 'PROHIBITED') {
    riskScore += 25;
    reasons.push(`Elevated customer risk rating: ${user.riskRating}`);
  }

  if (user?.pepStatus === 'PEP' || user?.pepStatus === 'RCA') {
    riskScore += 20;
    reasons.push('PEP/RCA customer');
  }

  riskScore = Math.min(100, riskScore);

  let action: FraudAction = 'ALLOW';
  if (riskScore >= HIGH_THRESHOLD) action = 'BLOCK';
  else if (riskScore >= MEDIUM_THRESHOLD) action = 'REVIEW';

  return {
    isFraudulent: riskScore >= HIGH_THRESHOLD,
    riskScore,
    reasons,
    action,
  };
}
