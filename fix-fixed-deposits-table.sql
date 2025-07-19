-- Fix Fixed Deposits Table - Check and fix structure
-- Run this in Supabase SQL Editor

-- 1. Check current structure of the fixed_deposits table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fixed_deposits' 
ORDER BY ordinal_position;

-- 2. Check if accountId column exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fixed_deposits' AND column_name = 'accountId'
    ) THEN
        ALTER TABLE fixed_deposits ADD COLUMN "accountId" TEXT;
        RAISE NOTICE 'Added accountId column to fixed_deposits table';
    ELSE
        RAISE NOTICE 'accountId column already exists in fixed_deposits table';
    END IF;
END $$;

-- 3. Add any other missing columns
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fixed_deposits' AND column_name = 'status'
    ) THEN
        ALTER TABLE fixed_deposits ADD COLUMN "status" TEXT DEFAULT 'ACTIVE';
        RAISE NOTICE 'Added status column to fixed_deposits table';
    END IF;
    
    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fixed_deposits' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE fixed_deposits ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updatedAt column to fixed_deposits table';
    END IF;
END $$;

-- 4. Add foreign key constraints
DO $$ 
BEGIN
    -- Add foreign key constraint for accountId if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'fixed_deposits' 
        AND constraint_name = 'fixed_deposits_accountId_fkey'
    ) THEN
        ALTER TABLE fixed_deposits 
        ADD CONSTRAINT "fixed_deposits_accountId_fkey" 
        FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for accountId';
    END IF;
    
    -- Add foreign key constraint for userId if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'fixed_deposits' 
        AND constraint_name = 'fixed_deposits_userId_fkey'
    ) THEN
        ALTER TABLE fixed_deposits 
        ADD CONSTRAINT "fixed_deposits_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for userId';
    END IF;
END $$;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "fixed_deposits_userId_idx" ON "fixed_deposits"("userId");
CREATE INDEX IF NOT EXISTS "fixed_deposits_accountId_idx" ON "fixed_deposits"("accountId");

-- 6. Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fixed_deposits' 
ORDER BY ordinal_position;

-- 7. Check if there are any existing fixed deposits
SELECT COUNT(*) as total_fixed_deposits FROM fixed_deposits;

-- 8. Show sample data if any exists
SELECT id, amount, "interestRate", duration, "maturityDate", status, "userId", "accountId"
FROM fixed_deposits 
LIMIT 5; 