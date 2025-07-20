-- Fix KYC Document Schema - Add missing fields
-- Run this SQL script to add the enhanced fields to the kyc_documents table

-- Add missing columns to kyc_documents table
ALTER TABLE "kycDocuments" 
ADD COLUMN IF NOT EXISTS "fileName" TEXT,
ADD COLUMN IF NOT EXISTS "fileSize" INTEGER,
ADD COLUMN IF NOT EXISTS "mimeType" TEXT,
ADD COLUMN IF NOT EXISTS "verifiedBy" TEXT,
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "version" INTEGER DEFAULT 1;

-- Update DocumentType enum to include all new document types
-- First, create the new enum values
DO $$ 
BEGIN
    -- Add new document types to the enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'DocumentType') THEN
        CREATE TYPE "DocumentType" AS ENUM (
            'ID_PROOF',
            'ADDRESS_PROOF', 
            'INCOME_PROOF',
            'BANK_STATEMENT',
            'SELFIE_PHOTO',
            'LIVELINESS_VIDEO',
            'PASSPORT',
            'DRIVERS_LICENSE',
            'NATIONAL_ID',
            'UTILITY_BILL',
            'RENTAL_AGREEMENT',
            'EMPLOYMENT_LETTER',
            'PAYSLIP',
            'TAX_RETURN',
            'BUSINESS_LICENSE',
            'ARTICLES_OF_INCORPORATION',
            'PROOF_OF_FUNDS',
            'SOURCE_OF_WEALTH',
            'POLITICALLY_EXPOSED_PERSON',
            'SANCTIONS_CHECK'
        );
    ELSE
        -- Add new enum values if they don't exist
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SELFIE_PHOTO';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'LIVELINESS_VIDEO';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PASSPORT';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'DRIVERS_LICENSE';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'NATIONAL_ID';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'UTILITY_BILL';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'RENTAL_AGREEMENT';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'EMPLOYMENT_LETTER';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PAYSLIP';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'TAX_RETURN';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'BUSINESS_LICENSE';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'ARTICLES_OF_INCORPORATION';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'PROOF_OF_FUNDS';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SOURCE_OF_WEALTH';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'POLITICALLY_EXPOSED_PERSON';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
        
        BEGIN
            ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'SANCTIONS_CHECK';
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "kycDocuments_userId_idx" ON "kycDocuments"("userId");
CREATE INDEX IF NOT EXISTS "kycDocuments_status_idx" ON "kycDocuments"("status");
CREATE INDEX IF NOT EXISTS "kycDocuments_documentType_idx" ON "kycDocuments"("documentType");
CREATE INDEX IF NOT EXISTS "kycDocuments_uploadedAt_idx" ON "kycDocuments"("uploadedAt");

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'kycDocuments' 
ORDER BY ordinal_position;

-- Show current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'DocumentType')
ORDER BY enumsortorder; 