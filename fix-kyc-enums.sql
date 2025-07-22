-- Fix KYC Enums
-- Add missing enums for KYC documents

-- Create DocumentType enum
DO $$ BEGIN
    CREATE TYPE "DocumentType" AS ENUM (
        'ID_PROOF',
        'ADDRESS_PROOF', 
        'SELFIE_PHOTO',
        'INCOME_PROOF',
        'BANK_STATEMENT',
        'UTILITY_BILL',
        'PASSPORT',
        'DRIVERS_LICENSE',
        'NATIONAL_ID',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create DocumentStatus enum
DO $$ BEGIN
    CREATE TYPE "DocumentStatus" AS ENUM (
        'PENDING',
        'VERIFIED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create KycStatus enum (if not exists)
DO $$ BEGIN
    CREATE TYPE "KycStatus" AS ENUM (
        'PENDING',
        'VERIFIED',
        'REJECTED',
        'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Verify the enums exist
SELECT typname, typtype 
FROM pg_type 
WHERE typname IN ('DocumentType', 'DocumentStatus', 'KycStatus'); 