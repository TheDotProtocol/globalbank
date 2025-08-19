import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { triggerMonthlyInterestCalculation } from '@/lib/interest-calculator';

export const POST = requireAdminAuth(async (request: NextRequest) => {
  try {
    console.log('🏦 Admin triggered monthly interest calculation');
    
    await triggerMonthlyInterestCalculation();
    
    return NextResponse.json({
      success: true,
      message: 'Monthly interest calculation completed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error in admin interest calculation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to calculate monthly interest',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    // Return interest rate information
    const { InterestCalculator } = await import('@/lib/interest-calculator');
    const rates = InterestCalculator.getAllInterestRates();
    
    return NextResponse.json({
      success: true,
      interestRates: rates,
      message: 'Interest rates retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting interest rates:', error);
    return NextResponse.json(
      { error: 'Failed to get interest rates' },
      { status: 500 }
    );
  }
}); 