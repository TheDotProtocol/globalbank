import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';

// Get KYC documents for admin review
export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const documentType = searchParams.get('documentType') || '';

    // Build where clause
    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (documentType && documentType !== 'all') {
      where.documentType = documentType.toUpperCase();
    }

    // Get KYC documents with pagination
    const [documents, totalCount] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { uploadedAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              kycStatus: true,
              createdAt: true
            }
          }
        }
      }),
      prisma.kycDocument.count({ where })
    ]);

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        documentType: doc.documentType,
        fileUrl: doc.fileUrl,
        s3Key: doc.s3Key,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        verifiedAt: doc.verifiedAt,
        verifiedBy: doc.verifiedBy,
        rejectionReason: doc.rejectionReason,
        notes: doc.notes,
        isActive: doc.isActive,
        version: doc.version,
        user: doc.user
      })),
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Admin KYC error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Review KYC document (approve/reject)
export const PUT = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { documentId, status, comments } = await request.json();

    // Update KYC document status
    const updatedDocument = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status: status,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: status === 'VERIFIED' ? admin.username : null,
        notes: comments || null
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            kycStatus: true
          }
        }
      }
    });

    // If document is verified, check if all user documents are verified
    if (status === 'VERIFIED') {
      const userDocuments = await prisma.kycDocument.findMany({
        where: { userId: updatedDocument.userId }
      });

      const allVerified = userDocuments.every(doc => doc.status === 'VERIFIED');
      
      if (allVerified) {
        // Update user KYC status to VERIFIED
        await prisma.user.update({
          where: { id: updatedDocument.userId },
          data: { kycStatus: 'VERIFIED' }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Document status updated successfully',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Admin KYC update error:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
}); 