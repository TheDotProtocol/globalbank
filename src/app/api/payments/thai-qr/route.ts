import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

// K Bank API Configuration
const KBANK_API_CONFIG = {
  consumerId: 'suj0oTcJsMnbsaerFsrsrlke0s38nFdU',
  consumerSecret: 'ltIppO9HGozxXWT2',
  baseUrl: 'https://apiportal.kasikornbank.com',
  sandboxUrl: 'https://apiportal.kasikornbank.com/app/exercises/9b9b6143-98b5-4ac6-a486-d71bd1494a04/20'
};

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { amount, accountId, paymentMethod } = await request.json();

    console.log('🇹🇭 Thai QR payment request:', { amount, accountId, paymentMethod });

    // Validate input
    if (!amount || !accountId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify account exists and belongs to user
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
        isActive: true
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found or inactive' },
        { status: 404 }
      );
    }

    // Generate unique reference for this payment
    const reference = `THAIQR-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create payment record in database
    const paymentRecord = await prisma.payment.create({
      data: {
        userId: user.id,
        accountId: accountId,
        amount: amount,
        currency: 'THB',
        paymentMethod: 'THAI_QR',
        status: 'PENDING',
        reference: reference,
        description: `Thai QR Payment - ${account.accountNumber}`,
        metadata: {
          kbankApi: true,
          sandbox: true,
          consumerId: KBANK_API_CONFIG.consumerId
        }
      }
    });

    console.log('✅ Payment record created:', paymentRecord.id);

    // Generate Thai QR code data (Thai QR Standard)
    const qrData = {
      version: '000201',
      type: '01',
      merchantType: '0000',
      merchantId: '0016A000000677010112',
      merchantName: 'Global Dot Bank',
      merchantCity: 'Bangkok',
      merchantCountry: 'TH',
      amount: amount.toFixed(2),
      currency: '764',
      reference: reference,
      terminalId: '001',
      purpose: '00'
    };

    // Create Thai QR code string (simplified format)
    const qrString = `00020101021229370016A0000006770101120113Global Dot Bank5204599953037645406${amount.toFixed(2)}5802TH6304${reference}${reference.length.toString().padStart(2, '0')}`;

    // Generate QR code image
    const qrCodeUrl = await QRCode.toDataURL(qrString, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    // Prepare transfer details for K Bank
    const transferDetails = {
      bankName: 'Kasikorn Bank (K Bank)',
      accountNumber: '198-1-64757-9',
      accountName: 'The Dotprotocol Co., Ltd',
      amount: amount,
      currency: 'THB',
      reference: reference,
      description: `Global Dot Bank - ${account.user.firstName} ${account.user.lastName}`,
      qrCode: qrCodeUrl,
      paymentId: paymentRecord.id,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
    };

    console.log('✅ Thai QR payment generated:', {
      paymentId: paymentRecord.id,
      reference: reference,
      amount: amount
    });

    return NextResponse.json({
      success: true,
      message: 'Thai QR payment generated successfully',
      qrCode: qrCodeUrl,
      transferDetails: transferDetails,
      paymentId: paymentRecord.id
    });

  } catch (error: any) {
    console.error('❌ Thai QR payment error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Thai QR payment',
        details: error.message 
      },
      { status: 500 }
    );
  }
});

// Get payment status
export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        reference: reference,
        paymentMethod: 'THAI_QR'
      }
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        reference: payment.reference,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt
      }
    });

  } catch (error: any) {
    console.error('❌ Get payment status error:', error);
    return NextResponse.json(
      { error: 'Failed to get payment status' },
      { status: 500 }
    );
  }
}); 