import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    console.log('🔍 KYC upload request for user:', user.email);

    // Parse the multipart form data
    const formData = await request.formData();
    
    const governmentId = formData.get('governmentId') as File;
    const proofOfAddress = formData.get('proofOfAddress') as File;
    const selfie = formData.get('selfie') as File;
    const additionalDocuments = formData.getAll('additionalDocuments') as File[];

    // Validate required documents
    if (!governmentId || !proofOfAddress || !selfie) {
      console.log('❌ Missing required documents');
      return NextResponse.json(
        { error: 'All required documents must be uploaded' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
    if (!allowedTypes.includes(governmentId.type)) {
      return NextResponse.json(
        { error: 'Government ID must be an image (JPEG, PNG) or PDF' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(proofOfAddress.type)) {
      return NextResponse.json(
        { error: 'Proof of address must be an image (JPEG, PNG) or PDF' },
        { status: 400 }
      );
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selfie.type)) {
      return NextResponse.json(
        { error: 'Selfie must be an image (JPEG, PNG)' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (governmentId.size > maxSize) {
      return NextResponse.json(
        { error: 'Government ID file size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (proofOfAddress.size > maxSize) {
      return NextResponse.json(
        { error: 'Proof of address file size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (selfie.size > maxSize) {
      return NextResponse.json(
        { error: 'Selfie file size must be less than 10MB' },
        { status: 400 }
      );
    }

    // For now, we'll store file metadata in the database
    // In production, these would be uploaded to S3 and we'd store the URLs
    
    // Create KYC documents
    const documents = await Promise.all([
      // Government ID
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ID_PROOF',
          fileUrl: `data:${governmentId.type};base64,${await fileToBase64(governmentId)}`,
          status: 'PENDING'
        }
      }),
      // Proof of Address
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ADDRESS_PROOF',
          fileUrl: `data:${proofOfAddress.type};base64,${await fileToBase64(proofOfAddress)}`,
          status: 'PENDING'
        }
      }),
      // Selfie
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'SELFIE_PHOTO',
          fileUrl: `data:${selfie.type};base64,${await fileToBase64(selfie)}`,
          status: 'PENDING'
        }
      })
    ]);

    // Update user KYC status to PENDING
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: 'PENDING' }
    });

    console.log('✅ KYC documents created:', documents.length);

    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted successfully',
      documentsCount: documents.length
    });

  } catch (error: any) {
    console.error('❌ Error in KYC upload:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload KYC documents', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
} 