-- Fix CardType enum in database
-- Run this in Supabase SQL Editor

-- 1. Check current enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype');

-- 2. Drop and recreate the enum with correct values
-- First, drop the enum from the cards table
ALTER TABLE cards DROP COLUMN IF EXISTS "cardType";

-- Drop the enum type if it exists
DROP TYPE IF EXISTS "CardType";

-- Create the enum with correct values
CREATE TYPE "CardType" AS ENUM ('DEBIT', 'CREDIT', 'VIRTUAL');

-- Add the column back to the cards table
ALTER TABLE cards ADD COLUMN "cardType" "CardType";

-- 3. Also fix CardStatus enum if needed
-- Drop the enum from the cards table
ALTER TABLE cards DROP COLUMN IF EXISTS "status";

-- Drop the enum type if it exists
DROP TYPE IF EXISTS "CardStatus";

-- Create the enum with correct values
CREATE TYPE "CardStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'EXPIRED', 'BLOCKED');

-- Add the column back to the cards table
ALTER TABLE cards ADD COLUMN "status" "CardStatus" DEFAULT 'ACTIVE';

-- 4. Verify the enums are created correctly
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype');

SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardstatus');

-- 5. Check the cards table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'cards' 
ORDER BY ordinal_position; 