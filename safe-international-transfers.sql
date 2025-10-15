-- Safe International Transfers Setup for Supabase
-- This script only adds what's missing, without recreating existing constraints

-- Create the TransferStatus enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "TransferStatus" AS ENUM (
        'PENDING',
        'PROCESSING', 
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'REVERSED'
    );
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'TransferStatus enum already exists, skipping...';
END $$;

-- Check if table exists, if not create it
DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'international_transfers') THEN
        CREATE TABLE "international_transfers" (
            "id" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            "accountId" TEXT NOT NULL,
            "transactionId" TEXT NOT NULL,
            "amount" DECIMAL(65,30) NOT NULL,
            "currency" TEXT NOT NULL DEFAULT 'USD',
            "exchangeRate" DECIMAL(65,30) NOT NULL,
            "convertedAmount" DECIMAL(65,30) NOT NULL,
            "transferFee" DECIMAL(65,30) NOT NULL,
            "totalAmount" DECIMAL(65,30) NOT NULL,
            "beneficiaryName" TEXT NOT NULL,
            "beneficiaryAddress" TEXT,
            "beneficiaryCity" TEXT,
            "beneficiaryCountry" TEXT NOT NULL,
            "bankName" TEXT NOT NULL,
            "bankAddress" TEXT,
            "swiftCode" TEXT NOT NULL,
            "accountNumber" TEXT NOT NULL,
            "routingNumber" TEXT,
            "description" TEXT,
            "reference" TEXT NOT NULL,
            "status" "TransferStatus" NOT NULL DEFAULT 'PENDING',
            "estimatedDelivery" TIMESTAMP(3) NOT NULL,
            "completedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,

            CONSTRAINT "international_transfers_pkey" PRIMARY KEY ("id")
        );
        
        -- Add unique constraint on reference
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_reference_key" UNIQUE ("reference");
        
        -- Add foreign key constraints
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        ALTER TABLE "international_transfers" ADD CONSTRAINT "international_transfers_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        -- Create indexes
        CREATE INDEX "international_transfers_userId_idx" ON "international_transfers"("userId");
        CREATE INDEX "international_transfers_accountId_idx" ON "international_transfers"("accountId");
        CREATE INDEX "international_transfers_status_idx" ON "international_transfers"("status");
        CREATE INDEX "international_transfers_createdAt_idx" ON "international_transfers"("createdAt");
        
        -- Enable RLS
        ALTER TABLE "international_transfers" ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own international transfers" ON "international_transfers"
            FOR SELECT USING (auth.uid()::text = "userId");
        CREATE POLICY "Users can insert their own international transfers" ON "international_transfers"
            FOR INSERT WITH CHECK (auth.uid()::text = "userId");
        CREATE POLICY "Users can update their own international transfers" ON "international_transfers"
            FOR UPDATE USING (auth.uid()::text = "userId");
        
        -- Grant permissions
        GRANT ALL ON "international_transfers" TO authenticated;
        GRANT ALL ON "international_transfers" TO service_role;
        
        RAISE NOTICE 'international_transfers table created successfully';
    ELSE
        RAISE NOTICE 'international_transfers table already exists, skipping creation...';
    END IF;
END $$;

