-- Credit account 0506115866 with $500,000 from AR Holdings Group
-- This script will update the account balance and create a transaction record

-- First, check current balance
SELECT 
    "accountNumber", 
    balance,
    u."firstName" || ' ' || u."lastName" as account_holder
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a."accountNumber" = '0506115866';

-- Update the account balance to $500,000
UPDATE accounts 
SET balance = 500000, "updatedAt" = NOW()
WHERE "accountNumber" = '0506115866';

-- Create the credit transaction
INSERT INTO transactions (
    id, "accountId", "userId", type, amount, description, reference, status, "createdAt", "updatedAt"
) 
SELECT 
    gen_random_uuid()::text,
    a.id,
    a."userId",
    'CREDIT',
    500000,
    'Deposit from AR Holdings Group',
    'AR-HOLDINGS-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9),
    'COMPLETED',
    now(),
    now()
FROM accounts a
WHERE a."accountNumber" = '0506115866';

-- Verify the update
SELECT 
    "accountNumber", 
    balance,
    u."firstName" || ' ' || u."lastName" as account_holder
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a."accountNumber" = '0506115866';

-- Show the new transaction
SELECT 
    description,
    amount,
    reference,
    "createdAt"
FROM transactions 
WHERE description = 'Deposit from AR Holdings Group'
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Show total bank balance
SELECT 
    SUM(balance) as total_bank_balance
FROM accounts 
WHERE "isActive" = true;
