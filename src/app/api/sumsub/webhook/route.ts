import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-payload-signature');

    // Verify webhook signature
    if (process.env.SUMSUB_SECRET_KEY && signature) {
      const expectedSignature = crypto
        .createHmac('sha1', process.env.SUMSUB_SECRET_KEY)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const data = JSON.parse(body);

    // Handle different webhook types
    switch (data.type) {
      case 'applicantReviewed':
        await handleApplicantReviewed(data);
        break;
      case 'applicantPending':
        await handleApplicantPending(data);
        break;
      case 'applicantCreated':
        await handleApplicantCreated(data);
        break;
      default:
        console.log('Unhandled webhook type:', data.type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing Sumsub webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleApplicantReviewed(data: any) {
  const { applicantId, reviewResult } = data;
  
  if (reviewResult?.reviewAnswer) {
    await prisma.user.updateMany({
      where: { id: applicantId },
      data: { kycStatus: reviewResult.reviewAnswer }
    });
  }
}

async function handleApplicantPending(data: any) {
  const { applicantId } = data;
  
  await prisma.user.updateMany({
    where: { id: applicantId },
    data: { kycStatus: 'PENDING' }
  });
}

async function handleApplicantCreated(data: any) {
  const { applicantId } = data;
  
  await prisma.user.updateMany({
    where: { id: applicantId },
    data: { kycStatus: 'PENDING' }
  });
} 