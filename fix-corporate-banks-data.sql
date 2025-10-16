-- Fix corporate_banks table data issues
-- Set default values for newly added columns to avoid null constraint errors

-- 1. Update existing records to have default values for new columns
UPDATE corporate_banks 
SET 
    "bicCode" = COALESCE("bicCode", 'DEFAULT-BIC'),
    "swiftCode" = COALESCE("swiftCode", 'DEFAULT-SWIFT'),
    "routingNumber" = COALESCE("routingNumber", 'DEFAULT-ROUTING'),
    "iban" = COALESCE("iban", 'DEFAULT-IBAN'),
    "country" = COALESCE("country", 'Thailand'),
    "city" = COALESCE("city", 'Bangkok'),
    "address" = COALESCE("address", 'Default Address')
WHERE 
    "bicCode" IS NULL OR 
    "swiftCode" IS NULL OR 
    "routingNumber" IS NULL OR 
    "iban" IS NULL OR 
    "country" IS NULL OR 
    "city" IS NULL OR 
    "address" IS NULL;

-- 2. Set NOT NULL constraints on the columns
ALTER TABLE corporate_banks ALTER COLUMN "bicCode" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "swiftCode" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "routingNumber" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "iban" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "country" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "city" SET NOT NULL;
ALTER TABLE corporate_banks ALTER COLUMN "address" SET NOT NULL;

-- 3. Set default values for future inserts
ALTER TABLE corporate_banks ALTER COLUMN "bicCode" SET DEFAULT 'DEFAULT-BIC';
ALTER TABLE corporate_banks ALTER COLUMN "swiftCode" SET DEFAULT 'DEFAULT-SWIFT';
ALTER TABLE corporate_banks ALTER COLUMN "routingNumber" SET DEFAULT 'DEFAULT-ROUTING';
ALTER TABLE corporate_banks ALTER COLUMN "iban" SET DEFAULT 'DEFAULT-IBAN';
ALTER TABLE corporate_banks ALTER COLUMN "country" SET DEFAULT 'Thailand';
ALTER TABLE corporate_banks ALTER COLUMN "city" SET DEFAULT 'Bangkok';
ALTER TABLE corporate_banks ALTER COLUMN "address" SET DEFAULT 'Default Address';

-- 4. Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'corporate_banks' 
ORDER BY ordinal_position;

-- 5. Test if we can query the table now
SELECT COUNT(*) as corporate_banks_count FROM corporate_banks;

-- 6. Show sample data
SELECT "bankName", "accountNumber", "bicCode", "swiftCode", "country" 
FROM corporate_banks 
LIMIT 5;
