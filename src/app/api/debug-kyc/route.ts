import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const GET = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    console.log('🔍 Debug KYC - User info:', {
      id: user.id,
      email: user.email,
      kycStatus: user.kycStatus
    });

    // Check existing KYC documents
    const existingDocuments = await prisma.kycDocument.findMany({
      where: { userId: user.id }
    });

    console.log('📋 Existing KYC documents:', existingDocuments.length);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        kycStatus: user.kycStatus
      },
      existingDocuments: existingDocuments.length,
      documents: existingDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        status: doc.status,
        fileName: doc.fileName,
        version: doc.version
      }))
    });

  } catch (error: any) {
    console.error('❌ Debug KYC error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error.message },
      { status: 500 }
    );
  }
});

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const user = (request as any).user;
    
    console.log('🔍 Debug KYC POST - Testing file processing...');

    // Test file processing without actual files
    const testData = {
      userId: user.id,
      documentType: 'ID_PROOF',
      fileName: 'test.jpg',
      fileSize: 1024,
      mimeType: 'image/jpeg'
    };

    console.log('✅ Test data prepared:', testData);

    return NextResponse.json({
      success: true,
      message: 'Debug test completed',
      testData
    });

  } catch (error: any) {
    console.error('❌ Debug KYC POST error:', error);
    return NextResponse.json(
      { error: 'Debug POST failed', details: error.message },
      { status: 500 }
    );
  }
}); 