-- Add missing enums to Supabase database
-- This ensures all Prisma enums exist in the database

-- Add TransferMode enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TransferMode" AS ENUM (
        'INTERNAL_TRANSFER',
        'EXTERNAL_TRANSFER',
        'WIRE_TRANSFER',
        'ACH_TRANSFER',
        'CARD_TRANSFER',
        'MOBILE_TRANSFER',
        'INTERNATIONAL_TRANSFER'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'TransferMode enum already exists';
END $$;

-- Add TransactionType enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TransactionType" AS ENUM (
        'CREDIT',
        'DEBIT',
        'TRANSFER'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'TransactionType enum already exists';
END $$;

-- Add TransactionStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TransactionStatus" AS ENUM (
        'PENDING',
        'PROCESSING',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'REVERSED'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'TransactionStatus enum already exists';
END $$;

-- Add DisputeStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "DisputeStatus" AS ENUM (
        'NONE',
        'PENDING',
        'INVESTIGATING',
        'RESOLVED',
        'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'DisputeStatus enum already exists';
END $$;

-- Test if we can create a transaction with INTERNATIONAL_TRANSFER mode
DO $$ 
DECLARE
    test_user_id TEXT;
    test_account_id TEXT;
    test_transaction_id TEXT;
BEGIN
    -- Get a real user ID
    SELECT id INTO test_user_id FROM users LIMIT 1;
    
    -- Get a real account ID
    SELECT id INTO test_account_id FROM accounts LIMIT 1;
    
    -- Generate a test transaction ID
    test_transaction_id := 'test-transaction-' || EXTRACT(EPOCH FROM NOW())::text;
    
    -- Try to insert a transaction record with INTERNATIONAL_TRANSFER mode
    INSERT INTO transactions (
        id, 
        "accountId", 
        "userId", 
        type, 
        amount, 
        description, 
        reference, 
        status, 
        "transferMode",
        "sourceAccountId",
        "destinationAccountId",
        "transferFee",
        "netAmount",
        "createdAt", 
        "updatedAt"
    ) VALUES (
        test_transaction_id, 
        test_account_id, 
        test_user_id, 
        'DEBIT', 
        100, 
        'Test international transfer', 
        'TEST-REF-' || EXTRACT(EPOCH FROM NOW())::text, 
        'COMPLETED', 
        'INTERNATIONAL_TRANSFER',
        test_account_id,
        'test-dest-account',
        2,
        100,
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE '✅ Transaction creation test successful with INTERNATIONAL_TRANSFER mode!';
    
    -- Clean up test transaction
    DELETE FROM transactions WHERE id = test_transaction_id;
    RAISE NOTICE '✅ Test transaction cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Transaction creation test failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
    RAISE NOTICE 'Error detail: %', SQLERRM;
END $$;

-- Final success message
DO $$ BEGIN
    RAISE NOTICE '🎉 All required enums have been added to the database!';
    RAISE NOTICE 'Enums: TransferMode, TransactionType, TransactionStatus, DisputeStatus';
    RAISE NOTICE 'Ready for international transfer functionality!';
END $$;
