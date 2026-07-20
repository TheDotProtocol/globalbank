const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function applyRegulatorySchema(prisma) {
  console.log('🏛️ Applying regulatory schema (audit, settlement, reports)...');

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      "actorType" TEXT NOT NULL,
      "actorId" TEXT,
      "actorEmail" TEXT,
      action TEXT NOT NULL,
      "entityType" TEXT NOT NULL,
      "entityId" TEXT,
      "beforeState" JSONB,
      "afterState" JSONB,
      "ipAddress" TEXT,
      "userAgent" TEXT,
      metadata JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ledger_accounts (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      balance DECIMAL(65,30) NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS settlement_records (
      id TEXT PRIMARY KEY,
      "transactionId" TEXT UNIQUE,
      reference TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      amount DECIMAL(65,30) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      "settledAt" TIMESTAMP(3),
      "externalRef" TEXT,
      metadata JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      "journalId" TEXT NOT NULL,
      "ledgerAccountId" TEXT NOT NULL REFERENCES ledger_accounts(id),
      debit DECIMAL(65,30) NOT NULL DEFAULT 0,
      credit DECIMAL(65,30) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USD',
      description TEXT NOT NULL,
      "transactionId" TEXT,
      "settlementId" TEXT REFERENCES settlement_records(id),
      "createdBy" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS regulatory_reports (
      id TEXT PRIMARY KEY,
      "reportType" TEXT NOT NULL,
      jurisdiction TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'DRAFT',
      reference TEXT UNIQUE NOT NULL,
      "transactionIds" JSONB,
      "userId" TEXT,
      "filedBy" TEXT NOT NULL,
      "filedAt" TIMESTAMP(3),
      content JSONB NOT NULL,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS pending_manual_entries (
      id TEXT PRIMARY KEY,
      "createdBy" TEXT NOT NULL,
      "approvedBy" TEXT,
      status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
      "entryType" TEXT NOT NULL,
      payload JSONB NOT NULL,
      notes TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "approvedAt" TIMESTAMP(3),
      "executedAt" TIMESTAMP(3)
    );
  `);

  const accounts = [
    { code: '1100', name: 'Settlement Suspense', type: 'ASSET' },
    { code: '2100', name: 'Customer Deposits', type: 'LIABILITY' },
    { code: '2200', name: 'Nostro Payable', type: 'LIABILITY' },
    { code: '4100', name: 'Fee Income', type: 'REVENUE' },
    { code: '5100', name: 'Operating Expenses', type: 'EXPENSE' },
  ];

  for (const acct of accounts) {
    const existing = await prisma.ledgerAccount.findUnique({ where: { code: acct.code } }).catch(() => null);
    if (!existing) {
      try {
        await prisma.ledgerAccount.create({
          data: { code: acct.code, name: acct.name, type: acct.type, currency: 'USD' },
        });
      } catch (_) {
        /* may already exist */
      }
    }
  }

  console.log('✅ Regulatory schema ready');
}

async function runDeploymentMigration() {
  let prisma;

  try {
    console.log('🚀 Starting deployment migration...');
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    if (!process.env.DATABASE_URL) {
      console.warn('⚠️ DATABASE_URL is not set — skipping database migration.');
      console.warn('   Add DATABASE_URL in Vercel → Project → Settings → Environment Variables (Production + Preview).');
      console.warn('   Build will continue; the app requires DATABASE_URL at runtime.');
      return;
    }

    prisma = new PrismaClient();

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

      await applyRegulatorySchema(prisma);
    }
    
    // Ensure regulatory tables exist even when migrations succeed
    if (prisma) {
      await applyRegulatorySchema(prisma);
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
    if (prisma) await prisma.$disconnect();
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runDeploymentMigration();
}

module.exports = { runDeploymentMigration, applyRegulatorySchema }; 