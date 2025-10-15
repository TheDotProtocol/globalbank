-- Test the international_transfers table structure
-- This will help us verify the table is working correctly

-- Check if we can select from the table
SELECT COUNT(*) as total_records FROM international_transfers;

-- Check the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'international_transfers'
ORDER BY ordinal_position;

-- Test inserting a record (this will show any remaining issues)
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
    
    -- Try to insert a record
    INSERT INTO international_transfers (
        id, 
        "userId", 
        "accountId", 
        "transactionId", 
        amount, 
        currency, 
        "exchangeRate", 
        "convertedAmount", 
        "transferFee", 
        "totalAmount", 
        "beneficiaryName", 
        "beneficiaryCountry", 
        "bankName", 
        "swiftCode", 
        "accountNumber", 
        reference, 
        status, 
        "estimatedDelivery", 
        "createdAt", 
        "updatedAt"
    ) VALUES (
        'test-' || EXTRACT(EPOCH FROM NOW())::text, 
        test_user_id, 
        test_account_id, 
        test_transaction_id, 
        100, 
        'USD', 
        1, 
        100, 
        2, 
        102, 
        'Test User', 
        'USA', 
        'Test Bank', 
        'TESTUS33', 
        '123456789', 
        'TEST-REF-' || EXTRACT(EPOCH FROM NOW())::text, 
        'PENDING', 
        NOW() + INTERVAL '3 days', 
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE '✅ INSERT test successful - table structure is correct!';
    
    -- Clean up test record
    DELETE FROM international_transfers WHERE id LIKE 'test-%';
    RAISE NOTICE '✅ Test record cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ INSERT test failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
    RAISE NOTICE 'Error detail: %', SQLERRM;
END $$;
