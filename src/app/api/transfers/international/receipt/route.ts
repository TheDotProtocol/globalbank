import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const body = await request.json();
    
    // Generate receipt data for the specific transfer you mentioned
    const receiptData = {
      transactionId: `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      reference: `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      amount: 3000,
      currency: 'USD',
      exchangeRate: 1,
      convertedAmount: 3000,
      transferFee: 60,
      totalAmount: 3060,
      beneficiary: {
        name: 'Rosemarie Bajado',
        address: 'Philippines',
        city: 'Manila',
        country: 'Philippines',
        bankName: 'Bank of the Philippines Islands (BPI)',
        bankAddress: 'Ayala Avenue, Makati City, Philippines',
        swiftCode: 'BOPIPHMM',
        accountNumber: '306210105037',
        routingNumber: null
      },
      sourceAccount: {
        accountNumber: '0506115866',
        accountHolder: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'International transfer to Philippines'
    };

    return NextResponse.json({
      success: true,
      message: 'International transfer receipt generated successfully',
      receipt: receiptData
    });

  } catch (error) {
    console.error('Receipt generation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { 
        error: 'Failed to generate receipt',
        details: errorMessage
      },
      { status: 500 }
    );
  }
});
