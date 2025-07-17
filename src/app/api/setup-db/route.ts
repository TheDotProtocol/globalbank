import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up database schema...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if email verification columns exist
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('emailVerified', 'emailVerifiedAt', 'emailVerificationToken')
    `;
    
    console.log('📋 Current user table columns:', tableInfo);
    
    // Add missing columns if they don't exist
    const existingColumns = tableInfo.map((col: any) => col.column_name);
    
    if (!existingColumns.includes('emailVerified')) {
      console.log('➕ Adding emailVerified column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerified" BOOLEAN DEFAULT false`;
      console.log('✅ emailVerified column added');
    }
    
    if (!existingColumns.includes('emailVerifiedAt')) {
      console.log('➕ Adding emailVerifiedAt column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerifiedAt" TIMESTAMP`;
      console.log('✅ emailVerifiedAt column added');
    }
    
    if (!existingColumns.includes('emailVerificationToken')) {
      console.log('➕ Adding emailVerificationToken column...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN "emailVerificationToken" TEXT`;
      console.log('✅ emailVerificationToken column added');
    }
    
    // Update existing users to have emailVerified = true (for backward compatibility)
    // Use raw SQL instead of Prisma to avoid schema validation issues
    console.log('🔄 Updating existing users...');
    await prisma.$executeRaw`
      UPDATE users 
      SET "emailVerified" = true, "emailVerifiedAt" = NOW() 
      WHERE "emailVerified" IS NULL OR "emailVerified" = false
    `;
    
    console.log(`✅ Updated existing users with email verification`);
    
    // Verify the setup
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    console.log('🎉 Database setup completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Database schema updated successfully',
      userCount
    });
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Database setup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 