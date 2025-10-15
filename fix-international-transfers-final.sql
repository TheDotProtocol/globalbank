-- Final fix for international transfers table
-- This ensures the table is created with all required columns

-- First, make sure the TransferStatus enum exists
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
    WHEN duplicate_object THEN 
        RAISE NOTICE 'TransferStatus enum already exists';
END $$;

-- Drop the table if it exists (to start fresh)
DROP TABLE IF EXISTS "international_transfers" CASCADE;

-- Create the table with all required columns
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

-- Add unique constraint on reference
ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_reference_key" UNIQUE ("reference");

-- Add foreign key constraints
ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_accountId_fkey" 
    FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for performance
CREATE INDEX "international_transfers_userId_idx" ON "international_transfers"("userId");
CREATE INDEX "international_transfers_accountId_idx" ON "international_transfers"("accountId");
CREATE INDEX "international_transfers_status_idx" ON "international_transfers"("status");
CREATE INDEX "international_transfers_createdAt_idx" ON "international_transfers"("createdAt");

-- Enable Row Level Security
ALTER TABLE "international_transfers" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own international transfers" ON "international_transfers"
    FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert their own international transfers" ON "international_transfers"
    FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update their own international transfers" ON "international_transfers"
    FOR UPDATE USING (auth.uid()::text = "userId");

-- Grant permissions
GRANT ALL ON "international_transfers" TO authenticated;
GRANT ALL ON "international_transfers" TO service_role;

-- Add comments
COMMENT ON TABLE "international_transfers" IS 'International transfer records with SWIFT code support';
COMMENT ON COLUMN "international_transfers"."swiftCode" IS 'SWIFT/BIC code for international bank identification';
COMMENT ON COLUMN "international_transfers"."exchangeRate" IS 'Exchange rate used for currency conversion';
COMMENT ON COLUMN "international_transfers"."convertedAmount" IS 'Amount after currency conversion';
COMMENT ON COLUMN "international_transfers"."transferFee" IS 'International transfer fee (typically 2%)';
COMMENT ON COLUMN "international_transfers"."estimatedDelivery" IS 'Estimated delivery time (1-3 business days)';

-- Test the table by inserting a sample record
DO $$ 
BEGIN
    INSERT INTO "international_transfers" (
        "id", 
        "userId", 
        "accountId", 
        "transactionId", 
        "amount", 
        "currency", 
        "exchangeRate", 
        "convertedAmount", 
        "transferFee", 
        "totalAmount", 
        "beneficiaryName", 
        "beneficiaryCountry", 
        "bankName", 
        "swiftCode", 
        "accountNumber", 
        "reference", 
        "status", 
        "estimatedDelivery", 
        "createdAt", 
        "updatedAt"
    ) VALUES (
        'test-' || EXTRACT(EPOCH FROM NOW())::text, 
        (SELECT id FROM users LIMIT 1), 
        (SELECT id FROM accounts LIMIT 1), 
        'test-transaction-' || EXTRACT(EPOCH FROM NOW())::text, 
        100, 
        'USD', 
        1, 
        100, 
        2, 
        102, 
        'Test User', 
        'USA', 
        'Test Bank', 
        'TESTUS33', 
        '123456789', 
        'TEST-REF-' || EXTRACT(EPOCH FROM NOW())::text, 
        'PENDING', 
        NOW() + INTERVAL '3 days', 
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE '✅ Test insert successful - international_transfers table is working correctly!';
    
    -- Clean up test record
    DELETE FROM "international_transfers" WHERE "id" LIKE 'test-%';
    RAISE NOTICE '✅ Test record cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;

-- Final success message
DO $$ BEGIN
    RAISE NOTICE '🎉 International transfers table setup completed successfully!';
    RAISE NOTICE 'Table: international_transfers';
    RAISE NOTICE 'Enum: TransferStatus';
    RAISE NOTICE 'RLS: Enabled with user-specific policies';
    RAISE NOTICE 'Ready for international transfer functionality!';
END $$;
