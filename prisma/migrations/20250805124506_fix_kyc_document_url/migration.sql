-- Fix KYC documents table schema mismatch
-- Rename fileUrl to documentUrl to match Prisma schema

-- First, add the new column if it doesn't exist
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "documentUrl" TEXT;

-- Copy data from fileUrl to documentUrl if fileUrl exists
UPDATE kyc_documents SET "documentUrl" = "fileUrl" WHERE "fileUrl" IS NOT NULL AND "documentUrl" IS NULL;

-- Drop the old column if it exists
ALTER TABLE kyc_documents DROP COLUMN IF EXISTS "fileUrl";

-- Add other missing columns that are in the schema but not in the database
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "s3Key" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerificationToken" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorVerifiedAt" TIMESTAMP;

-- Add missing columns to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "accountId" TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "isVirtual" BOOLEAN DEFAULT FALSE;

-- Add missing columns to transactions table
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