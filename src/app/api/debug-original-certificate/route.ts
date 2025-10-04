import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'fd_baby_tau_1752943528.373871';

    console.log('🔍 Original certificate API debug started');
    console.log('🔍 User:', { id: user.id, email: user.email });
    console.log('🔍 Fixed deposit ID:', id);

    // Validate input
    if (!id) {
      console.error('❌ No fixed deposit ID provided');
      return NextResponse.json(
        { error: 'Fixed deposit ID is required' },
        { status: 400 }
      );
    }

    // First, let's check if the fixed deposit exists at all
    console.log('🔍 Step 1: Checking if fixed deposit exists');
    const fixedDepositExists = await prisma.fixedDeposit.findFirst({
      where: { id: id }
    });

    console.log('🔍 Fixed deposit exists in database:', fixedDepositExists ? '✅ Yes' : '❌ No');

    if (!fixedDepositExists) {
      console.log('❌ Fixed deposit not found in database for ID:', id);
      return NextResponse.json(
        { error: 'Fixed deposit not found' },
        { status: 404 }
      );
    }

    // Now check if it belongs to the authenticated user
    console.log('🔍 Step 2: Getting fixed deposit with user data');
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

    console.log('🔍 Fixed deposit belongs to user:', fixedDeposit ? '✅ Yes' : '❌ No');
    if (fixedDeposit) {
      console.log('📋 Fixed deposit details:', {
        id: fixedDeposit.id,
        amount: fixedDeposit.amount,
        interestRate: fixedDeposit.interestRate,
        duration: fixedDeposit.duration,
        status: fixedDeposit.status,
        accountId: fixedDeposit.accountId,
        createdAt: fixedDeposit.createdAt,
        maturityDate: fixedDeposit.maturityDate
      });
    }

    if (!fixedDeposit) {
      console.log('❌ Fixed deposit not found for user ID:', user.id);
      return NextResponse.json(
        { error: 'Fixed deposit not found or access denied' },
        { status: 404 }
      );
    }

    // Get account details separately
    console.log('🔍 Step 3: Getting account details');
    const account = await prisma.account.findUnique({
      where: { id: fixedDeposit.accountId },
      select: {
        accountNumber: true,
        accountType: true
      }
    });

    console.log('🔍 Account found:', account ? '✅ Yes' : '❌ No');
    console.log('🔍 Account details:', account);

    if (!account) {
      console.log('❌ Account not found for ID:', fixedDeposit.accountId);
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Calculate interest earned with proper type conversion
    console.log('🔍 Step 4: Calculating interest');
    const now = new Date();
    const startDate = fixedDeposit.createdAt;
    const maturityDate = fixedDeposit.maturityDate;
    const isMatured = now >= maturityDate;
    
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Convert string values to numbers safely
    const depositAmount = typeof fixedDeposit.amount === 'string' ? parseFloat(fixedDeposit.amount) : Number(fixedDeposit.amount);
    const interestRate = typeof fixedDeposit.interestRate === 'string' ? parseFloat(fixedDeposit.interestRate) : Number(fixedDeposit.interestRate);
    
    console.log('🔍 Converted values:', {
      depositAmount,
      interestRate,
      depositAmountType: typeof depositAmount,
      interestRateType: typeof interestRate
    });
    
    const interestEarned = isMatured 
      ? depositAmount * interestRate / 100 * (totalDays / 365)
      : depositAmount * interestRate / 100 * (daysElapsed / 365);

    const maturityAmount = depositAmount + interestEarned;

    console.log('💰 Interest calculation:', {
      daysElapsed,
      totalDays,
      interestEarned: interestEarned.toFixed(2),
      maturityAmount: maturityAmount.toFixed(2),
      isMatured
    });

    // Generate certificate data with all required fields for beautiful format
    console.log('🔍 Step 5: Creating certificate object');
    const certificate = {
      certificateNumber: `FD-${fixedDeposit.id.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
      customerName: `${fixedDeposit.user.firstName} ${fixedDeposit.user.lastName}`,
      customerEmail: fixedDeposit.user.email,
      customerAddress: "Address not provided", // Since address fields don't exist in schema
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      depositAmount: depositAmount,
      interestRate: interestRate,
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
    console.log('📋 Certificate data:', {
      certificateNumber: certificate.certificateNumber,
      customerName: certificate.customerName,
      depositAmount: certificate.depositAmount,
      interestRate: certificate.interestRate
    });

    console.log('🔍 Step 6: Returning success response');
    return NextResponse.json({
      success: true,
      certificate
    });

  } catch (error: any) {
    console.error('❌ Error in original certificate API debug:', error);
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