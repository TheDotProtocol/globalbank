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

      return NextResponse.json(
        { error: 'All required documents must be uploaded' },
        { status: 400 }
      );
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    
        { status: 400 }
      );
    }

    if (!allowedTypes.includes(proofOfAddress.type)) {
        { status: 400 }
      );
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(selfie.type)) {
        { status: 400 }
      );
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    
        { status: 400 }
      );
    }

    if (proofOfAddress.size > maxSize) {
        { status: 400 }
      );
    }

    if (selfie.size > maxSize) {
        { status: 400 }
      );
    }


    return NextResponse.json({
      success: true,
      message: 'KYC documents submitted successfully',
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
