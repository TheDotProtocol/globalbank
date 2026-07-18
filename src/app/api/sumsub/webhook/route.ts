import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

function mapSumsubStatus(reviewAnswer: string): 'PENDING' | 'VERIFIED' | 'REJECTED' {
  const answer = (reviewAnswer || '').toUpperCase();
  if (answer === 'GREEN' || answer === 'VERIFIED' || answer === 'APPROVED') return 'VERIFIED';
  if (answer === 'RED' || answer === 'REJECTED' || answer === 'DECLINED') return 'REJECTED';
  return 'PENDING';
}

async function findUserByApplicant(data: Record<string, unknown>) {
  const applicantId = data.applicantId as string | undefined;
  const externalUserId = (data.externalUserId || (data.applicant as Record<string, unknown>)?.externalUserId) as string | undefined;

  if (externalUserId) {
    const user = await prisma.user.findUnique({ where: { id: externalUserId } });
    if (user) return user;
  }

  if (applicantId) {
    const user = await prisma.user.findFirst({ where: { sumsubApplicantId: applicantId } });
    if (user) return user;
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-payload-digest') || request.headers.get('x-payload-signature');

    if (process.env.SUMSUB_SECRET_KEY && signature) {
      const expected = crypto
        .createHmac('sha256', process.env.SUMSUB_SECRET_KEY)
        .update(body)
        .digest('hex');

      if (signature !== expected) {
        const expectedSha1 = crypto.createHmac('sha1', process.env.SUMSUB_SECRET_KEY).update(body).digest('hex');
        if (signature !== expectedSha1) {
          console.error('Invalid Sumsub webhook signature');
          return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }
      }
    }

    const data = JSON.parse(body);
    const type = data.type;

    switch (type) {
      case 'applicantReviewed':
        await handleApplicantReviewed(data);
        break;
      case 'applicantPending':
      case 'applicantOnHold':
        await handleApplicantPending(data);
        break;
      case 'applicantCreated':
        await handleApplicantCreated(data);
        break;
      default:
        console.log('Unhandled Sumsub webhook:', type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sumsub webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleApplicantReviewed(data: Record<string, unknown>) {
  const user = await findUserByApplicant(data);
  if (!user) return;

  const reviewResult = data.reviewResult as Record<string, unknown> | undefined;
  const reviewAnswer = (reviewResult?.reviewAnswer || reviewResult?.reviewStatus || 'PENDING') as string;
  const kycStatus = mapSumsubStatus(reviewAnswer);

  await prisma.user.update({
    where: { id: user.id },
    data: { kycStatus },
  });

  await prisma.kycDocument.updateMany({
    where: { userId: user.id, status: 'PENDING' },
    data: {
      status: kycStatus === 'VERIFIED' ? 'VERIFIED' : kycStatus === 'REJECTED' ? 'REJECTED' : 'PENDING',
      verifiedAt: kycStatus === 'VERIFIED' ? new Date() : null,
    },
  });
}

async function handleApplicantPending(data: Record<string, unknown>) {
  const user = await findUserByApplicant(data);
  if (!user) return;
  await prisma.user.update({ where: { id: user.id }, data: { kycStatus: 'PENDING' } });
}

async function handleApplicantCreated(data: Record<string, unknown>) {
  const user = await findUserByApplicant(data);
  const applicantId = data.applicantId as string;
  if (!user || !applicantId) return;

  await prisma.user.update({
    where: { id: user.id },
    data: { kycStatus: 'PENDING', sumsubApplicantId: applicantId },
  });
}
