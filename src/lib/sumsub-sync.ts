import { prisma } from '@/lib/prisma';
import {
  createApplicant,
  ensureApplicant,
  getApplicantByExternalUserId,
  getApplicantById,
  mapSumsubToKycStatus,
  type CreateApplicantInput,
  type SumsubApplicant,
} from '@/lib/sumsub-client';

export async function syncUserKycFromSumsub(
  userId: string,
  applicant?: SumsubApplicant | null
): Promise<{ kycStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'; applicant: SumsubApplicant | null }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, sumsubApplicantId: true },
  });
  if (!user) throw new Error('User not found');

  let sumsubApplicant = applicant ?? null;
  if (!sumsubApplicant) {
    if (user.sumsubApplicantId) {
      sumsubApplicant = await getApplicantById(user.sumsubApplicantId);
    }
    if (!sumsubApplicant) {
      sumsubApplicant = await getApplicantByExternalUserId(userId);
    }
  }

  if (!sumsubApplicant) {
    return { kycStatus: 'PENDING', applicant: null };
  }

  const kycStatus = mapSumsubToKycStatus(sumsubApplicant);

  await prisma.user.update({
    where: { id: userId },
    data: {
      kycStatus,
      sumsubApplicantId: sumsubApplicant.id,
      ...(kycStatus === 'VERIFIED'
        ? { emailVerified: true, emailVerifiedAt: new Date() }
        : {}),
    },
  });

  if (kycStatus === 'VERIFIED' || kycStatus === 'REJECTED') {
    await prisma.kycDocument.updateMany({
      where: { userId, status: 'PENDING' },
      data: {
        status: kycStatus === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
        verifiedAt: kycStatus === 'VERIFIED' ? new Date() : null,
        verifiedBy: 'SUMSUB',
      },
    });
  }

  return { kycStatus, applicant: sumsubApplicant };
}

export async function registerSumsubApplicant(input: CreateApplicantInput) {
  const applicant = await createApplicant(input);
  await prisma.user.update({
    where: { id: input.externalUserId },
    data: {
      sumsubApplicantId: applicant.id,
      kycStatus: mapSumsubToKycStatus(applicant),
    },
  });
  return applicant;
}

export async function prepareSumsubApplicant(input: CreateApplicantInput) {
  const applicant = await ensureApplicant(input);
  await prisma.user.update({
    where: { id: input.externalUserId },
    data: {
      sumsubApplicantId: applicant.id,
      kycStatus: mapSumsubToKycStatus(applicant),
    },
  });
  return applicant;
}
