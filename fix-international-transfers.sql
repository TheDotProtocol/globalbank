-- Fix International Transfers Table in Supabase
-- This SQL handles existing constraints and creates missing ones safely

-- First, create the TransferStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TransferStatus" AS ENUM (
        'PENDING',
        'PROCESSING', 
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'REVERSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check if table exists, if not create it
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'international_transfers') THEN
        CREATE TABLE "international_transfers" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "accountId" TEXT NOT NULL,
            "transactionId" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'USD',
            "exchangeRate" DECIMAL(65,30) NOT NULL,
            "convertedAmount" DECIMAL(65,30) NOT NULL,
            "transferFee" DECIMAL(65,30) NOT NULL,
            "totalAmount" DECIMAL(65,30) NOT NULL,
            "beneficiaryName" TEXT NOT NULL,
            "beneficiaryAddress" TEXT,
            "beneficiaryCity" TEXT,
            "beneficiaryCountry" TEXT NOT NULL,
            "bankName" TEXT NOT NULL,
            "bankAddress" TEXT,
            "swiftCode" TEXT NOT NULL,
            "accountNumber" TEXT NOT NULL,
            "routingNumber" TEXT,
            "description" TEXT,
            "reference" TEXT NOT NULL,
            "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
            "estimatedDelivery" TIMESTAMP(3) NOT NULL,
            "completedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "international_transfers_pkey" PRIMARY KEY ("id")
        );
    END IF;
END $$;

-- Add missing columns if they don't exist
DO $$ BEGIN
    -- Add columns one by one, ignoring errors if they already exist
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "transactionId" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "exchangeRate" DECIMAL(65,30) NOT NULL DEFAULT 1;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "convertedAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "transferFee" DECIMAL(65,30) NOT NULL DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryName" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryAddress" TEXT;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryCity" TEXT;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryCountry" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "bankName" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "bankAddress" TEXT;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "swiftCode" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "routingNumber" TEXT;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "description" TEXT;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "reference" TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "status" "TransferStatus" NOT NULL DEFAULT 'PENDING';
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
    
    BEGIN
        ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    EXCEPTION WHEN duplicate_column THEN null;
    END;
END $$;

-- Create unique constraint on reference if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'international_transfers_reference_key') THEN
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_reference_key" UNIQUE ("reference");
    END IF;
END $$;

-- Create indexes for better performance (ignore if they exist)
CREATE INDEX IF NOT EXISTS "international_transfers_userId_idx" ON "international_transfers"("userId");
CREATE INDEX IF NOT EXISTS "international_transfers_accountId_idx" ON "international_transfers"("accountId");
CREATE INDEX IF NOT EXISTS "international_transfers_status_idx" ON "international_transfers"("status");
CREATE INDEX IF NOT EXISTS "international_transfers_createdAt_idx" ON "international_transfers"("createdAt");

-- Add foreign key constraints only if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'international_transfers_userId_fkey') THEN
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'international_transfers_accountId_fkey') THEN
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE "international_transfers" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop and recreate to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own international transfers" ON "international_transfers";
DROP POLICY IF EXISTS "Users can insert their own international transfers" ON "international_transfers";
DROP POLICY IF EXISTS "Users can update their own international transfers" ON "international_transfers";

CREATE POLICY "Users can view their own international transfers" ON "international_transfers"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own international transfers" ON "international_transfers"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own international transfers" ON "international_transfers"
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Grant necessary permissions
GRANT ALL ON "international_transfers" TO authenticated;
GRANT ALL ON "international_transfers" TO service_role;

-- Add comments for documentation
COMMENT ON TABLE "international_transfers" IS 'International transfer records with SWIFT code support';
COMMENT ON COLUMN "international_transfers"."swiftCode" IS 'SWIFT/BIC code for international bank identification';
COMMENT ON COLUMN "international_transfers"."exchangeRate" IS 'Exchange rate used for currency conversion';
COMMENT ON COLUMN "international_transfers"."convertedAmount" IS 'Amount after currency conversion';
COMMENT ON COLUMN "international_transfers"."transferFee" IS 'International transfer fee (typically 2%)';
COMMENT ON COLUMN "international_transfers"."estimatedDelivery" IS 'Estimated delivery time (1-3 business days)';
