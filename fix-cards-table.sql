-- Fix Cards Table - Add missing columns and ensure proper structure
-- Run these commands in Supabase SQL Editor

-- 1. First, let's check the current structure of the cards table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

-- 2. Add the missing accountId column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'accountId'
    ) THEN
        ALTER TABLE cards ADD COLUMN "accountId" TEXT;
        RAISE NOTICE 'Added accountId column to cards table';
    ELSE
        RAISE NOTICE 'accountId column already exists in cards table';
    END IF;
END $$;

-- 3. Add any other missing columns that might be needed
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'status'
    ) THEN
        ALTER TABLE cards ADD COLUMN "status" TEXT DEFAULT 'ACTIVE';
        RAISE NOTICE 'Added status column to cards table';
    END IF;
    
    -- Add isVirtual column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'isVirtual'
    ) THEN
        ALTER TABLE cards ADD COLUMN "isVirtual" BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added isVirtual column to cards table';
    END IF;
    
    -- Add dailyLimit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'dailyLimit'
    ) THEN
        ALTER TABLE cards ADD COLUMN "dailyLimit" DECIMAL(10,2) DEFAULT 1000.00;
        RAISE NOTICE 'Added dailyLimit column to cards table';
    END IF;
    
    -- Add monthlyLimit column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'monthlyLimit'
    ) THEN
        ALTER TABLE cards ADD COLUMN "monthlyLimit" DECIMAL(10,2) DEFAULT 5000.00;
        RAISE NOTICE 'Added monthlyLimit column to cards table';
    END IF;
    
    -- Add updatedAt column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cards' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE cards ADD COLUMN "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updatedAt column to cards table';
    END IF;
END $$;

-- 4. Add foreign key constraint for accountId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cards' 
        AND constraint_name = 'cards_accountId_fkey'
    ) THEN
        ALTER TABLE cards 
        ADD CONSTRAINT "cards_accountId_fkey" 
        FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for accountId';
    ELSE
        RAISE NOTICE 'Foreign key constraint for accountId already exists';
    END IF;
END $$;

-- 5. Add foreign key constraint for userId if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'cards' 
        AND constraint_name = 'cards_userId_fkey'
    ) THEN
        ALTER TABLE cards 
        ADD CONSTRAINT "cards_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
        RAISE NOTICE 'Added foreign key constraint for userId';
    ELSE
        RAISE NOTICE 'Foreign key constraint for userId already exists';
    END IF;
END $$;

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS "cards_userId_idx" ON "cards"("userId");
CREATE INDEX IF NOT EXISTS "cards_accountId_idx" ON "cards"("accountId");
CREATE INDEX IF NOT EXISTS "cards_cardNumber_idx" ON "cards"("cardNumber");

-- 7. Verify the final structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position;

-- 8. Check if there are any existing cards
SELECT COUNT(*) as total_cards FROM cards;

-- 9. Show sample data if any exists
SELECT id, "cardNumber", "cardType", "status", "isActive", "userId", "accountId"
FROM cards 
LIMIT 5; 