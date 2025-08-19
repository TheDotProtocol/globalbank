import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    // Check if user is admin using existing admin credentials
    if (user.email !== 'admingdb@globaldotbank.org') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    console.log('🔍 Admin KYC list request from:', user.email);

    // Get all KYC submissions with user details
    const kycSubmissions = await prisma.user.findMany({
      where: {
        kycStatus: {
          in: ['PENDING', 'VERIFIED', 'REJECTED']
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        createdAt: true,
        kycDocuments: {
          orderBy: { uploadedAt: 'desc' },
          select: {
            id: true,
            documentType: true,
            fileName: true,
            fileSize: true,
            status: true,
            uploadedAt: true,
            verifiedAt: true,
            rejectionReason: true,
            notes: true,
            s3Key: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('✅ Found KYC submissions:', kycSubmissions.length);

    return NextResponse.json({
      success: true,
      submissions: kycSubmissions
    });

  } catch (error: any) {
    console.error('❌ Error in admin KYC list:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch KYC submissions', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 