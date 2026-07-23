import { screenUser } from '@/lib/aml/sanctions';
import { detectTransactionFraud } from '@/lib/aml/fraud-detection';
import { maybeFileCtr } from '@/lib/aml/ctr';
import { openAmlCase } from '@/lib/aml/aml-cases';
import { analyzeTransaction } from '@/lib/compliance-detector';

export interface FullAmlScreenResult {
  blockTransfer: boolean;
  holdForReview: boolean;
  shouldFlag: boolean;
  riskScore: number;
  reason?: string;
  sanctionsHit: boolean;
  fraudAction: 'ALLOW' | 'BLOCK' | 'REVIEW';
  ctrFiled: boolean;
  amlCaseId?: string;
}

export async function runFullAmlScreen(params: {
  userId: string;
  amount: number;
  type: string;
  transferMode?: string | null;
  destinationCountry?: string | null;
  description?: string;
  transactionId?: string;
}): Promise<FullAmlScreenResult> {
  const [compliance, fraud, sanctions] = await Promise.all([
    analyzeTransaction(params),
    detectTransactionFraud(params),
    screenUser(params.userId),
  ]);

  let riskScore = Math.max(compliance.riskScore, fraud.riskScore);
  const reasons: string[] = [];
  if (compliance.reason) reasons.push(compliance.reason);
  if (fraud.reasons.length) reasons.push(...fraud.reasons);

  let blockTransfer = false;
  let holdForReview = false;
  let shouldFlag = compliance.shouldFlag || fraud.action !== 'ALLOW';
  let amlCaseId: string | undefined;

  if (sanctions.hit) {
    blockTransfer = true;
    shouldFlag = true;
    riskScore = 100;
    reasons.push(`Sanctions match: ${sanctions.matchedName ?? 'confirmed hit'}`);

    const amlCase = await openAmlCase({
      userId: params.userId,
      transactionId: params.transactionId,
      title: 'Sanctions screening hit',
      description: reasons.join('; '),
      priority: 'CRITICAL',
      sanctionsHit: true,
      fraudScore: riskScore,
    });
    amlCaseId = amlCase.id;
  } else if (fraud.action === 'BLOCK') {
    blockTransfer = true;
    shouldFlag = true;

    const amlCase = await openAmlCase({
      userId: params.userId,
      transactionId: params.transactionId,
      title: 'Fraud rules blocked transaction',
      description: reasons.join('; '),
      priority: 'HIGH',
      fraudScore: riskScore,
    });
    amlCaseId = amlCase.id;
  } else if (fraud.action === 'REVIEW' || compliance.shouldFlag) {
    holdForReview = true;
    shouldFlag = true;

    const amlCase = await openAmlCase({
      userId: params.userId,
      transactionId: params.transactionId,
      title: 'Transaction flagged for AML review',
      description: reasons.join('; '),
      priority: 'MEDIUM',
      fraudScore: riskScore,
    });
    amlCaseId = amlCase.id;
  }

  let ctrFiled = false;
  if (params.transactionId && params.amount >= Number(process.env.CTR_THRESHOLD_USD || '10000')) {
    const ctr = await maybeFileCtr({
      userId: params.userId,
      transactionId: params.transactionId,
      amount: params.amount,
    });
    ctrFiled = ctr.filed;
  }

  return {
    blockTransfer,
    holdForReview,
    shouldFlag,
    riskScore,
    reason: reasons.join('; ') || compliance.reason,
    sanctionsHit: sanctions.hit,
    fraudAction: fraud.action,
    ctrFiled,
    amlCaseId,
  };
}
