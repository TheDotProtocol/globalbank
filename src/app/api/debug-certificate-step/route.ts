import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const fixedDepositId = 'fd_baby_tau_1752943528.373871';

    console.log('🔍 Step-by-step certificate debug started');
    console.log('🔍 User:', { id: user.id, email: user.email });

    const steps = [];
    let currentStep = 1;

    // Step 1: Check if fixed deposit exists
    try {
      steps.push(`Step ${currentStep}: Checking if fixed deposit exists`);
      const fixedDepositExists = await prisma.fixedDeposit.findFirst({
        where: { id: fixedDepositId }
      });
      steps.push(`✅ Step ${currentStep}: Fixed deposit exists: ${fixedDepositExists ? 'Yes' : 'No'}`);
      currentStep++;
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error checking fixed deposit: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

    // Step 2: Get fixed deposit with user
    try {
      steps.push(`Step ${currentStep}: Getting fixed deposit with user data`);
      const fixedDeposit = await prisma.fixedDeposit.findFirst({
        where: {
          id: fixedDepositId,
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
      steps.push(`✅ Step ${currentStep}: Fixed deposit found: ${fixedDeposit ? 'Yes' : 'No'}`);
      if (fixedDeposit) {
        steps.push(`📋 Step ${currentStep}: Fixed deposit details - Amount: ${fixedDeposit.amount}, Interest: ${fixedDeposit.interestRate}, AccountId: ${fixedDeposit.accountId}`);
      }
      currentStep++;
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error getting fixed deposit: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

    // Step 3: Get account details
    try {
      steps.push(`Step ${currentStep}: Getting account details`);
      const account = await prisma.account.findUnique({
        where: { id: 'cmdacaf460002wto29vkneq5g' }, // Use the account ID from debug output
        select: {
          accountNumber: true,
          accountType: true
        }
      });
      steps.push(`✅ Step ${currentStep}: Account found: ${account ? 'Yes' : 'No'}`);
      if (account) {
        steps.push(`📋 Step ${currentStep}: Account details - Number: ${account.accountNumber}, Type: ${account.accountType}`);
      }
      currentStep++;
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error getting account: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

    // Step 4: Calculate interest
    try {
      steps.push(`Step ${currentStep}: Calculating interest`);
      const now = new Date();
      const startDate = new Date('2025-07-19T16:45:28.373Z');
      const maturityDate = new Date('2027-07-19T16:45:28.373Z');
      const isMatured = now >= maturityDate;
      
      const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const totalDays = Math.floor((maturityDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const depositAmount = 100000; // Hardcoded for testing
      const interestRate = 5.5; // Hardcoded for testing
      
      const interestEarned = isMatured 
        ? depositAmount * interestRate / 100 * (totalDays / 365)
        : depositAmount * interestRate / 100 * (daysElapsed / 365);

      const maturityAmount = depositAmount + interestEarned;
      
      steps.push(`✅ Step ${currentStep}: Interest calculated - Earned: ${interestEarned.toFixed(2)}, Maturity: ${maturityAmount.toFixed(2)}`);
      currentStep++;
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error calculating interest: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

    // Step 5: Create certificate object
    try {
      steps.push(`Step ${currentStep}: Creating certificate object`);
      const certificate = {
        certificateNumber: `FD-${fixedDepositId.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        customerName: `Baby Tau`,
        customerEmail: `babyaccount@globaldotbank.org`,
        customerAddress: "Address not provided",
        accountNumber: "0506118609",
        accountType: "SAVINGS",
        depositAmount: 100000,
        interestRate: 5.5,
        duration: 24,
        tenureUnit: 'months',
        startDate: new Date('2025-07-19T16:45:28.373Z'),
        maturityDate: new Date('2027-07-19T16:45:28.373Z'),
        interestEarned: "1234.56",
        maturityAmount: "101234.56",
        interestPayoutMode: 'On Maturity',
        status: 'ACTIVE',
        isMatured: false,
        daysElapsed: 2,
        totalDays: 730,
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
      
      steps.push(`✅ Step ${currentStep}: Certificate object created successfully`);
      steps.push(`📋 Step ${currentStep}: Certificate number: ${certificate.certificateNumber}`);
      currentStep++;
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error creating certificate object: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

    // Step 6: Return success response
    try {
      steps.push(`Step ${currentStep}: Returning success response`);
      return NextResponse.json({
        success: true,
        message: 'Step-by-step certificate generation successful',
        steps,
        certificate: {
          certificateNumber: `FD-${fixedDepositId.slice(-8).toUpperCase()}-${Date.now().toString().slice(-6)}`,
          customerName: 'Baby Tau',
          depositAmount: 100000,
          interestRate: 5.5
        }
      });
    } catch (error: any) {
      steps.push(`❌ Step ${currentStep}: Error returning response: ${error.message}`);
      return NextResponse.json({ steps, error: error.message }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Step-by-step debug error:', error);
    return NextResponse.json(
      { 
        error: 'Step-by-step debug failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}); 