-- Verify All Enums - Check what exists without adding
-- Run this in Supabase SQL Editor

-- 1. Check all enum types that exist
SELECT 'All enum types in database:' as info;
SELECT typname as enum_type
FROM pg_type 
WHERE typtype = 'e'
ORDER BY typname;

-- 2. Check CardType enum values
SELECT 'CardType enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype')
ORDER BY enumsortorder;

-- 3. Check CardStatus enum values
SELECT 'CardStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardstatus')
ORDER BY enumsortorder;

-- 4. Check TransactionType enum values
SELECT 'TransactionType enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactiontype')
ORDER BY enumsortorder;

-- 5. Check TransactionStatus enum values
SELECT 'TransactionStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'transactionstatus')
ORDER BY enumsortorder;

-- 6. Check DepositStatus enum values
SELECT 'DepositStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'depositstatus')
ORDER BY enumsortorder;

-- 7. Check DisputeStatus enum values
SELECT 'DisputeStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'disputestatus')
ORDER BY enumsortorder;

-- 8. Check AccountType enum values
SELECT 'AccountType enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'accounttype')
ORDER BY enumsortorder;

-- 9. Check KycStatus enum values
SELECT 'KycStatus enum values:' as info;
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'kycstatus')
ORDER BY enumsortorder;

-- 10. Check tables structure
SELECT 'Cards table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

SELECT 'Transactions table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;

SELECT 'Fixed_deposits table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'fixed_deposits' 
ORDER BY ordinal_position;

-- 11. Check data counts
SELECT 'Data counts:' as info;
SELECT 'cards' as table_name, COUNT(*) as count FROM cards
UNION ALL
SELECT 'transactions' as table_name, COUNT(*) as count FROM transactions
UNION ALL
SELECT 'fixed_deposits' as table_name, COUNT(*) as count FROM fixed_deposits
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'accounts' as table_name, COUNT(*) as count FROM accounts; 