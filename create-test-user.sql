-- Create a test user directly in the database
-- Run this in your Supabase SQL Editor

INSERT INTO public.users (
  id,
  email,
  password,
  "firstName",
  "lastName",
  phone,
  "kycStatus",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-user-123',
  'test@globalbank.com',
  '$2b$10$testpasswordhash', -- This is a placeholder hash
  'Test',
  'User',
  '+1234567890',
  'APPROVED',
  NOW(),
  NOW()
);

-- Create a test account for this user
INSERT INTO public.accounts (
  id,
  "userId",
  "accountNumber",
  "accountType",
  balance,
  currency,
  "isActive",
  "createdAt",
  "updatedAt"
) VALUES (
  'test-account-123',
  'test-user-123',
  '1234567890',
  'SAVINGS',
  1000.00,
  'USD',
  true,
  NOW(),
  NOW()
);

-- Verify the user was created
SELECT 
  id,
  email,
  "firstName",
  "lastName",
  "kycStatus",
  "createdAt"
FROM public.users 
WHERE email = 'test@globalbank.com';

-- Verify the account was created
SELECT 
  a.id,
  a."accountNumber",
  a."accountType",
  a.balance,
  a.currency,
  u.email
FROM public.accounts a
JOIN public.users u ON a."userId" = u.id
WHERE u.email = 'test@globalbank.com'; 