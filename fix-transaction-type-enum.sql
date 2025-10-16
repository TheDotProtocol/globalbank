-- Fix TransactionType enum in database
-- Ensure CREDIT, DEBIT, TRANSFER values exist

-- 1. Check current TransactionType enum values
SELECT unnest(enum_range(NULL::"TransactionType")) as transaction_type_values;

-- 2. Add missing values to TransactionType enum if they don't exist
DO $$ 
BEGIN
    -- Add CREDIT if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CREDIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'CREDIT';
        RAISE NOTICE 'Added CREDIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'CREDIT already exists in TransactionType enum';
    END IF;
    
    -- Add DEBIT if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEBIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEBIT';
        RAISE NOTICE 'Added DEBIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEBIT already exists in TransactionType enum';
    END IF;
    
    -- Add TRANSFER if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'TRANSFER' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'TRANSFER';
        RAISE NOTICE 'Added TRANSFER to TransactionType enum';
    ELSE
        RAISE NOTICE 'TRANSFER already exists in TransactionType enum';
    END IF;
    
    -- Add WITHDRAWAL if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'WITHDRAWAL' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'WITHDRAWAL';
        RAISE NOTICE 'Added WITHDRAWAL to TransactionType enum';
    ELSE
        RAISE NOTICE 'WITHDRAWAL already exists in TransactionType enum';
    END IF;
    
    -- Add DEPOSIT if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'DEPOSIT' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'TransactionType')) THEN
        ALTER TYPE "TransactionType" ADD VALUE 'DEPOSIT';
        RAISE NOTICE 'Added DEPOSIT to TransactionType enum';
    ELSE
        RAISE NOTICE 'DEPOSIT already exists in TransactionType enum';
    END IF;
END $$;

-- 3. Verify all TransactionType enum values
SELECT unnest(enum_range(NULL::"TransactionType")) as transaction_type_values;

-- 4. Test creating a transaction with CREDIT type
DO $$ 
DECLARE
    test_user_id TEXT;
    test_account_id TEXT;
    test_transaction_id TEXT;
BEGIN
    -- Get a real user ID and account ID
    SELECT u.id, a.id INTO test_user_id, test_account_id
    FROM users u
    JOIN accounts a ON u.id = a."userId"
    WHERE a."accountNumber" = '0506115866'
    LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_account_id IS NOT NULL THEN
        -- Try to create a test transaction
        INSERT INTO transactions (
            id, "userId", "accountId", type, amount, description, reference, status, "createdAt", "updatedAt"
        ) VALUES (
            gen_random_uuid()::text,
            test_user_id,
            test_account_id,
            'CREDIT'::"TransactionType",
            1,
            'Test CREDIT transaction',
            'TEST-CREDIT-' || extract(epoch from now())::text,
            'COMPLETED'::"TransactionStatus",
            now(),
            now()
        ) RETURNING id INTO test_transaction_id;
        
        RAISE NOTICE 'Successfully created test CREDIT transaction: %', test_transaction_id;
        
        -- Clean up test transaction
        DELETE FROM transactions WHERE id = test_transaction_id;
        RAISE NOTICE 'Cleaned up test transaction';
    ELSE
        RAISE NOTICE 'Could not find test user/account for testing';
    END IF;
END $$;
