import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { syncUserKycFromSumsub } from '@/lib/sumsub-sync';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    console.log('🔍 KYC status check for user:', user.email);

    // Get user with KYC status
    const userWithKYC = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        sumsubApplicantId: true,
        kycDocuments: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            documentType: true,
            status: true,
            documentUrl: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            s3Key: true,
            rejectionReason: true,
            verifiedAt: true,
            verifiedBy: true,
            notes: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!userWithKYC) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sync live status from Sumsub when an applicant exists
    if (userWithKYC.sumsubApplicantId && process.env.SUMSUB_APP_TOKEN) {
      try {
        const { kycStatus } = await syncUserKycFromSumsub(user.id);
        userWithKYC.kycStatus = kycStatus;
      } catch (syncError) {
        console.error('Sumsub KYC sync failed:', syncError);
      }
    }

    // Calculate overall KYC status based on documents
    let overallStatus = userWithKYC.kycStatus;
    const requiredDocuments = ['ID_PROOF', 'ADDRESS_PROOF', 'SELFIE_PHOTO'];
    const submittedDocuments = userWithKYC.kycDocuments.map(doc => doc.documentType);
    const verifiedDocuments = userWithKYC.kycDocuments
      .filter(doc => doc.status === 'VERIFIED')
      .map(doc => doc.documentType);

    // Check if all required documents are submitted
    const allSubmitted = requiredDocuments.every(docType => 
      submittedDocuments.includes(docType as any)
    );

    // Check if all required documents are verified
    const allVerified = requiredDocuments.every(docType => 
      verifiedDocuments.includes(docType as any)
    );

    if (allVerified) {
      overallStatus = 'VERIFIED';
    } else if (userWithKYC.kycStatus === 'VERIFIED' || userWithKYC.kycStatus === 'REJECTED') {
      overallStatus = userWithKYC.kycStatus;
    } else if (allSubmitted) {
      overallStatus = 'PENDING';
    } else {
      overallStatus = 'PENDING';
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userWithKYC.id,
        email: userWithKYC.email,
        firstName: userWithKYC.firstName,
        lastName: userWithKYC.lastName,
        kycStatus: overallStatus
      },
      kycStatus: overallStatus,
      documents: userWithKYC.kycDocuments,
      progress: {
        submitted: submittedDocuments.length,
        verified: verifiedDocuments.length,
        total: requiredDocuments.length
      }
    });

  } catch (error: any) {
    console.error('❌ Error checking KYC status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check KYC status', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 