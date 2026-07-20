import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';
import { INDIA_CORPORATE, isDemoPaymentRail } from '@/lib/payment-rails/config';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { amount, accountId } = await request.json();

    if (!amount || !accountId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id, isActive: true },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const indiaBank = await prisma.corporateBank.findFirst({
      where: { currency: 'INR', isActive: true },
    });

    const bankName = indiaBank?.bankName || INDIA_CORPORATE.bankName;
    const accountNumber = indiaBank?.accountNumber || INDIA_CORPORATE.accountNumber;
    const accountName = indiaBank?.accountHolderName || INDIA_CORPORATE.accountName;
    const ifsc = indiaBank?.routingNumber || INDIA_CORPORATE.ifsc;
    const upiVpa = INDIA_CORPORATE.upiVpa;

    const reference = `INDIAUPI-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
    const numAmount = parseFloat(String(amount));

    const paymentRecord = await prisma.payment.create({
      data: {
        userId: user.id,
        accountId,
        amount: numAmount,
        currency: 'INR',
        paymentMethod: 'INDIA_UPI',
        status: 'PENDING',
        reference,
        description: `India UPI Payment - ${account.accountNumber}`,
        metadata: {
          corridor: 'IN',
          demoMode: isDemoPaymentRail(),
          bankName,
          accountNumber,
          ifsc,
          upiVpa: upiVpa || null,
        },
      },
    });

    let qrCodeUrl = '';
    let upiDeepLink = '';

    if (upiVpa) {
      upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(accountName)}&am=${numAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(reference)}`;
      qrCodeUrl = await QRCode.toDataURL(upiDeepLink, {
        width: 300,
        margin: 2,
        errorCorrectionLevel: 'M',
      });
    } else {
      const placeholderPayload = [
        'Global Dot Bank — India UPI',
        `Pay ₹${numAmount.toFixed(2)}`,
        accountName,
        accountNumber ? `A/C: ${accountNumber}` : 'Account pending from bank',
        ifsc ? `IFSC: ${ifsc}` : '',
        `Ref: ${reference}`,
      ]
        .filter(Boolean)
        .join('\n');
      qrCodeUrl = await QRCode.toDataURL(placeholderPayload, { width: 300, margin: 2 });
    }

    const transferDetails = {
      corridor: 'IN',
      bankName,
      accountNumber: accountNumber || 'Pending from bank',
      accountName,
      ifsc: ifsc || 'Pending from bank',
      upiVpa: upiVpa || 'Pending from bank',
      amount: numAmount,
      currency: 'INR',
      reference,
      description: `Global Dot Bank - ${account.user.firstName} ${account.user.lastName}`,
      qrCode: qrCodeUrl,
      upiDeepLink: upiDeepLink || null,
      paymentId: paymentRecord.id,
      status: 'PENDING',
      demoMode: isDemoPaymentRail(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: isDemoPaymentRail()
        ? 'India UPI payment generated (demo mode — auto-completes after ~2 minutes)'
        : 'India UPI payment generated — complete payment via your UPI app',
      qrCode: qrCodeUrl,
      transferDetails,
      paymentId: paymentRecord.id,
    });
  } catch (error: unknown) {
    console.error('India UPI payment error:', error);
    return NextResponse.json(
      { error: 'Failed to create India UPI payment', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');
    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
    }

    const payment = await prisma.payment.findFirst({
      where: { reference, paymentMethod: 'INDIA_UPI' },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.reference,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get payment status' }, { status: 500 });
  }
});
