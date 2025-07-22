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

    console.log('✅ File validation passed, converting to base64...');

    // Convert files to base64 with better error handling
    let governmentIdBase64: string;
    let proofOfAddressBase64: string;
    let selfieBase64: string;

    try {
      governmentIdBase64 = await fileToBase64(governmentId);
      console.log('✅ Government ID converted to base64');
    } catch (error) {
      console.error('❌ Error converting government ID:', error);
      return NextResponse.json(
        { error: 'Failed to process government ID file' },
        { status: 500 }
      );
    }

    try {
      proofOfAddressBase64 = await fileToBase64(proofOfAddress);
      console.log('✅ Proof of address converted to base64');
    } catch (error) {
      console.error('❌ Error converting proof of address:', error);
      return NextResponse.json(
        { error: 'Failed to process proof of address file' },
        { status: 500 }
      );
    }

    try {
      selfieBase64 = await fileToBase64(selfie);
      console.log('✅ Selfie converted to base64');
    } catch (error) {
      console.error('❌ Error converting selfie:', error);
      return NextResponse.json(
        { error: 'Failed to process selfie file' },
        { status: 500 }
      );
    }

    console.log('📝 Creating KYC documents in database...');
    
    // Create KYC documents
    const documents = await Promise.all([
      // Government ID
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ID_PROOF',
          fileUrl: `data:${governmentId.type};base64,${governmentIdBase64}`,
          status: 'PENDING'
        }
      }),
      // Proof of Address
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'ADDRESS_PROOF',
          fileUrl: `data:${proofOfAddress.type};base64,${proofOfAddressBase64}`,
          status: 'PENDING'
        }
      }),
      // Selfie
      prisma.kycDocument.create({
        data: {
          userId: user.id,
          documentType: 'SELFIE_PHOTO',
          fileUrl: `data:${selfie.type};base64,${selfieBase64}`,
          status: 'PENDING'
        }
      })
    ]);

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
      documentsCount: documents.length
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