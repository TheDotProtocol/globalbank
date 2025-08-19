import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
  try {
    console.log('🔍 Test KYC Upload - Request received');
    
    // Check if it's multipart form data
    const contentType = request.headers.get('content-type');
    console.log('🔍 Content-Type:', contentType);
    
    if (contentType && contentType.includes('multipart/form-data')) {
      console.log('✅ Multipart form data detected');
      
      try {
        const formData = await request.formData();
        const keys = Array.from(formData.keys());
        console.log('📋 FormData keys:', keys);
        
        // Check for files
        const files = [];
        for (const key of keys) {
          const value = formData.get(key);
          if (value instanceof File) {
            files.push({
              name: value.name,
              type: value.type,
              size: value.size
            });
          }
        }
        
        console.log('📁 Files found:', files);
        
        return NextResponse.json({
          success: true,
          message: 'Test KYC upload successful',
          contentType,
          formDataKeys: keys,
          files
        });
        
      } catch (formDataError: any) {
        console.error('❌ FormData parsing error:', formDataError);
        return NextResponse.json({
          success: false,
          error: 'FormData parsing failed',
          details: formDataError.message
        }, { status: 400 });
      }
    } else {
      console.log('❌ Not multipart form data');
      return NextResponse.json({
        success: false,
        error: 'Expected multipart/form-data',
        contentType
      }, { status: 400 });
    }
    
  } catch (error: any) {
    console.error('❌ Test KYC upload error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
}; 