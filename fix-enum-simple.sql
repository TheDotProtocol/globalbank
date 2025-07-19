-- Simple fix for CardType enum - Add missing values
-- Run this in Supabase SQL Editor

-- Add missing enum values to CardType
DO $$ 
BEGIN
    -- Add DEBIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype')
        AND enumlabel = 'DEBIT'
    ) THEN
        ALTER TYPE "CardType" ADD VALUE 'DEBIT';
        RAISE NOTICE 'Added DEBIT to CardType enum';
    END IF;
    
    -- Add CREDIT if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype')
        AND enumlabel = 'CREDIT'
    ) THEN
        ALTER TYPE "CardType" ADD VALUE 'CREDIT';
        RAISE NOTICE 'Added CREDIT to CardType enum';
    END IF;
    
    -- Add VIRTUAL if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype')
        AND enumlabel = 'VIRTUAL'
    ) THEN
        ALTER TYPE "CardType" ADD VALUE 'VIRTUAL';
        RAISE NOTICE 'Added VIRTUAL to CardType enum';
    END IF;
END $$;

-- Verify the enum values
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'cardtype')
ORDER BY enumsortorder; 