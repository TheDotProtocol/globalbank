import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const user = (request as any).user;
    const { id } = await params;

    console.log('🔍 Certificate generation request:', { 
      userId: user.id, 
      fixedDepositId: id,
      userEmail: user.email 
    });

    // Validate input
    if (!id) {
      console.error('❌ No fixed deposit ID provided');
      return NextResponse.json(
        { error: 'Fixed deposit ID is required' },
        { status: 400 }
      );
    }

    const fixedDeposit = await prisma.fixedDeposit.findFirst({
      where: {
        id: id,
        userId: user.id
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

    console.log('🔍 Fixed deposit found:', fixedDeposit ? '✅ Yes' : '❌ No');
    if (fixedDeposit) {
      console.log('📋 Fixed deposit details:', {
        id: fixedDeposit.id,
        amount: fixedDeposit.amount,
        interestRate: fixedDeposit.interestRate,
        duration: fixedDeposit.duration,
        status: fixedDeposit.status
      });
    }

    if (!fixedDeposit) {
      console.log('❌ Fixed deposit not found for ID:', id);
      return NextResponse.json(
        { error: 'Fixed deposit not found' },
        { status: 404 }
      );
    }

    // Get account details separately
    const account = await prisma.account.findUnique({
      where: { id: fixedDeposit.accountId },
      select: {
        accountNumber: true,
        accountType: true
      }
    });

    console.log('🔍 Account found:', account ? '✅ Yes' : '❌ No');

    if (!account) {
      console.log('❌ Account not found for ID:', fixedDeposit.accountId);
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Calculate interest earned
    const now = new Date();
    const startDate = fixedDeposit.createdAt;
    const maturityDate = fixedDeposit.maturityDate;
    const isMatured = now >= maturityDate;
    
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const interestEarned = isMatured 
      ? Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * (totalDays / 365)
      : Number(fixedDeposit.amount) * Number(fixedDeposit.interestRate) / 100 * (daysElapsed / 365);

    const maturityAmount = Number(fixedDeposit.amount) + interestEarned;

    console.log('💰 Interest calculation:', {
      daysElapsed,
      totalDays,
      interestEarned: interestEarned.toFixed(2),
      maturityAmount: maturityAmount.toFixed(2),
      isMatured
    });

    // Generate certificate data with all required fields for beautiful format
    const certificate = {
      certificateNumber: `FD-${fixedDeposit.id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      customerName: `${fixedDeposit.user.firstName} ${fixedDeposit.user.lastName}`,
      customerEmail: fixedDeposit.user.email,
      customerAddress: "Address not provided", // Since address fields don't exist in schema
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      depositAmount: Number(fixedDeposit.amount),
      interestRate: Number(fixedDeposit.interestRate),
      duration: fixedDeposit.duration,
      tenureUnit: fixedDeposit.duration > 12 ? 'years' : 'months',
      startDate: fixedDeposit.createdAt,
      maturityDate: fixedDeposit.maturityDate,
      interestEarned: interestEarned.toFixed(2),
      maturityAmount: maturityAmount.toFixed(2),
      interestPayoutMode: 'On Maturity', // Default mode
      status: fixedDeposit.status,
      isMatured,
      daysElapsed,
      totalDays,
      generatedAt: new Date(),
      bankName: 'Global Dot Bank',
      bankAddress: '1075 Terra Bella Ave, Mountain View CA, 94043',
      bankWebsite: 'https://globaldotbank.org',
      bankEmail: 'banking@globaldotbank.org',
      terms: [
        'This deposit is non-transferable and non-negotiable.',
        'Premature withdrawal may be subject to penalty or reduced interest.',
        'This certificate is system-generated and does not require a physical signature.',
        'In case of loss, please contact banking@globaldotbank.org immediately.',
        'Interest will be calculated on the basis of actual days and paid as per the payout mode.',
        'The bank reserves the right to modify terms and conditions as per regulatory requirements.'
      ]
    };

    console.log('✅ Certificate generated successfully:', certificate.certificateNumber);

    return NextResponse.json({
      success: true,
      certificate
    });

  } catch (error) {
    console.error('❌ Error generating certificate:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to generate certificate', 
        details: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
});
