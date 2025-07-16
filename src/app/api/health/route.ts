import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Debug: Log the DATABASE_URL (masked for security)
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl ? `${dbUrl.split('@')[0]}@***` : 'NOT_SET';
    console.log('DATABASE_URL:', maskedUrl);
    
    // Test database connection with retry logic for prepared statement errors
    let userCount = 0;
    let retries = 3;
    
    while (retries > 0) {
      try {
        userCount = await prisma.user.count();
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        console.log(`Database query attempt failed, retries left: ${retries}`);
        
        if (error?.message?.includes('prepared statement') && retries > 0) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        
        // If it's not a prepared statement error or no retries left, throw
        throw error;
      }
    }
    
    // Check environment variables
    const envCheck = {
      database: !!process.env.DATABASE_URL,
      jwt: !!process.env.JWT_SECRET,
      smtp: {
        host: !!process.env.SMTP_HOST,
        user: !!process.env.SMTP_USER,
        pass: !!process.env.SMTP_PASS
      },
      stripe: {
        secret: !!process.env.STRIPE_SECRET_KEY,
        publishable: !!process.env.STRIPE_PUBLISHABLE_KEY
      },
      openai: !!process.env.OPENAI_API_KEY
    };

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      environment: envCheck,
      dbUrlMasked: maskedUrl,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    const dbUrl = process.env.DATABASE_URL;
    const maskedUrl = dbUrl ? `${dbUrl.split('@')[0]}@***` : 'NOT_SET';
    
    return NextResponse.json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
      dbUrlMasked: maskedUrl,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 