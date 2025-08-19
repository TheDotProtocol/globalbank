import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

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

    console.log('📤 Uploading files to S3...');

    // Convert files to buffers and upload to S3
    const governmentIdBuffer = Buffer.from(await governmentId.arrayBuffer());
    const proofOfAddressBuffer = Buffer.from(await proofOfAddress.arrayBuffer());
    const selfieBuffer = Buffer.from(await selfie.arrayBuffer());

    // Upload files to S3
    const [governmentIdUpload, proofOfAddressUpload, selfieUpload] = await Promise.all([
      uploadFileToS3(governmentIdBuffer, governmentId.name, user.id, 'ID_PROOF'),
      uploadFileToS3(proofOfAddressBuffer, proofOfAddress.name, user.id, 'ADDRESS_PROOF'),
      uploadFileToS3(selfieBuffer, selfie.name, user.id, 'SELFIE_PHOTO')
    ]);

    console.log('✅ Files uploaded to S3 successfully');

    // Create KYC documents in database with S3 URLs
    const documents = await Promise.all([
      // Government ID
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ID_PROOF',
          fileUrl: governmentIdUpload.url,
          s3Key: governmentIdUpload.key,
          fileName: governmentId.name,
          fileSize: governmentId.size,
          mimeType: governmentId.type,
          status: 'PENDING'
        }
      }),
      // Proof of Address
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ADDRESS_PROOF',
          fileUrl: proofOfAddressUpload.url,
          s3Key: proofOfAddressUpload.key,
          fileName: proofOfAddress.name,
          fileSize: proofOfAddress.size,
          mimeType: proofOfAddress.type,
          status: 'PENDING'
        }
      }),
      // Selfie
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'SELFIE_PHOTO',
          fileUrl: selfieUpload.url,
          s3Key: selfieUpload.key,
          fileName: selfie.name,
          fileSize: selfie.size,
          mimeType: selfie.type,
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