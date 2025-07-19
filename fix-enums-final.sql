-- Final Fix for Enums - Add only missing values
-- Run this in Supabase SQL Editor

-- 1. Check current TransactionType enum values
SELECT 'Current TransactionType values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
ORDER BY enumsortorder;

-- 2. Add only missing TransactionType values
DO $$ 
BEGIN
    -- Add CREDIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'CREDIT'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'CREDIT';
        RAISE NOTICE 'Added CREDIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'CREDIT already exists in TransactionType enum';
    END IF;
    
    -- Add DEBIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'DEBIT'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEBIT';
        RAISE NOTICE 'Added DEBIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEBIT already exists in TransactionType enum';
    END IF;
    
    -- Add WITHDRAWAL if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'WITHDRAWAL'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'WITHDRAWAL';
        RAISE NOTICE 'Added WITHDRAWAL to TransactionType enum';
    ELSE
        RAISE NOTICE 'WITHDRAWAL already exists in TransactionType enum';
    END IF;
    
    -- Add DEPOSIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'DEPOSIT'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEPOSIT';
        RAISE NOTICE 'Added DEPOSIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEPOSIT already exists in TransactionType enum';
    END IF;
END $$;

-- 3. Check current TransactionStatus enum values
SELECT 'Current TransactionStatus values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
ORDER BY enumsortorder;

-- 4. Add only missing TransactionStatus values
DO $$ 
BEGIN
    -- Add PENDING if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'PENDING'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'PENDING';
        RAISE NOTICE 'Added PENDING to TransactionStatus enum';
    ELSE
        RAISE NOTICE 'PENDING already exists in TransactionStatus enum';
    END IF;
    
    -- Add COMPLETED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'COMPLETED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'COMPLETED';
        RAISE NOTICE 'Added COMPLETED to TransactionStatus enum';
    ELSE
        RAISE NOTICE 'COMPLETED already exists in TransactionStatus enum';
    END IF;
    
    -- Add FAILED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'FAILED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'FAILED';
        RAISE NOTICE 'Added FAILED to TransactionStatus enum';
    ELSE
        RAISE NOTICE 'FAILED already exists in TransactionStatus enum';
    END IF;
    
    -- Add CANCELLED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'CANCELLED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'CANCELLED';
        RAISE NOTICE 'Added CANCELLED to TransactionStatus enum';
    ELSE
        RAISE NOTICE 'CANCELLED already exists in TransactionStatus enum';
    END IF;
END $$;

-- 5. Check current DepositStatus enum values
SELECT 'Current DepositStatus values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
ORDER BY enumsortorder;

-- 6. Add only missing DepositStatus values
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
    ELSE
        RAISE NOTICE 'ACTIVE already exists in DepositStatus enum';
    END IF;
    
    -- Add MATURED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'MATURED'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'MATURED';
        RAISE NOTICE 'Added MATURED to DepositStatus enum';
    ELSE
        RAISE NOTICE 'MATURED already exists in DepositStatus enum';
    END IF;
    
    -- Add WITHDRAWN if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'WITHDRAWN'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'WITHDRAWN';
        RAISE NOTICE 'Added WITHDRAWN to DepositStatus enum';
    ELSE
        RAISE NOTICE 'WITHDRAWN already exists in DepositStatus enum';
    END IF;
    
    -- Add CANCELLED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
        AND enumlabel = 'CANCELLED'
    ) THEN
        ALTER TYPE "DepositStatus" ADD VALUE 'CANCELLED';
        RAISE NOTICE 'Added CANCELLED to DepositStatus enum';
    ELSE
        RAISE NOTICE 'CANCELLED already exists in DepositStatus enum';
    END IF;
END $$;

-- 7. Final verification of all enum values
SELECT 'Final TransactionType values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
ORDER BY enumsortorder;

SELECT 'Final TransactionStatus values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
ORDER BY enumsortorder;

SELECT 'Final DepositStatus values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
ORDER BY enumsortorder; 