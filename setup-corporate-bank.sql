-- Create CorporateBank table
CREATE TABLE IF NOT EXISTS "corporate_banks" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountHolderName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "routingNumber" TEXT,
    "swiftCode" TEXT,
    "iban" TEXT,
    "branchCode" TEXT,
    "accountType" TEXT NOT NULL DEFAULT 'BUSINESS',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "dailyLimit" DECIMAL(65,30) NOT NULL DEFAULT 100000,
    "monthlyLimit" DECIMAL(65,30) NOT NULL DEFAULT 1000000,
    "transferFee" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "apiEnabled" BOOLEAN NOT NULL DEFAULT false,
    "apiEndpoint" TEXT,
    "apiKey" TEXT,
    "webhookUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corporate_banks_pkey" PRIMARY KEY ("id")
);

-- Create BankTransfer table
CREATE TABLE IF NOT EXISTS "bank_transfers" (
    "id" TEXT NOT NULL,
    "corporateBankId" TEXT NOT NULL,
    "fromAccountId" TEXT,
    "toAccountNumber" TEXT NOT NULL,
    "toAccountName" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "transferType" TEXT NOT NULL DEFAULT 'INBOUND',
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

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "corporate_banks_accountNumber_key" ON "corporate_banks"("accountNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "bank_transfers_reference_key" ON "bank_transfers"("reference");

-- Create foreign key constraints
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_corporateBankId_fkey" FOREIGN KEY ("corporateBankId") REFERENCES "corporate_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bank_transfers" ADD CONSTRAINT "bank_transfers_fromAccountId_fkey" FOREIGN KEY ("fromAccountId") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create enums if they don't exist
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

-- Insert Kasikorn Bank corporate account
INSERT INTO "corporate_banks" (
    "id",
    "bankName",
    "accountHolderName", 
    "accountNumber",
    "swiftCode",
    "accountType",
    "currency",
    "isActive",
    "dailyLimit",
    "monthlyLimit",
    "transferFee",
    "createdAt",
    "updatedAt"
) VALUES (
    'kasikorn_bank_001',
    'Kasikorn Bank',
    'The Dotprotocol Co ., Ltd',
    '198-1-64757-9',
    'KASITHBK',
    'CURRENT',
    'THB',
    true,
    1000000,  -- 1M THB daily limit
    10000000, -- 10M THB monthly limit
    0,        -- No transfer fee
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON CONFLICT ("accountNumber") DO UPDATE SET
    "bankName" = EXCLUDED."bankName",
    "accountHolderName" = EXCLUDED."accountHolderName",
    "swiftCode" = EXCLUDED."swiftCode",
    "accountType" = EXCLUDED."accountType",
    "currency" = EXCLUDED."currency",
    "isActive" = EXCLUDED."isActive",
    "dailyLimit" = EXCLUDED."dailyLimit",
    "monthlyLimit" = EXCLUDED."monthlyLimit",
    "transferFee" = EXCLUDED."transferFee",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Add bankTransfers relation to accounts table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'accounts' AND column_name = 'bankTransfers'
    ) THEN
        -- This is handled by Prisma, but we can add a comment for reference
        COMMENT ON TABLE "accounts" IS 'Accounts table with bankTransfers relation';
    END IF;
END $$; 