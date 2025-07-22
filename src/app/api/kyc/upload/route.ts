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

    console.log('📁 Files received:', {
      governmentId: governmentId?.name,
      proofOfAddress: proofOfAddress?.name,
      selfie: selfie?.name,
      additionalCount: additionalDocuments.length
    });

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
      console.log('❌ Invalid government ID type:', governmentId.type);
      return NextResponse.json(
        { error: 'Government ID must be an image (JPEG, PNG) or PDF' },
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(proofOfAddress.type)) {
      console.log('❌ Invalid proof of address type:', proofOfAddress.type);
      return NextResponse.json(
        { error: 'Proof of address must be an image (JPEG, PNG) or PDF' },
        { status: 400 }
      );
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selfie.type)) {
      console.log('❌ Invalid selfie type:', selfie.type);
      return NextResponse.json(
        { error: 'Selfie must be an image (JPEG, PNG)' },
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (governmentId.size > maxSize) {
      console.log('❌ Government ID too large:', governmentId.size);
      return NextResponse.json(
        { error: 'Government ID file size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (proofOfAddress.size > maxSize) {
      console.log('❌ Proof of address too large:', proofOfAddress.size);
      return NextResponse.json(
        { error: 'Proof of address file size must be less than 10MB' },
        { status: 400 }
      );
    }

    if (selfie.size > maxSize) {
      console.log('❌ Selfie too large:', selfie.size);
      return NextResponse.json(
        { error: 'Selfie file size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('✅ File validation passed, processing files...');

    // Process files with S3 upload and Base64 fallback
    const documents = await Promise.all([
      processDocument(governmentId, user.id, 'ID_PROOF'),
      processDocument(proofOfAddress, user.id, 'ADDRESS_PROOF'),
      processDocument(selfie, user.id, 'SELFIE_PHOTO')
    ]);

    console.log('✅ All documents processed successfully');

    // Create KYC documents in database
    const createdDocuments = await Promise.all(
      documents.map(doc => 
        prisma.kycDocument.create({
          data: {
            userId: user.id,
            documentType: doc.documentType as any,
            fileUrl: doc.fileUrl,
            s3Key: doc.s3Key,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            status: 'PENDING'
          }
        })
      )
    );

    console.log('✅ KYC documents created in database');

    // Update user KYC status to PENDING
    await prisma.user.update({
      where: { id: user.id },
      data: { kycStatus: 'PENDING' }
    });

    console.log('✅ User KYC status updated to PENDING');

    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted successfully',
      documentsCount: createdDocuments.length,
      storageMethod: 'S3 with Base64 fallback'
    });

  } catch (error: any) {
    console.error('❌ Error in KYC upload:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to upload KYC documents', 
        details: error.message 
      },
      { status: 500 }
    );
  }
});

// Helper function to process document with S3 upload and Base64 fallback
async function processDocument(file: File, userId: string, documentType: string) {
  try {
    console.log(`📤 Attempting S3 upload for ${documentType}...`);
    
    // Convert file to buffer for S3 upload
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    // Try S3 upload first
    const s3Result = await uploadFileToS3(fileBuffer, file.name, userId, documentType);
    
    console.log(`✅ S3 upload successful for ${documentType}:`, s3Result.key);
    
    return {
      documentType,
      fileUrl: s3Result.url,
      s3Key: s3Result.key,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      storageMethod: 'S3'
    };
    
  } catch (s3Error) {
    console.warn(`⚠️ S3 upload failed for ${documentType}, falling back to Base64:`, s3Error);
    
    // Fallback to Base64
    try {
      const base64 = await fileToBase64(file);
      console.log(`✅ Base64 fallback successful for ${documentType}`);
      
      return {
        documentType,
        fileUrl: `data:${file.type};base64,${base64}`,
        s3Key: null,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storageMethod: 'Base64'
      };
      
    } catch (base64Error: any) {
      console.error(`❌ Both S3 and Base64 failed for ${documentType}:`, base64Error);
      throw new Error(`Failed to process ${documentType}: ${base64Error.message}`);
    }
  }
}

// Helper function to convert file to base64 with better error handling
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = () => {
        try {
          const result = reader.result as string;
          if (!result) {
            reject(new Error('FileReader result is empty'));
            return;
          }
          
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = result.split(',')[1];
          if (!base64) {
            reject(new Error('Invalid data URL format'));
            return;
          }
          
          resolve(base64);
        } catch (error) {
          reject(new Error(`Error processing file result: ${error}`));
        }
      };
      
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(new Error(`FileReader error: ${error}`));
      };
      
      reader.onabort = () => {
        reject(new Error('File reading was aborted'));
      };
      
      // Start reading the file
      reader.readAsDataURL(file);
      
    } catch (error) {
      reject(new Error(`Error setting up FileReader: ${error}`));
    }
  });
} 