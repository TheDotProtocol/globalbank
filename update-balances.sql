-- Update account balances as requested
-- Set all $0 accounts to $100 with welcome gift transaction
-- Set account 0506114890 to $1M

-- Update all accounts with $0 balance to $100
UPDATE accounts 
SET balance = 100 
WHERE balance = 0 AND "isActive" = true;

-- Create welcome gift transactions for updated accounts
INSERT INTO transactions (id, "accountId", "userId", type, amount, description, reference, status, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    a.id,
    a."userId",
    'CREDIT',
    100,
    'Welcome Gift from The Dot Protocol Co Ltd',
    'WELCOME-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9),
    'COMPLETED',
    now(),
    now()
FROM accounts a
WHERE a.balance = 100 AND a."isActive" = true;

-- Update specific account 0506114890 to $1M
UPDATE accounts 
SET balance = 1000000 
WHERE "accountNumber" = '0506114890';

-- Create transaction for the $1M deposit
INSERT INTO transactions (id, "accountId", "userId", type, amount, description, reference, status, "createdAt", "updatedAt")
SELECT 
    gen_random_uuid()::text,
    a.id,
    a."userId",
    'CREDIT',
    1000000,
    'Capital Injection - The Dot Protocol Co Ltd',
    'CAPITAL-' || extract(epoch from now())::text || '-' || substr(md5(random()::text), 1, 9),
    'COMPLETED',
    now(),
    now()
FROM accounts a
WHERE a."accountNumber" = '0506114890';

-- Verify the updates
SELECT "accountNumber", balance FROM accounts WHERE "isActive" = true ORDER BY "accountNumber"; 