-- Fix DepositStatus enum in database
-- Run this in Supabase SQL Editor

-- 1. Check current enum values for DepositStatus
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus');

-- 2. Add missing enum values to DepositStatus
DO $$ 
BEGIN
    -- Add ACTIVE if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'ACTIVE'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'ACTIVE';
        RAISE NOTICE 'Added ACTIVE to DepositStatus enum';
    END IF;
    
    -- Add MATURED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'MATURED'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'MATURED';
        RAISE NOTICE 'Added MATURED to DepositStatus enum';
    END IF;
    
    -- Add WITHDRAWN if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'WITHDRAWN'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'WITHDRAWN';
        RAISE NOTICE 'Added WITHDRAWN to DepositStatus enum';
    END IF;
    
    -- Add CANCELLED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'CANCELLED'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'CANCELLED';
        RAISE NOTICE 'Added CANCELLED to DepositStatus enum';
    END IF;
END $$;

-- 3. Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
ORDER BY enumsortorder;

-- 4. Update the status column to use the enum type
ALTER TABLE fixed_deposits 
ALTER COLUMN "status" TYPE "DepositStatus" 
USING "status"::"DepositStatus";

-- 5. Set default value
ALTER TABLE fixed_deposits 
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- 6. Check the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fixed_deposits' 
ORDER BY ordinal_position; 