-- If table already exists, just add missing columns
DO $$ BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'international_transfers') THEN
        -- Add missing columns one by one
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "transactionId" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'transactionId') = 'text' THEN
                UPDATE "international_transfers" SET "transactionId" = '' WHERE "transactionId" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "transactionId" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'transactionId column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "exchangeRate" DECIMAL(65,30);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'exchangeRate') = 'numeric' THEN
                UPDATE "international_transfers" SET "exchangeRate" = 1 WHERE "exchangeRate" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "exchangeRate" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'exchangeRate column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "convertedAmount" DECIMAL(65,30);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'convertedAmount') = 'numeric' THEN
                UPDATE "international_transfers" SET "convertedAmount" = 0 WHERE "convertedAmount" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "convertedAmount" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'convertedAmount column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "transferFee" DECIMAL(65,30);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'transferFee') = 'numeric' THEN
                UPDATE "international_transfers" SET "transferFee" = 0 WHERE "transferFee" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "transferFee" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'transferFee column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "totalAmount" DECIMAL(65,30);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'totalAmount') = 'numeric' THEN
                UPDATE "international_transfers" SET "totalAmount" = 0 WHERE "totalAmount" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "totalAmount" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'totalAmount column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryName" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'beneficiaryName') = 'text' THEN
                UPDATE "international_transfers" SET "beneficiaryName" = '' WHERE "beneficiaryName" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "beneficiaryName" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'beneficiaryName column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryAddress" TEXT;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'beneficiaryAddress column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryCity" TEXT;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'beneficiaryCity column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "beneficiaryCountry" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'beneficiaryCountry') = 'text' THEN
                UPDATE "international_transfers" SET "beneficiaryCountry" = '' WHERE "beneficiaryCountry" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "beneficiaryCountry" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'beneficiaryCountry column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "bankName" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'bankName') = 'text' THEN
                UPDATE "international_transfers" SET "bankName" = '' WHERE "bankName" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "bankName" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'bankName column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "bankAddress" TEXT;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'bankAddress column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "swiftCode" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'swiftCode') = 'text' THEN
                UPDATE "international_transfers" SET "swiftCode" = '' WHERE "swiftCode" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "swiftCode" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'swiftCode column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "accountNumber" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'accountNumber') = 'text' THEN
                UPDATE "international_transfers" SET "accountNumber" = '' WHERE "accountNumber" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "accountNumber" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'accountNumber column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "routingNumber" TEXT;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'routingNumber column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "description" TEXT;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'description column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "reference" TEXT;
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'reference') = 'text' THEN
                UPDATE "international_transfers" SET "reference" = '' WHERE "reference" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "reference" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'reference column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "status" "TransferStatus";
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'status') = 'USER-DEFINED' THEN
                UPDATE "international_transfers" SET "status" = 'PENDING' WHERE "status" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "status" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'status column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "estimatedDelivery" TIMESTAMP(3);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'estimatedDelivery') = 'timestamp without time zone' THEN
                UPDATE "international_transfers" SET "estimatedDelivery" = CURRENT_TIMESTAMP WHERE "estimatedDelivery" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "estimatedDelivery" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'estimatedDelivery column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'completedAt column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'createdAt') = 'timestamp without time zone' THEN
                UPDATE "international_transfers" SET "createdAt" = CURRENT_TIMESTAMP WHERE "createdAt" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "createdAt" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'createdAt column already exists or error occurred: %', SQLERRM;
        END;
        
        BEGIN
            ALTER TABLE "international_transfers" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);
            IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'international_transfers' AND column_name = 'updatedAt') = 'timestamp without time zone' THEN
                UPDATE "international_transfers" SET "updatedAt" = CURRENT_TIMESTAMP WHERE "updatedAt" IS NULL;
                ALTER TABLE "international_transfers" ALTER COLUMN "updatedAt" SET NOT NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'updatedAt column already exists or error occurred: %', SQLERRM;
        END;
        
        RAISE NOTICE 'Missing columns added to existing international_transfers table';
    END IF;
END $$;

-- Create missing indexes if they don't exist
CREATE INDEX IF NOT EXISTS "international_transfers_userId_idx" ON "international_transfers"("userId");
CREATE INDEX IF NOT EXISTS "international_transfers_accountId_idx" ON "international_transfers"("accountId");
CREATE INDEX IF NOT EXISTS "international_transfers_status_idx" ON "international_transfers"("status");
CREATE INDEX IF NOT EXISTS "international_transfers_createdAt_idx" ON "international_transfers"("createdAt");

-- Enable RLS if not already enabled
ALTER TABLE "international_transfers" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'international_transfers' AND policyname = 'Users can view their own international transfers') THEN
        CREATE POLICY "Users can view their own international transfers" ON "international_transfers"
            FOR SELECT USING (auth.uid()::text = "userId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'international_transfers' AND policyname = 'Users can insert their own international transfers') THEN
        CREATE POLICY "Users can insert their own international transfers" ON "international_transfers"
            FOR INSERT WITH CHECK (auth.uid()::text = "userId");
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'international_transfers' AND policyname = 'Users can update their own international transfers') THEN
        CREATE POLICY "Users can update their own international transfers" ON "international_transfers"
            FOR UPDATE USING (auth.uid()::text = "userId");
    END IF;
END $$;

-- Grant permissions
GRANT ALL ON "international_transfers" TO authenticated;
GRANT ALL ON "international_transfers" TO service_role;

-- Add comments
COMMENT ON TABLE "international_transfers" IS 'International transfer records with SWIFT code support';
COMMENT ON COLUMN "international_transfers"."swiftCode" IS 'SWIFT/BIC code for international bank identification';
COMMENT ON COLUMN "international_transfers"."exchangeRate" IS 'Exchange rate used for currency conversion';
COMMENT ON COLUMN "international_transfers"."convertedAmount" IS 'Amount after currency conversion';
COMMENT ON COLUMN "international_transfers"."transferFee" IS 'International transfer fee (typically 2%)';
COMMENT ON COLUMN "international_transfers"."estimatedDelivery" IS 'Estimated delivery time (1-3 business days)';

-- Final success message
DO $$ BEGIN
    RAISE NOTICE 'International transfers setup completed successfully!';
    RAISE NOTICE 'Table: international_transfers';
    RAISE NOTICE 'Enum: TransferStatus';
    RAISE NOTICE 'RLS: Enabled with user-specific policies';
    RAISE NOTICE 'Ready for international transfer functionality!';
END $$;
