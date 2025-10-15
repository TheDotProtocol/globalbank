import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    console.log('🚀 Demo International Transfer API called');
    
    // Skip authentication for demo
    const user = { id: 'demo-user', firstName: 'Demo', lastName: 'User', email: 'demo@example.com' };
    console.log('✅ Demo user set:', user);
    
    // Generate demo transfer data (no database operations)
    const transferData = {
      sourceAccountNumber: '0506115866',
      amount: 3000,
      currency: 'USD',
      exchangeRate: 1,
      convertedAmount: 3000,
      transferFee: 60, // 2% of 3000
      totalAmount: 3060,
      beneficiary: {
        name: 'Rosemarie Bajado',
        country: 'Philippines',
        bankName: 'Bank of the Philippines Islands (BPI)',
        swiftCode: 'BOPIPHMM',
        accountNumber: '306210105037'
      },
      description: 'International transfer to Philippines',
      reference: `INTL-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log('📋 Demo transfer data generated:', transferData);
    
    // Generate receipt (no database operations)
    const receipt = {
      transactionId: transferData.transactionId,
      reference: transferData.reference,
      amount: transferData.amount,
      currency: transferData.currency,
      exchangeRate: transferData.exchangeRate,
      convertedAmount: transferData.convertedAmount,
      transferFee: transferData.transferFee,
      totalAmount: transferData.totalAmount,
      beneficiary: transferData.beneficiary,
      sourceAccount: {
        accountNumber: transferData.sourceAccountNumber,
        accountHolder: `${user.firstName} ${user.lastName}`
      },
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: transferData.description,
      note: 'This is a demo transfer - no actual money movement occurred'
    };
    
    console.log('✅ Demo transfer completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Demo international transfer completed successfully',
      transfer: transferData,
      receipt: receipt,
      note: 'This is a demonstration - no actual database operations performed'
    });
    
  } catch (error) {
    console.error('Demo international transfer error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      error: 'Failed to process demo international transfer',
      details: errorMessage,
      type: error instanceof Error ? error.name : 'UnknownError'
    }, { status: 500 });
  }
});
