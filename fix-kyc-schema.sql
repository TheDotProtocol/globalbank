-- Fix KYC Documents Schema
-- Add missing columns to kyc_documents table

-- Add s3Key column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "s3Key" TEXT;

-- Add fileName column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "fileName" TEXT;

-- Add fileSize column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;

-- Add mimeType column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "mimeType" TEXT;

-- Add verifiedBy column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT;

-- Add rejectionReason column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

-- Add notes column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "notes" TEXT;

-- Add isActive column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Add version column
ALTER TABLE "kyc_documents" 
ADD COLUMN IF NOT EXISTS "version" INTEGER DEFAULT 1;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'kyc_documents' 
ORDER BY ordinal_position; 