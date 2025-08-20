import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest, { params }: { params: { userId: string } }) => {
  try {
    const user = (request as any).user;
    const { userId } = params;
    
    // Check if user is admin using existing admin credentials
    if (user.email !== 'admingdb@globaldotbank.org') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { action, reason, notes } = await request.json();

    console.log('🔍 Admin KYC action request:', { userId, action, reason });

    if (!['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be APPROVE, REJECT, or REQUEST_MORE_INFO' },
        { status: 400 }
      );
    }

    // Get the user and their KYC documents
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        kycDocuments: true
      }
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update KYC documents status
    const documentUpdates = targetUser.kycDocuments.map(doc => 
      prisma.kycDocument.update({
        where: { id: doc.id },
        data: {
          status: action === 'APPROVE' ? 'VERIFIED' : 
                 action === 'REJECT' ? 'REJECTED' : 'PENDING',
          verifiedAt: action === 'APPROVE' ? new Date() : null,
          verifiedBy: action === 'APPROVE' ? user.id : null,
          rejectionReason: action === 'REJECT' ? reason : null,
          notes: notes || null
        }
      })
    );

    // Update user KYC status
    const userUpdate = prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus: action === 'APPROVE' ? 'VERIFIED' : 
                  action === 'REJECT' ? 'REJECTED' : 'PENDING'
      }
    });

    // Execute all updates in a transaction
    await prisma.$transaction([...documentUpdates, userUpdate]);

    console.log('✅ KYC action completed:', action);

    return NextResponse.json({
      success: true,
      message: `KYC ${action.toLowerCase()}d successfully`,
      action,
      userId
    });

  } catch (error: any) {
    console.error('❌ Error in admin KYC action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process KYC action', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 