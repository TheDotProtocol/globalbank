-- Fix corporate_banks table schema issues
-- Add missing columns that are causing the manual entry to fail

-- 1. Check current structure of corporate_banks table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'corporate_banks' 
ORDER BY ordinal_position;

-- 2. Add missing bicCode column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'bicCode'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "bicCode" VARCHAR(20);
        RAISE NOTICE 'Added bicCode column to corporate_banks table';
    ELSE
        RAISE NOTICE 'bicCode column already exists in corporate_banks table';
    END IF;
END $$;

-- 3. Add swiftCode column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'swiftCode'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "swiftCode" VARCHAR(20);
        RAISE NOTICE 'Added swiftCode column to corporate_banks table';
    ELSE
        RAISE NOTICE 'swiftCode column already exists in corporate_banks table';
    END IF;
END $$;

-- 4. Add other commonly needed columns for banking
DO $$ 
BEGIN
    -- Add routingNumber if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'routingNumber'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "routingNumber" VARCHAR(20);
        RAISE NOTICE 'Added routingNumber column to corporate_banks table';
    END IF;
    
    -- Add iban if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'iban'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "iban" VARCHAR(50);
        RAISE NOTICE 'Added iban column to corporate_banks table';
    END IF;
    
    -- Add country if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "country" VARCHAR(100);
        RAISE NOTICE 'Added country column to corporate_banks table';
    END IF;
    
    -- Add city if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'city'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "city" VARCHAR(100);
        RAISE NOTICE 'Added city column to corporate_banks table';
    END IF;
    
    -- Add address if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'corporate_banks' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE corporate_banks ADD COLUMN "address" TEXT;
        RAISE NOTICE 'Added address column to corporate_banks table';
    END IF;
END $$;

-- 5. Verify the updated structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'corporate_banks' 
ORDER BY ordinal_position;

-- 6. Test if we can query the table now
SELECT COUNT(*) as corporate_banks_count FROM corporate_banks;
