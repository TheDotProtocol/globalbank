-- Fix KYC documents table schema mismatch
-- Rename fileUrl to documentUrl to match Prisma schema

-- First, add the new column
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS documentUrl TEXT;

-- Copy data from fileUrl to documentUrl
UPDATE kyc_documents SET documentUrl = fileUrl WHERE fileUrl IS NOT NULL;

-- Drop the old column
ALTER TABLE kyc_documents DROP COLUMN IF EXISTS fileUrl;

-- Add other missing columns that are in the schema but not in the database
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS fileName TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS fileSize INTEGER;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS mimeType TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS s3Key TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS rejectionReason TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS verifiedBy TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS emailVerified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emailVerifiedAt TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emailVerificationToken TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twoFactorSecret TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twoFactorEnabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS twoFactorVerifiedAt TIMESTAMP;

-- Add missing columns to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS accountId TEXT;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE';
ALTER TABLE cards ADD COLUMN IF NOT EXISTS isVirtual BOOLEAN DEFAULT FALSE;

-- Add missing columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transferMode TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sourceAccountId TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS destinationAccountId TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sourceAccountNumber TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS destinationAccountNumber TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS sourceAccountHolder TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS destinationAccountHolder TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS transferFee DECIMAL(65,30) DEFAULT 0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS netAmount DECIMAL(65,30);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS isDisputed BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disputeReason TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disputeStatus TEXT DEFAULT 'NONE';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disputeCreatedAt TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disputeResolvedAt TIMESTAMP;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS disputeResolution TEXT;

-- Add missing enums
DO $$ BEGIN
    CREATE TYPE "TransferMode" AS ENUM ('INTERNAL_TRANSFER', 'EXTERNAL_TRANSFER', 'WIRE_TRANSFER', 'ACH_TRANSFER', 'CARD_TRANSFER', 'MOBILE_TRANSFER', 'INTERNATIONAL_TRANSFER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'BLOCKED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add missing document types to DocumentType enum
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SELFIE_PHOTO';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'LIVELINESS_VIDEO';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PASSPORT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DRIVERS_LICENSE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'NATIONAL_ID';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'UTILITY_BILL';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RENTAL_AGREEMENT';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EMPLOYMENT_LETTER';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PAYSLIP';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'TAX_RETURN';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'BUSINESS_LICENSE';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ARTICLES_OF_INCORPORATION';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PROOF_OF_FUNDS';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SOURCE_OF_WEALTH';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'POLITICALLY_EXPOSED_PERSON';
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SANCTIONS_CHECK';

-- Create missing tables
CREATE TABLE IF NOT EXISTS "e_checks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "payeeName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "memo" TEXT,
    "signatureUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "clearedAt" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "e_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "corporate_banks" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "swiftCode" TEXT NOT NULL,
    "bicCode" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "transferFee" DECIMAL(65,30) NOT NULL DEFAULT 50,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_banks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bank_transfers" (
    "id" TEXT NOT NULL,
    "corporateBankId" TEXT NOT NULL,
    "fromAccountId" TEXT,
    "toAccountNumber" TEXT NOT NULL,
    "toAccountName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'THB',
    "transferType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "fee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "netAmount" DECIMAL(65,30),
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_transfers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentMethod" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- Add missing enums for new tables
DO $$ BEGIN
    CREATE TYPE "CheckStatus" AS ENUM ('PENDING', 'SIGNED', 'CLEARED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BankTransferType" AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BankTransferStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REVERSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'BANK_TRANSFER', 'THAI_QR', 'WIRE_TRANSFER', 'MOBILE_PAYMENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add foreign key constraints
ALTER TABLE "e_checks" ADD CONSTRAINT "e_checks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "e_checks" ADD CONSTRAINT "e_checks_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_corporateBankId_fkey" FOREIGN KEY ("corporateBankId") REFERENCES "corporate_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add unique constraints
ALTER TABLE "e_checks" ADD CONSTRAINT "e_checks_checkNumber_key" UNIQUE ("checkNumber");
ALTER TABLE "corporate_banks" ADD CONSTRAINT "corporate_banks_accountNumber_key" UNIQUE ("accountNumber");
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_reference_key" UNIQUE ("reference");
ALTER TABLE "payments" ADD CONSTRAINT "payments_reference_key" UNIQUE ("reference");

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_e_checks_userId" ON "e_checks"("userId");
CREATE INDEX IF NOT EXISTS "idx_e_checks_accountId" ON "e_checks"("accountId");
CREATE INDEX IF NOT EXISTS "idx_bank_transfers_corporateBankId" ON "bank_transfers"("corporateBankId");
CREATE INDEX IF NOT EXISTS "idx_bank_transfers_fromAccountId" ON "bank_transfers"("fromAccountId");
CREATE INDEX IF NOT EXISTS "idx_payments_userId" ON "payments"("userId");
CREATE INDEX IF NOT EXISTS "idx_payments_accountId" ON "payments"("accountId"); 