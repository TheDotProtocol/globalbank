-- Fix Transaction Enums in database
-- Run this in Supabase SQL Editor

-- 1. Check current enum values for TransactionType
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype');

-- 2. Add missing enum values to TransactionType
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
    END IF;
    
    -- Add DEBIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'DEBIT'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEBIT';
        RAISE NOTICE 'Added DEBIT to TransactionType enum';
    END IF;
    
    -- Add TRANSFER if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'TRANSFER'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';
        RAISE NOTICE 'Added TRANSFER to TransactionType enum';
    END IF;
    
    -- Add WITHDRAWAL if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'WITHDRAWAL'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'WITHDRAWAL';
        RAISE NOTICE 'Added WITHDRAWAL to TransactionType enum';
    END IF;
    
    -- Add DEPOSIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
        AND enumlabel = 'DEPOSIT'
    ) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEPOSIT';
        RAISE NOTICE 'Added DEPOSIT to TransactionType enum';
    END IF;
END $$;

-- 3. Check current enum values for TransactionStatus
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus');

-- 4. Add missing enum values to TransactionStatus
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
    END IF;
    
    -- Add COMPLETED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'COMPLETED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'COMPLETED';
        RAISE NOTICE 'Added COMPLETED to TransactionStatus enum';
    END IF;
    
    -- Add FAILED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'FAILED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'FAILED';
        RAISE NOTICE 'Added FAILED to TransactionStatus enum';
    END IF;
    
    -- Add CANCELLED if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
        AND enumlabel = 'CANCELLED'
    ) THEN
        ALTER TYPE "TransactionStatus" ADD VALUE 'CANCELLED';
        RAISE NOTICE 'Added CANCELLED to TransactionStatus enum';
    END IF;
END $$;

-- 5. Verify the enum values
SELECT 'TransactionType' as enum_name, enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
ORDER BY enumsortorder;

SELECT 'TransactionStatus' as enum_name, enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
ORDER BY enumsortorder; 