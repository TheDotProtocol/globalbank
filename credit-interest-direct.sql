-- Credit Interest for July 2025
-- Run this directly in your database

-- First, let's see current account balances
SELECT 
  a."accountNumber",
  a.balance,
  a."accountType",
  u.email
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a."isActive" = true AND a.balance > 0
ORDER BY a."accountNumber";

-- Now let's calculate and credit interest for each account
-- We'll do this in a transaction to ensure consistency

DO $$
DECLARE
  account_record RECORD;
  new_balance DECIMAL;
  interest_amount DECIMAL;
  transaction_id TEXT;
  reference_id TEXT;
BEGIN
  -- Loop through all active accounts with positive balances
  FOR account_record IN 
    SELECT 
      a.id,
      a."accountNumber",
      a.balance,
      a."accountType",
      u.id as "userId"
    FROM accounts a
    JOIN users u ON a."userId" = u.id
    WHERE a."isActive" = true AND a.balance > 0
  LOOP
    -- Calculate interest based on account type
    CASE account_record."accountType"
      WHEN 'SAVINGS' THEN
        -- 2.5% annual = 0.208% monthly, minimum $50
        IF account_record.balance >= 50 THEN
          interest_amount := ROUND((account_record.balance * 0.00208)::DECIMAL, 2);
        ELSE
          interest_amount := 0;
        END IF;
      WHEN 'CHECKING' THEN
        -- 1.0% annual = 0.083% monthly, minimum $100
        IF account_record.balance >= 100 THEN
          interest_amount := ROUND((account_record.balance * 0.00083)::DECIMAL, 2);
        ELSE
          interest_amount := 0;
        END IF;
      WHEN 'BUSINESS' THEN
        -- 1.8% annual = 0.15% monthly, minimum $500
        IF account_record.balance >= 500 THEN
          interest_amount := ROUND((account_record.balance * 0.0015)::DECIMAL, 2);
        ELSE
          interest_amount := 0;
        END IF;
      ELSE
        -- Default rate: 1.5% annual = 0.125% monthly, minimum $50
        IF account_record.balance >= 50 THEN
          interest_amount := ROUND((account_record.balance * 0.00125)::DECIMAL, 2);
        ELSE
          interest_amount := 0;
        END IF;
    END CASE;

    -- If interest is greater than 0, credit it
    IF interest_amount > 0 THEN
      -- Update account balance
      new_balance := account_record.balance + interest_amount;
      
      UPDATE accounts 
      SET balance = new_balance, "updatedAt" = NOW()
      WHERE id = account_record.id;

      -- Create transaction record
      transaction_id := 'int-' || EXTRACT(EPOCH FROM NOW())::TEXT || '-' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 9);
      reference_id := 'INT-JULY-2025-' || account_record."accountNumber";

      INSERT INTO transactions (
        id, "accountId", "userId", type, amount, description, reference, status, "createdAt", "updatedAt"
      ) VALUES (
        transaction_id, account_record.id, account_record."userId", 'CREDIT', interest_amount,
        'Interest Credited for July 2025', reference_id, 'COMPLETED', NOW(), NOW()
      );

      -- Log the credit
      RAISE NOTICE 'Credited $% interest to account % (balance: $% → $%)', 
        interest_amount, account_record."accountNumber", account_record.balance, new_balance;
    ELSE
      RAISE NOTICE 'No interest for account % (balance: $%, type: %)', 
        account_record."accountNumber", account_record.balance, account_record."accountType";
    END IF;
  END LOOP;
END $$;

-- Verify the updates
SELECT 
  a."accountNumber",
  a.balance,
  a."accountType",
  u.email
FROM accounts a
JOIN users u ON a."userId" = u.id
WHERE a."isActive" = true
ORDER BY a."accountNumber";

-- Check interest transactions
SELECT 
  t.id,
  t.amount,
  t.description,
  t."createdAt",
  a."accountNumber"
FROM transactions t
JOIN accounts a ON t."accountId" = a.id
WHERE t.description LIKE '%Interest Credited for July 2025%'
ORDER BY t."createdAt" DESC;

-- Summary
SELECT 
  COUNT(*) as total_accounts,
  SUM(CASE WHEN t.id IS NOT NULL THEN 1 ELSE 0 END) as accounts_with_interest,
  COALESCE(SUM(t.amount), 0) as total_interest_credited
FROM accounts a
LEFT JOIN transactions t ON a.id = t."accountId" AND t.description LIKE '%Interest Credited for July 2025%'
WHERE a."isActive" = true; 