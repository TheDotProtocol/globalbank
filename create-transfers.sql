-- Create transfers from Saleena Thamani to two other accounts
-- Transfer 1: 0506118608 to 0506110982 (Prajuab Buangam)
-- Transfer 2: 0506118608 to 0506113754 (Sura Preamsuk)

-- First, let's check the current balances
SELECT 
    a.accountNumber,
    u.firstName || ' ' || u.lastName as accountHolder,
    a.balance
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a.accountNumber IN ('0506118608', '0506110982', '0506113754')
ORDER BY a.accountNumber;

-- Create transfer 1: Saleena to Prajuab
INSERT INTO transactions (
    id, "userId", "accountId", type, amount, description, status, reference, 
    "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
    "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
) VALUES (
    'transfer_saleena_prajuab_' || EXTRACT(EPOCH FROM NOW())::bigint,
    (SELECT "userId" FROM accounts WHERE accountNumber = '0506118608'),
    (SELECT id FROM accounts WHERE accountNumber = '0506118608'),
    'TRANSFER',
    100,
    'Transfer from Saleena Thamani to Prajuab Buangam',
    'COMPLETED',
    'TRANSFER-SALEENA-PRAJUAB-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'EXTERNAL_TRANSFER',
    'Saleena Thamani',
    'Prajuab Buangam',
    0,
    100,
    false,
    NOW(),
    NOW()
);

-- Create transfer 2: Saleena to Sura
INSERT INTO transactions (
    id, "userId", "accountId", type, amount, description, status, reference, 
    "transferMode", "sourceAccountHolder", "destinationAccountHolder", 
    "transferFee", "netAmount", "isDisputed", "createdAt", "updatedAt"
) VALUES (
    'transfer_saleena_sura_' || EXTRACT(EPOCH FROM NOW())::bigint,
    (SELECT "userId" FROM accounts WHERE accountNumber = '0506118608'),
    (SELECT id FROM accounts WHERE accountNumber = '0506118608'),
    'TRANSFER',
    100,
    'Transfer from Saleena Thamani to Sura Preamsuk',
    'COMPLETED',
    'TRANSFER-SALEENA-SURA-' || EXTRACT(EPOCH FROM NOW())::bigint,
    'EXTERNAL_TRANSFER',
    'Saleena Thamani',
    'Sura Preamsuk',
    0,
    100,
    false,
    NOW(),
    NOW()
);

-- Update Saleena's balance (deduct 200 for both transfers)
UPDATE accounts 
SET balance = balance - 200, "updatedAt" = NOW()
WHERE accountNumber = '0506118608';

-- Update Prajuab's balance (add 100)
UPDATE accounts 
SET balance = balance + 100, "updatedAt" = NOW()
WHERE accountNumber = '0506110982';

-- Update Sura's balance (add 100)
UPDATE accounts 
SET balance = balance + 100, "updatedAt" = NOW()
WHERE accountNumber = '0506113754';

-- Verify the changes
SELECT 
    a.accountNumber,
    u.firstName || ' ' || u.lastName as accountHolder,
    a.balance
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a.accountNumber IN ('0506118608', '0506110982', '0506113754')
ORDER BY a.accountNumber;

-- Show the new transactions
SELECT 
    t.id,
    t.description,
    t.amount,
    t.status,
    t."createdAt"
FROM transactions t
WHERE t.description LIKE '%Saleena Thamani%'
ORDER BY t."createdAt" DESC
LIMIT 5; 