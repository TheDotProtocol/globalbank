-- Fix admin access and database schema issues

-- 1. Make the current user an admin (assuming they're logged in)
-- First, let's see who the current users are
SELECT id, email, "firstName", "lastName", role FROM users ORDER BY "createdAt" DESC LIMIT 5;

-- 2. Update the user with account 0506115866 to be an admin
UPDATE users 
SET role = 'ADMIN'
WHERE id = (
    SELECT u.id 
    FROM users u 
    JOIN accounts a ON u.id = a."userId" 
    WHERE a."accountNumber" = '0506115866'
);

-- 3. Fix the corporate_banks table schema
-- Add the missing bicCode column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'bicCode'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "bicCode" VARCHAR(20);
    END IF;
END $$;

-- 4. Add other missing columns to corporate_banks if needed
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'swiftCode'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "swiftCode" VARCHAR(20);
    END IF;
END $$;

-- 5. Verify the user is now an admin
SELECT u.id, u.email, u."firstName", u."lastName", u.role, a."accountNumber", a.balance
FROM users u 
JOIN accounts a ON u.id = a."userId" 
WHERE a."accountNumber" = '0506115866';

-- 6. Show the corporate_banks table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'corporate_banks' 
ORDER BY ordinal_position;
