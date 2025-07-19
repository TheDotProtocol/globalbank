-- Simple fix for cards table - Add missing accountId column
-- Run this in Supabase SQL Editor

-- Add the missing accountId column
ALTER TABLE cards ADD COLUMN IF NOT EXISTS "accountId" TEXT;

-- Add foreign key constraint
ALTER TABLE cards 
ADD CONSTRAINT IF NOT EXISTS "cards_accountId_fkey" 
FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cards' AND column_name = 'accountId';

-- Check current cards count
SELECT COUNT(*) as total_cards FROM cards; 