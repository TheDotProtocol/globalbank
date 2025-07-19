-- Fix DisputeStatus enum in database
-- Run this in Supabase SQL Editor

-- 1. Check if DisputeStatus enum exists
SELECT 'Checking DisputeStatus enum...' as info;

-- 2. Create DisputeStatus enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'disputestatus'
    ) THEN
        CREATE TYPE "DisputeStatus" AS ENUM ('NONE', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED');
        RAISE NOTICE 'Created DisputeStatus enum';
    ELSE
        RAISE NOTICE 'DisputeStatus enum already exists';
    END IF;
END $$;

-- 3. Add missing enum values to DisputeStatus if it exists
DO $$ 
BEGIN
    -- Add NONE if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
        AND enumlabel = 'NONE'
    ) THEN
        ALTER TYPE "DisputeStatus" ADD VALUE 'NONE';
        RAISE NOTICE 'Added NONE to DisputeStatus enum';
    ELSE
        RAISE NOTICE 'NONE already exists in DisputeStatus enum';
    END IF;
    
    -- Add PENDING if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
        AND enumlabel = 'PENDING'
    ) THEN
        ALTER TYPE "DisputeStatus" ADD VALUE 'PENDING';
        RAISE NOTICE 'Added PENDING to DisputeStatus enum';
    ELSE
        RAISE NOTICE 'PENDING already exists in DisputeStatus enum';
    END IF;
    
    -- Add UNDER_REVIEW if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
        AND enumlabel = 'UNDER_REVIEW'
    ) THEN
        ALTER TYPE "DisputeStatus" ADD VALUE 'UNDER_REVIEW';
        RAISE NOTICE 'Added UNDER_REVIEW to DisputeStatus enum';
    ELSE
        RAISE NOTICE 'UNDER_REVIEW already exists in DisputeStatus enum';
    END IF;
    
    -- Add RESOLVED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
        AND enumlabel = 'RESOLVED'
    ) THEN
        ALTER TYPE "DisputeStatus" ADD VALUE 'RESOLVED';
        RAISE NOTICE 'Added RESOLVED to DisputeStatus enum';
    ELSE
        RAISE NOTICE 'RESOLVED already exists in DisputeStatus enum';
    END IF;
    
    -- Add REJECTED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
        AND enumlabel = 'REJECTED'
    ) THEN
        ALTER TYPE "DisputeStatus" ADD VALUE 'REJECTED';
        RAISE NOTICE 'Added REJECTED to DisputeStatus enum';
    ELSE
        RAISE NOTICE 'REJECTED already exists in DisputeStatus enum';
    END IF;
END $$;

-- 4. Verify the DisputeStatus enum values
SELECT 'DisputeStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
ORDER BY enumsortorder;

-- 5. Check if transactions table has disputeStatus column
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' AND column_name = 'disputeStatus'
ORDER BY ordinal_position;

-- 6. Add disputeStatus column to transactions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'disputeStatus'
    ) THEN
        ALTER TABLE transactions ADD COLUMN "disputeStatus" "DisputeStatus" DEFAULT 'NONE';
        RAISE NOTICE 'Added disputeStatus column to transactions table';
    ELSE
        RAISE NOTICE 'disputeStatus column already exists in transactions table';
    END IF;
END $$; 