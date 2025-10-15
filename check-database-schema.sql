-- Check database schema for international transfers
-- Run this in Supabase SQL Editor to diagnose the issue

-- Check if international_transfers table exists
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'international_transfers';

-- Check if TransferStatus enum exists
SELECT 
    typname, 
    typtype 
FROM pg_type 
WHERE typname = 'TransferStatus';

-- Check table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'international_transfers'
ORDER BY ordinal_position;

-- Check if there are any foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'international_transfers';

-- Check if there are any indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE tablename = 'international_transfers';

-- Test if we can insert a simple record (this will show the exact error)
DO $$ 
BEGIN
    -- This will fail and show us the exact error
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
        'test-id', 
        'test-user', 
        'test-account', 
        'test-transaction', 
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
        'TEST-REF', 
        'PENDING', 
        NOW() + INTERVAL '3 days', 
        NOW(), 
        NOW()
    );
    
    RAISE NOTICE 'Test insert successful - table structure is correct';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test insert failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;
