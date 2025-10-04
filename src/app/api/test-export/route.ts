import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    console.log('🔍 Test export endpoint called');
    
    // Create a simple certificate object
    const certificate = {
      certificateNumber: 'FD-TEST123-456789',
      customerName: 'Baby Tau',
      customerEmail: 'babyaccount@globaldotbank.org',
      customerAddress: 'Address not provided',
      accountNumber: '0506118609',
      accountType: 'SAVINGS',
      depositAmount: 100000,
      interestRate: 5.5,
      duration: 24,
      tenureUnit: 'months',
      startDate: new Date('2025-07-19T16:45:28.373Z'),
      maturityDate: new Date('2027-07-19T16:45:28.373Z'),
      interestEarned: '1234.56',
      maturityAmount: '101234.56',
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

    console.log('✅ Test certificate object created');

    return NextResponse.json({
      success: true,
      message: 'Test export successful',
      certificate,
      testData: {
        certificateNumber: certificate.certificateNumber,
        customerName: certificate.customerName,
        depositAmount: certificate.depositAmount,
        interestRate: certificate.interestRate
      }
    });

  } catch (error: any) {
    console.error('❌ Test export error:', error);
    return NextResponse.json(
      { 
        error: 'Test export failed', 
        message: error.message,
        stack: error.stack 
      },
      { status: 500 }
    );
  }
}); 