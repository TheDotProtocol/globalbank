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

    // Update document status with only the fields that exist in the current schema
    const updateData: any = {
      status: status as any,
      verifiedAt: new Date()
    };

    // Only add fields if they exist in the schema
    try {
      // Try to update with all fields first
      const updatedDocument = await prisma.kycDocument.update({
        where: { id: documentId },
        data: {
          ...updateData,
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
            userId: updatedDocument.userId
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

      return NextResponse.json({
        success: true,
        message: 'Document status updated successfully',
        document: updatedDocument
      });

    } catch (schemaError) {
      // If the enhanced fields don't exist, fall back to basic update
      console.log('Falling back to basic schema update:', (schemaError as Error).message);
      
      const updatedDocument = await prisma.kycDocument.update({
        where: { id: documentId },
        data: updateData,
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
            userId: updatedDocument.userId
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

      return NextResponse.json({
        success: true,
        message: 'Document status updated successfully (basic schema)',
        document: updatedDocument
      });
    }

  } catch (error) {
    console.error('Failed to update document status:', error);
    return NextResponse.json(
      { error: 'Failed to update document status' },
      { status: 500 }
    );
  }
} 