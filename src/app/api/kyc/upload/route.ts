import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    const formData = await request.formData();
    
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    // Validate input
    if (!documentType || !file) {
      return NextResponse.json(
        { error: 'Document type and file are required' },
        { status: 400 }
      );
    }

    // Validate document type
    const validDocumentTypes = ['ID_PROOF', 'ADDRESS_PROOF', 'INCOME_PROOF', 'BANK_STATEMENT'];
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and PDF files are allowed' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Upload file to cloud storage (AWS S3, Google Cloud Storage, etc.)
    // 2. Get the file URL
    // 3. Store the URL in the database
    
    // For now, we'll simulate file upload
    const fileName = `${user.id}_${documentType}_${Date.now()}.${file.type.split('/')[1]}`;
    const fileUrl = `https://storage.globaldotbank.org/kyc/${fileName}`;

    // Check if document type already exists for this user
    const existingDocument = await prisma.kycDocument.findFirst({
      where: {
        userId: user.id,
        documentType: documentType as any
      }
    });

    if (existingDocument) {
      // Update existing document
      const updatedDocument = await prisma.kycDocument.update({
        where: { id: existingDocument.id },
        data: {
          fileUrl,
          status: 'PENDING',
          uploadedAt: new Date()
        }
      });

      return NextResponse.json({
        message: 'Document updated successfully',
        document: {
          id: updatedDocument.id,
          documentType: updatedDocument.documentType,
          status: updatedDocument.status,
          uploadedAt: updatedDocument.uploadedAt
        }
      });
    } else {
      // Create new document
      const newDocument = await prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: documentType as any,
          fileUrl,
          status: 'PENDING'
        }
      });

      return NextResponse.json({
        message: 'Document uploaded successfully',
        document: {
          id: newDocument.id,
          documentType: newDocument.documentType,
          status: newDocument.status,
          uploadedAt: newDocument.uploadedAt
        }
      }, { status: 201 });
    }
  } catch (error) {
    console.error('KYC upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}); 