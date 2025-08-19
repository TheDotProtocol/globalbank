import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadFileToS3 } from '@/lib/s3';

export const POST = requireAuth(async (request: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const user = (request as any).user;
    const checkId = params.id;

    console.log('🔍 E-Check signature upload request for check:', checkId);

    // Verify check ownership
    const check = await prisma.eCheck.findFirst({
      where: {
        id: checkId,
        userId: user.id
      }
    });

    if (!check) {
      return NextResponse.json(
        { error: 'E-Check not found or access denied' },
        { status: 404 }
      );
    }

    if (check.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'E-Check is not in pending status' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const signatureFile = formData.get('signature') as File;

    if (!signatureFile) {
      return NextResponse.json(
        { error: 'Signature file is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(signatureFile.type)) {
      return NextResponse.json(
        { error: 'Signature must be an image (JPEG, PNG)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (signatureFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Signature file size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Upload to S3
    const buffer = await signatureFile.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    const s3Result = await uploadFileToS3(
      fileBuffer, 
      `echeck-signatures/${checkId}/${signatureFile.name}`, 
      user.id, 
      'SIGNATURE'
    );

    // Update check with signature URL
    const updatedCheck = await prisma.eCheck.update({
      where: { id: checkId },
      data: {
        signatureUrl: s3Result.url,
        status: 'SIGNED',
        updatedAt: new Date()
      }
    });

    console.log('✅ E-Check signature uploaded successfully');

    return NextResponse.json({
      success: true,
      message: 'Signature uploaded successfully',
      check: {
        id: updatedCheck.id,
        checkNumber: updatedCheck.checkNumber,
        signatureUrl: updatedCheck.signatureUrl,
        status: updatedCheck.status
      }
    });

  } catch (error: any) {
    console.error('❌ E-Check signature upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload signature', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}); 