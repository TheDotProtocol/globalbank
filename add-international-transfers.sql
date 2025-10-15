-- Add International Transfers Table to Supabase
-- This SQL file adds the international_transfers table and TransferStatus enum

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

-- Create the international_transfers table
CREATE TABLE IF NOT EXISTS "international_transfers" (
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

-- Create unique constraint on reference
CREATE UNIQUE INDEX IF NOT EXISTS "international_transfers_reference_key" ON "international_transfers"("reference");

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "international_transfers_userId_idx" ON "international_transfers"("userId");
CREATE INDEX IF NOT EXISTS "international_transfers_accountId_idx" ON "international_transfers"("accountId");
CREATE INDEX IF NOT EXISTS "international_transfers_status_idx" ON "international_transfers"("status");
CREATE INDEX IF NOT EXISTS "international_transfers_createdAt_idx" ON "international_transfers"("createdAt");

-- Add foreign key constraints
ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Enable Row Level Security (RLS)
ALTER TABLE "international_transfers" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for international_transfers
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
