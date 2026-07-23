import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidUTR, normalizeUTR } from '@/lib/reference-generator';
import { BANK_BRANDING } from '@/lib/bank-branding';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ utr: string }> }
) {
  try {
    const { utr: rawUtr } = await params;
    const utr = normalizeUTR(decodeURIComponent(rawUtr));

    if (!utr || !isValidUTR(utr)) {
      return NextResponse.json(
        { verified: false, error: 'Invalid UTR format. UTR must be 13–21 digits.' },
        { status: 400 }
      );
    }

    const intlTransfer = await prisma.internationalTransfer.findFirst({
      where: { utr },
      include: {
        account: {
          select: {
            accountNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [{ utr }, { utr: `${utr}-FEE` }, { utr: `${utr}F` }],
      },
      include: {
        account: {
          select: {
            accountNumber: true,
            user: { select: { firstName: true, lastName: true } },
          },
        },
      },
    });

    const record = intlTransfer || transaction;

    if (!record) {
      return NextResponse.json({
        verified: false,
        utr,
        message: 'No transfer found for this UTR. It may be invalid or not yet registered.',
        bank: BANK_BRANDING.shortName,
      });
    }

    const isCompleted = record.status === 'COMPLETED';
    const isPending = ['PENDING', 'PROCESSING'].includes(record.status);

    const senderName = record.account?.user
      ? `${record.account.user.firstName} ${record.account.user.lastName}`
      : null;

    if (intlTransfer) {
      return NextResponse.json({
        verified: true,
        authentic: isCompleted,
        status: intlTransfer.status,
        statusLabel: isCompleted
          ? 'Genuine transfer — verified and completed'
          : isPending
            ? 'Transfer registered — processing in progress'
            : `Transfer status: ${intlTransfer.status}`,
        utr: intlTransfer.utr,
        reference: intlTransfer.reference,
        amount: Number(intlTransfer.amount),
        currency: intlTransfer.currency,
        beneficiaryName: intlTransfer.beneficiaryName,
        beneficiaryBank: intlTransfer.bankName,
        beneficiaryCountry: intlTransfer.beneficiaryCountry,
        senderAccount: intlTransfer.account?.accountNumber,
        senderName,
        completedAt: intlTransfer.completedAt,
        createdAt: intlTransfer.createdAt,
        bank: {
          name: BANK_BRANDING.legalName,
          website: BANK_BRANDING.websiteDisplay,
        },
      });
    }

    return NextResponse.json({
      verified: true,
      authentic: isCompleted,
      status: transaction!.status,
      statusLabel: isCompleted
        ? 'Genuine transaction — verified and completed'
        : isPending
          ? 'Transaction registered — processing in progress'
          : `Transaction status: ${transaction!.status}`,
      utr: transaction!.utr,
      reference: transaction!.reference,
      amount: Number(transaction!.amount),
      type: transaction!.type,
      description: transaction!.description,
      senderAccount: transaction!.account?.accountNumber,
      senderName,
      createdAt: transaction!.createdAt,
      bank: {
        name: BANK_BRANDING.legalName,
        website: BANK_BRANDING.websiteDisplay,
      },
    });
  } catch (error) {
    console.error('Transfer verify error:', error);
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 });
  }
}
