import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const userId = formData.get('userId') as string;

    if (!file || !type || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, upload to cloud storage (AWS S3, Cloudinary, etc.)
    // For now, we'll simulate file upload
    const fileUrl = `https://example.com/uploads/${userId}/${type}/${file.name}`;

    // Save document record to database
    const document = await prisma.kycDocument.create({
      data: {
        userId,
        documentType: type as any,
        fileUrl,
        status: 'PENDING'
      }
    });

    // Update user KYC status if all required documents are uploaded
    const userDocuments = await prisma.kycDocument.findMany({
      where: { userId }
    });

    const requiredDocuments = ['ID_PROOF', 'ADDRESS_PROOF'];
    const hasAllRequired = requiredDocuments.every(reqType =>
      userDocuments.some(doc => doc.documentType === reqType)
    );

    if (hasAllRequired) {
      await prisma.user.update({
        where: { id: userId },
        data: { kycStatus: 'PENDING' }
      });
    }

    return NextResponse.json({
      success: true,
      documentId: document.id,
      fileUrl,
      message: 'Document uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
} 