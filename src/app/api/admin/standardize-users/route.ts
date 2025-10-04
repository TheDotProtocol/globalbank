import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { UserStandardization } from '@/lib/user-standardization';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    // Check if user is admin
    if (user.email !== 'admingdb@globaldotbank.org') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔧 Admin requested user standardization');

    // Standardize all users
    await UserStandardization.standardizeAllUsers();

    return NextResponse.json({
      success: true,
      message: 'All users have been standardized with consistent features and policies',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error standardizing users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to standardize users', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    // Check if user is admin
    if (user.email !== 'admingdb@globaldotbank.org') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Return current standardization status
    return NextResponse.json({
      success: true,
      standardization: {
        status: 'active',
        features: UserStandardization.getUserFeatures('any-user-id'),
        limits: UserStandardization.getTransferLimits('any-user-id'),
        rates: UserStandardization.getInterestRates('any-user-id'),
        message: 'All users have access to the same features, policies, and UI'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error getting standardization status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get standardization status', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 