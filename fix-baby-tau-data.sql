-- Fix Baby Tau Data - Add missing transaction and fixed deposit
-- Run this in Supabase SQL Editor

-- 1. Get Baby Tau's user ID and account ID
SELECT 'Baby Tau User Info:' as info;
SELECT u.id as user_id, u.firstName, u.lastName, u.email, a.id as account_id, a.accountNumber, a.balance
FROM users u
JOIN accounts a ON u.id = a."userId"
WHERE u.email = 'babyaccount@globaldotbank.org';

-- 2. Check existing transactions for Baby Tau
SELECT 'Baby Tau Current Transactions:' as info;
SELECT t.id, t.type, t.amount, t.description, t."reference", t.status, t."createdAt"
FROM transactions t
JOIN users u ON t."userId" = u.id
WHERE u.email = 'babyaccount@globaldotbank.org'
ORDER BY t."createdAt" DESC;

-- 3. Add missing Mommy gift transaction
DO $$
DECLARE
    baby_tau_user_id TEXT;
    baby_tau_account_id TEXT;
BEGIN
    -- Get Baby Tau's user and account IDs
    SELECT u.id, a.id INTO baby_tau_user_id, baby_tau_account_id
    FROM users u
    JOIN accounts a ON u.id = a."userId"
    WHERE u.email = 'babyaccount@globaldotbank.org';
    
    -- Check if Mommy gift transaction already exists
    IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE "userId" = baby_tau_user_id 
        AND description LIKE '%Mommy%'
    ) THEN
        -- Add Mommy gift transaction
        INSERT INTO transactions (
            id, "userId", "accountId", type, amount, description, "reference", status, "createdAt", "updatedAt"
        ) VALUES (
            'txn_mommy_gift_' || EXTRACT(EPOCH FROM NOW())::TEXT,
            baby_tau_user_id,
            baby_tau_account_id,
            'CREDIT',
            150000,
            'Deposit from The Dot Protocol Inc, Global HQ, USA - Mommy''s first gift',
            'MOMMY-GIFT-1',
            'COMPLETED',
            NOW(),
            NOW()
        );
        
        -- Update account balance
        UPDATE accounts 
        SET balance = balance + 150000, "updatedAt" = NOW()
        WHERE id = baby_tau_account_id;
        
        RAISE NOTICE 'Added Mommy gift transaction for Baby Tau';
    ELSE
        RAISE NOTICE 'Mommy gift transaction already exists for Baby Tau';
    END IF;
END $$;

-- 4. Check fixed deposits for Baby Tau
SELECT 'Baby Tau Current Fixed Deposits:' as info;
SELECT fd.id, fd.amount, fd."interestRate", fd.duration, fd."maturityDate", fd.status, fd."createdAt"
FROM "fixed_deposits" fd
JOIN users u ON fd."userId" = u.id
WHERE u.email = 'babyaccount@globaldotbank.org'
ORDER BY fd."createdAt" DESC;

-- 5. Add fixed deposit for Baby Tau
DO $$
DECLARE
    baby_tau_user_id TEXT;
    baby_tau_account_id TEXT;
BEGIN
    -- Get Baby Tau's user and account IDs
    SELECT u.id, a.id INTO baby_tau_user_id, baby_tau_account_id
    FROM users u
    JOIN accounts a ON u.id = a."userId"
    WHERE u.email = 'babyaccount@globaldotbank.org';
    
    -- Check if fixed deposit already exists
    IF NOT EXISTS (
        SELECT 1 FROM "fixed_deposits" 
        WHERE "userId" = baby_tau_user_id
    ) THEN
        -- Add fixed deposit
        INSERT INTO "fixed_deposits" (
            id, "userId", "accountId", amount, "interestRate", duration, "maturityDate", status, "createdAt", "updatedAt"
        ) VALUES (
            'fd_baby_tau_' || EXTRACT(EPOCH FROM NOW())::TEXT,
            baby_tau_user_id,
            baby_tau_account_id,
            100000,
            5.5,
            24,
            NOW() + INTERVAL '24 months',
            'ACTIVE',
            NOW(),
            NOW()
        );
        
        -- Add transaction for fixed deposit
        INSERT INTO transactions (
            id, "userId", "accountId", type, amount, description, "reference", status, "createdAt", "updatedAt"
        ) VALUES (
            'txn_fd_baby_tau_' || EXTRACT(EPOCH FROM NOW())::TEXT,
            baby_tau_user_id,
            baby_tau_account_id,
            'DEBIT',
            100000,
            'Fixed Deposit - 24 Months at 5.5% p.a.',
            'FD-BABY-TAU-001',
            'COMPLETED',
            NOW(),
            NOW()
        );
        
        -- Update account balance (deduct for fixed deposit)
        UPDATE accounts 
        SET balance = balance - 100000, "updatedAt" = NOW()
        WHERE id = baby_tau_account_id;
        
        RAISE NOTICE 'Added fixed deposit for Baby Tau';
    ELSE
        RAISE NOTICE 'Fixed deposit already exists for Baby Tau';
    END IF;
END $$;

-- 6. Verify final data
SELECT 'Final Baby Tau Data:' as info;
SELECT 'Account Balance:' as type, a.balance::TEXT as value
FROM users u
JOIN accounts a ON u.id = a."userId"
WHERE u.email = 'babyaccount@globaldotbank.org'

UNION ALL

SELECT 'Total Transactions:' as type, COUNT(t.id)::TEXT as value
FROM users u
JOIN transactions t ON u.id = t."userId"
WHERE u.email = 'babyaccount@globaldotbank.org'

UNION ALL

SELECT 'Total Fixed Deposits:' as type, COUNT(fd.id)::TEXT as value
FROM users u
JOIN "fixed_deposits" fd ON u.id = fd."userId"
WHERE u.email = 'babyaccount@globaldotbank.org';

-- 7. Show all Baby Tau transactions
SELECT 'All Baby Tau Transactions:' as info;
SELECT t.type, t.amount, t.description, t."reference", t.status, t."createdAt"
FROM transactions t
JOIN users u ON t."userId" = u.id
WHERE u.email = 'babyaccount@globaldotbank.org'
ORDER BY t."createdAt" DESC; 