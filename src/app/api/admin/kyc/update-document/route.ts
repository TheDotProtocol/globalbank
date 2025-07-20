import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { documentId, status, notes } = await request.json();

    // Validate input
    if (!documentId || !status) {
      return NextResponse.json(
        { error: 'Document ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['VERIFIED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update document status
    const updatedDocument = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status: status as any,
        verifiedAt: new Date(),
        verifiedBy: 'admin', // TODO: Get actual admin ID from session
        notes: notes || null,
        rejectionReason: status === 'REJECTED' ? notes : null
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
        where: { 
          userId: updatedDocument.userId,
          isActive: true
        }
      });

      const allVerified = userDocuments.every(doc => doc.status === 'VERIFIED');
      
      if (allVerified) {
        // Update user KYC status to VERIFIED
        await prisma.user.update({
          where: { id: updatedDocument.userId },
          data: {
            kycStatus: 'VERIFIED',
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        });
      }
    }

    // Send notification email to user
    try {
      const emailData = {
        email: updatedDocument.user.email,
        firstName: updatedDocument.user.firstName,
        lastName: updatedDocument.user.lastName,
        documentType: updatedDocument.documentType,
        status: status,
        notes: notes
      };

      if (status === 'VERIFIED') {
        await fetch('/api/email/kyc-document-approved', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        });
      } else {
        await fetch('/api/email/kyc-document-rejected', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailData)
        });
      }
    } catch (emailError) {
      console.error('Failed to send KYC document status email:', emailError);
      // Don't fail the update if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Document status updated successfully',
      document: updatedDocument
    });

  } catch (error) {
    console.error('Failed to update document status:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
} 