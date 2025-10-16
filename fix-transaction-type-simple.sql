-- Fix TransactionType enum in database - Simple approach
-- Handle enum value creation and usage separately

-- 1. Check current TransactionType enum values
SELECT unnest(enum_range(NULL::"TransactionType")) as transaction_type_values;

-- 2. Add CREDIT value to TransactionType enum (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CREDIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'CREDIT';
        RAISE NOTICE 'Added CREDIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'CREDIT already exists in TransactionType enum';
    END IF;
END $$;

-- 3. Add DEBIT value to TransactionType enum (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEBIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEBIT';
        RAISE NOTICE 'Added DEBIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEBIT already exists in TransactionType enum';
    END IF;
END $$;

-- 4. Add TRANSFER value to TransactionType enum (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TRANSFER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';
        RAISE NOTICE 'Added TRANSFER to TransactionType enum';
    ELSE
        RAISE NOTICE 'TRANSFER already exists in TransactionType enum';
    END IF;
END $$;

-- 5. Add WITHDRAWAL value to TransactionType enum (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WITHDRAWAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'WITHDRAWAL';
        RAISE NOTICE 'Added WITHDRAWAL to TransactionType enum';
    ELSE
        RAISE NOTICE 'WITHDRAWAL already exists in TransactionType enum';
    END IF;
END $$;

-- 6. Add DEPOSIT value to TransactionType enum (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEPOSIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEPOSIT';
        RAISE NOTICE 'Added DEPOSIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEPOSIT already exists in TransactionType enum';
    END IF;
END $$;

-- 7. Verify all TransactionType enum values
SELECT unnest(enum_range(NULL::"TransactionType")) as transaction_type_values;
