import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: {
        account: {
          select: {
            accountNumber: true,
            accountType: true,
            currency: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    let internationalTransfer = null;
    const isIntlRelated =
      transaction.transferMode === 'INTERNATIONAL_TRANSFER' ||
      transaction.description?.toLowerCase().includes('international transfer');

    if (isIntlRelated) {
      internationalTransfer = await prisma.internationalTransfer.findFirst({
        where: { transactionId: id, userId: user.id },
      });

      if (!internationalTransfer) {
        const lookupUtr =
          transaction.utr?.replace(/-?FEE$/i, '').replace(/F$/i, '') ||
          transaction.description?.match(/UTR\s+([A-Z0-9]+)/i)?.[1];
        const lookupRef = transaction.reference?.replace(/-FEE$/i, '');

        internationalTransfer = await prisma.internationalTransfer.findFirst({
          where: {
            userId: user.id,
            OR: [
              ...(lookupRef ? [{ reference: lookupRef }] : []),
              ...(lookupUtr ? [{ utr: lookupUtr }] : []),
            ],
          },
        });
      }
    }

    let relatedTransfer = null;
    let primaryIntlTransaction = null;
    if (transaction.type === 'TRANSFER' || transaction.transferMode) {
      const paired = await prisma.transaction.findFirst({
        where: {
          userId: user.id,
          reference: transaction.reference,
          id: { not: id },
        },
        include: {
          account: { select: { accountNumber: true, accountType: true } },
        },
      });
      if (paired) relatedTransfer = paired;
    }

    if (internationalTransfer && internationalTransfer.transactionId !== id) {
      primaryIntlTransaction = await prisma.transaction.findFirst({
        where: { id: internationalTransfer.transactionId, userId: user.id },
        include: {
          account: { select: { accountNumber: true, accountType: true, currency: true } },
        },
      });
    }

    return NextResponse.json({
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amount: Number(transaction.amount),
        description: transaction.description,
        reference: transaction.reference,
        utr: transaction.utr,
        status: transaction.status,
        createdAt: transaction.createdAt,
        transferMode: transaction.transferMode,
        sourceAccountNumber: transaction.sourceAccountNumber,
        destinationAccountNumber: transaction.destinationAccountNumber,
        sourceAccountHolder: transaction.sourceAccountHolder,
        destinationAccountHolder: transaction.destinationAccountHolder,
        transferFee: transaction.transferFee ? Number(transaction.transferFee) : null,
        netAmount: transaction.netAmount ? Number(transaction.netAmount) : null,
        isDisputed: transaction.isDisputed,
        disputeStatus: transaction.disputeStatus,
        account: transaction.account,
      },
      internationalTransfer: internationalTransfer
        ? {
            beneficiaryName: internationalTransfer.beneficiaryName,
            beneficiaryAddress: internationalTransfer.beneficiaryAddress,
            beneficiaryCity: internationalTransfer.beneficiaryCity,
            beneficiaryCountry: internationalTransfer.beneficiaryCountry,
            bankName: internationalTransfer.bankName,
            bankAddress: internationalTransfer.bankAddress,
            swiftCode: internationalTransfer.swiftCode,
            accountNumber: internationalTransfer.accountNumber,
            routingNumber: internationalTransfer.routingNumber,
            amount: Number(internationalTransfer.amount),
            currency: internationalTransfer.currency,
            targetCurrency: internationalTransfer.targetCurrency,
            utr: internationalTransfer.utr,
            exchangeRate: Number(internationalTransfer.exchangeRate),
            convertedAmount: Number(internationalTransfer.convertedAmount),
            transferFee: Number(internationalTransfer.transferFee),
            totalAmount: Number(internationalTransfer.totalAmount),
            status: internationalTransfer.status,
            estimatedDelivery: internationalTransfer.estimatedDelivery,
            completedAt: internationalTransfer.completedAt,
            reference: internationalTransfer.reference,
          }
        : null,
      relatedTransfer: relatedTransfer
        ? {
            id: relatedTransfer.id,
            type: relatedTransfer.type,
            amount: Number(relatedTransfer.amount),
            account: relatedTransfer.account,
          }
        : null,
      primaryIntlTransaction: primaryIntlTransaction
        ? {
            sourceAccountNumber: primaryIntlTransaction.sourceAccountNumber,
            sourceAccountHolder: primaryIntlTransaction.sourceAccountHolder,
            destinationAccountNumber: primaryIntlTransaction.destinationAccountNumber,
            destinationAccountHolder: primaryIntlTransaction.destinationAccountHolder,
            description: primaryIntlTransaction.description,
            createdAt: primaryIntlTransaction.createdAt,
            account: primaryIntlTransaction.account,
          }
        : null,
    });
  } catch (error) {
    console.error('Get transaction detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
});
