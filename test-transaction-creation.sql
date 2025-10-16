-- Test transaction creation with CREDIT type
-- Run this AFTER the enum values have been added

-- Test creating a transaction with CREDIT type
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
        RAISE NOTICE 'Found test user: % and account: %', test_user_id, test_account_id;
        
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
        
        RAISE NOTICE 'TransactionType enum is working correctly!';
    ELSE
        RAISE NOTICE 'Could not find test user/account for testing';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating test transaction: %', SQLERRM;
END $$;
