const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runDeploymentMigration() {
  try {
    console.log('🚀 Starting deployment migration...');
    
    // Check if we're in production
    const isProduction = process.env.NODE_ENV === 'production';
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Generate Prisma client first
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // Test database connection
    console.log('🧪 Testing database connection...');
    const userCount = await prisma.user.count();
    console.log(`✅ Database connected! Found ${userCount} users`);
    
    // Try to run migrations, but handle the case where database already has tables
    console.log('📦 Attempting to run Prisma migrations...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Prisma migrations completed successfully');
    } catch (migrationError) {
      console.log('⚠️ Prisma migration failed, applying manual schema fixes...');
      
      // Apply comprehensive schema fixes
      console.log('🔧 Applying comprehensive schema fixes...');
      
      // Fix KYC documents table
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileName" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "s3Key" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "notes" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      // Fix users table
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT FALSE;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT FALSE;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      // Fix cards table
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "accountId" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "isVirtual" BOOLEAN DEFAULT FALSE;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "dailyLimit" DECIMAL(65,30) DEFAULT 1000;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "monthlyLimit" DECIMAL(65,30) DEFAULT 10000;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE cards ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;
      `;
      
      // Fix transactions table
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "transferMode" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountId" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountId" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountNumber" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountNumber" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountHolder" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountHolder" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "transferFee" DECIMAL(65,30) DEFAULT 0;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "netAmount" DECIMAL(65,30);
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "isDisputed" BOOLEAN DEFAULT FALSE;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeReason" TEXT;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeStatus" TEXT DEFAULT 'NONE';
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeCreatedAt" TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeResolvedAt" TIMESTAMP;
      `;
      
      await prisma.$executeRaw`
        ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeResolution" TEXT;
      `;
      
      // Fix accounts table
      await prisma.$executeRaw`
        ALTER TABLE accounts ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      // Fix fixed_deposits table
      await prisma.$executeRaw`
        ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      `;
      
      // Check if fileUrl column exists before trying to copy data
      const fileUrlExists = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.columns 
        WHERE table_name = 'kyc_documents' AND column_name = 'fileUrl'
      `;
      
      if (fileUrlExists[0].count > 0) {
        console.log('📄 Found fileUrl column, copying data to documentUrl...');
        await prisma.$executeRaw`
          UPDATE kyc_documents SET "documentUrl" = "fileUrl" WHERE "fileUrl" IS NOT NULL AND "documentUrl" IS NULL;
        `;
        
        await prisma.$executeRaw`
          ALTER TABLE kyc_documents DROP COLUMN IF EXISTS "fileUrl";
        `;
      } else {
        console.log('✅ documentUrl column already exists, no need to copy data');
      }
      
      console.log('✅ Comprehensive schema fixes applied successfully');
    }
    
    // Test KYC documents query specifically
    console.log('📄 Testing KYC documents query...');
    const kycDocs = await prisma.kycDocument.findMany({
      take: 1,
      select: {
        id: true,
        documentType: true,
        documentUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });
    console.log(`✅ KYC documents query successful! Found ${kycDocs.length} documents`);
    
    console.log('🎉 Deployment migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Deployment migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runDeploymentMigration();
}

module.exports = { runDeploymentMigration }; 