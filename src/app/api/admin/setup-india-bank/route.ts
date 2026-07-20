import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { INDIA_CORPORATE } from '@/lib/payment-rails/config';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => ({}));
    const accountNumber = body.accountNumber || INDIA_CORPORATE.accountNumber;
    const bankName = body.bankName || INDIA_CORPORATE.bankName;
    const accountHolderName = body.accountHolderName || INDIA_CORPORATE.accountName;
    const ifsc = body.ifsc || INDIA_CORPORATE.ifsc;
    const swiftCode = body.swiftCode || INDIA_CORPORATE.swiftCode;

    if (!accountNumber) {
      return NextResponse.json(
        {
          error: 'India account number required',
          hint: 'Set INDIA_CORPORATE_ACCOUNT_NUMBER in env or pass accountNumber in request body when bank provides details',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.corporateBank.findFirst({
      where: { currency: 'INR' },
    });

    const data = {
      bankName,
      accountHolderName,
      accountNumber,
      routingNumber: ifsc || null,
      swiftCode: swiftCode || null,
      bicCode: swiftCode || null,
      accountType: 'CURRENT',
      currency: 'INR',
      country: 'India',
      isActive: true,
      transferFee: 0,
    };

    const bank = existing
      ? await prisma.corporateBank.update({ where: { id: existing.id }, data })
      : await prisma.corporateBank.create({ data });

    return NextResponse.json({
      success: true,
      message: existing ? 'India corporate account updated' : 'India corporate account created',
      bank,
      upiVpa: INDIA_CORPORATE.upiVpa || 'Set INDIA_UPI_VPA when bank provides merchant VPA',
      paymentRailMode: process.env.PAYMENT_RAIL_MODE || 'demo',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to setup India bank', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});
