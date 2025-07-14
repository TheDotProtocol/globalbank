import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

const prisma = new PrismaClient();

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;

    // Get user's KYC documents
    const kycDocuments = await prisma.kycDocument.findMany({
      where: { userId: user.id },
      orderBy: { uploadedAt: 'desc' }
    });

    // Calculate overall KYC status
    let overallStatus = 'PENDING';
    let completedDocuments = 0;
    let totalDocuments = 4; // ID_PROOF, ADDRESS_PROOF, INCOME_PROOF, BANK_STATEMENT

    const documentStatus = {
      ID_PROOF: { status: 'PENDING', uploaded: false },
      ADDRESS_PROOF: { status: 'PENDING', uploaded: false },
      INCOME_PROOF: { status: 'PENDING', uploaded: false },
      BANK_STATEMENT: { status: 'PENDING', uploaded: false }
    };

    // Check each document type
    kycDocuments.forEach(doc => {
      documentStatus[doc.documentType as keyof typeof documentStatus] = {
        status: doc.status,
        uploaded: true
      };

      if (doc.status === 'VERIFIED') {
        completedDocuments++;
      }
    });

    // Determine overall status
    if (completedDocuments === totalDocuments) {
      overallStatus = 'VERIFIED';
    } else if (completedDocuments > 0) {
      overallStatus = 'PARTIAL';
    }

    // Update user's KYC status if needed
    if (user.kycStatus !== overallStatus) {
      await prisma.user.update({
        where: { id: user.id },
        data: { kycStatus: overallStatus }
      });
    }

    return NextResponse.json({
      kycStatus: overallStatus,
      progress: {
        completed: completedDocuments,
        total: totalDocuments,
        percentage: Math.round((completedDocuments / totalDocuments) * 100)
      },
      documents: Object.entries(documentStatus).map(([type, status]) => ({
        type,
        status: status.status,
        uploaded: status.uploaded
      })),
      uploadedDocuments: kycDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt
      }))
    });
  } catch (error) {
    console.error('KYC status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 