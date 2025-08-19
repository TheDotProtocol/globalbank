import { NextRequest, NextResponse } from 'next/server';
<<<<<<< HEAD
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
=======
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { sendKYCStatusEmail } from '@/lib/email';

export const GET = requireAdminAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { documentType: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [documents, total] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              kycStatus: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.kycDocument.count({ where })
    ]);

    return NextResponse.json({
      documents: documents.map(doc => ({
        id: doc.id,
        userId: doc.userId,
        documentType: doc.documentType,
        fileUrl: doc.documentUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        s3Key: doc.s3Key,
        status: doc.status,
        uploadedAt: doc.createdAt,
        verifiedAt: doc.verifiedAt,
        verifiedBy: doc.verifiedBy,
        notes: doc.notes,
        rejectionReason: doc.rejectionReason,
        user: doc.user
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching KYC documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch KYC documents' },
      { status: 500 }
    );
  }
});

export const PUT = requireAdminAuth(async (request: NextRequest) => {
  try {
    const admin = (request as any).admin;
    const { documentId, status, comments } = await request.json();

    console.log('🔍 Updating KYC document:', { documentId, status, comments });

    // Update the document
    const updatedDocument = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status: status,
        rejectionReason: status === 'REJECTED' ? comments : null,
        verifiedAt: status === 'VERIFIED' ? new Date() : null,
        verifiedBy: status === 'VERIFIED' ? admin.id : null,
        notes: comments || null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            kycStatus: true
          }
        }
      }
    });

    console.log('✅ KYC document updated:', updatedDocument.id);

    // Check if all documents for this user are verified
    if (status === 'VERIFIED') {
      const allUserDocuments = await prisma.kycDocument.findMany({
        where: { 
          userId: updatedDocument.userId
        }
      });

      const allVerified = allUserDocuments.every(doc => doc.status === 'VERIFIED');
      
      if (allVerified) {
        // Update user KYC status to VERIFIED
        await prisma.user.update({
          where: { id: updatedDocument.userId },
          data: { kycStatus: 'VERIFIED' }
        });

        console.log('✅ User KYC status updated to VERIFIED');

        // Send approval email
        try {
          await sendKYCStatusEmail({
            email: updatedDocument.user.email,
            firstName: updatedDocument.user.firstName,
            lastName: updatedDocument.user.lastName,
            status: 'APPROVED',
            documentType: updatedDocument.documentType,
            adminNotes: comments
          });
          console.log('✅ KYC approval email sent');
        } catch (emailError) {
          console.error('❌ Failed to send KYC approval email:', emailError);
        }
      }
    } else if (status === 'REJECTED') {
      // Update user KYC status to REJECTED
      await prisma.user.update({
        where: { id: updatedDocument.userId },
        data: { kycStatus: 'REJECTED' }
      });

      console.log('✅ User KYC status updated to REJECTED');

      // Send rejection email
      try {
        await sendKYCStatusEmail({
          email: updatedDocument.user.email,
          firstName: updatedDocument.user.firstName,
          lastName: updatedDocument.user.lastName,
          status: 'REJECTED',
          documentType: updatedDocument.documentType,
          adminNotes: comments
        });
        console.log('✅ KYC rejection email sent');
      } catch (emailError) {
        console.error('❌ Failed to send KYC rejection email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `KYC document ${status.toLowerCase()} successfully`,
      document: updatedDocument
    });

  } catch (error: any) {
    console.error('❌ Error updating KYC document:', error);
    return NextResponse.json(
      { error: 'Failed to update KYC document' },
>>>>>>> c9f0d131989ca8263d75933f5d1df2dff3e786a3
      { status: 500 }
    );
  }
}); 