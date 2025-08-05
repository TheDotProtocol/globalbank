-- Comprehensive fix for all missing database columns
-- This will add all columns that the Prisma schema expects but are missing from the database

-- Fix KYC documents table - add all missing columns
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "s3Key" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Fix users table - add all missing columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Fix cards table - add all missing columns
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "isVirtual" BOOLEAN DEFAULT FALSE;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "dailyLimit" DECIMAL(65,30) DEFAULT 1000;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "monthlyLimit" DECIMAL(65,30) DEFAULT 10000;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;

-- Fix transactions table - add all missing columns
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "transferMode" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountId" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountId" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountNumber" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountNumber" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "sourceAccountHolder" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "destinationAccountHolder" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "transferFee" DECIMAL(65,30) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "netAmount" DECIMAL(65,30);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "isDisputed" BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeReason" TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeStatus" TEXT DEFAULT 'NONE';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeCreatedAt" TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeResolvedAt" TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS "disputeResolution" TEXT;

-- Fix accounts table - add all missing columns
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Fix fixed_deposits table - add all missing columns
ALTER TABLE fixed_deposits ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Copy data from fileUrl to documentUrl if fileUrl exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'kyc_documents' AND column_name = 'fileUrl') THEN
        UPDATE kyc_documents SET "documentUrl" = "fileUrl" WHERE "fileUrl" IS NOT NULL AND "documentUrl" IS NULL;
        ALTER TABLE kyc_documents DROP COLUMN IF EXISTS "fileUrl";
    END IF;
END $$;

-- Verify the fix worked
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as kyc_docs_count FROM kyc_documents;
SELECT COUNT(*) as cards_count FROM cards;
SELECT COUNT(*) as transactions_count FROM transactions; 