-- Fix RLS Security Issues for Global Dot Bank
-- Enable Row Level Security on tables and set up proper policies

-- 1. Enable RLS on kycDocuments table
ALTER TABLE "public"."kycDocuments" ENABLE ROW LEVEL SECURITY;

-- Create policy for kycDocuments - users can only see their own KYC documents
CREATE POLICY "Users can view own KYC documents" ON "public"."kycDocuments"
FOR SELECT USING (auth.uid()::text = "userId");

-- Create policy for kycDocuments - users can insert their own KYC documents
CREATE POLICY "Users can insert own KYC documents" ON "public"."kycDocuments"
FOR INSERT WITH CHECK (auth.uid()::text = "userId");

-- Create policy for kycDocuments - users can update their own KYC documents
CREATE POLICY "Users can update own KYC documents" ON "public"."kycDocuments"
FOR UPDATE USING (auth.uid()::text = "userId");

-- Create policy for kycDocuments - users can delete their own KYC documents
CREATE POLICY "Users can delete own KYC documents" ON "public"."kycDocuments"
FOR DELETE USING (auth.uid()::text = "userId");

-- 2. Enable RLS on corporate_banks table
ALTER TABLE "public"."corporate_banks" ENABLE ROW LEVEL SECURITY;

-- Create policy for corporate_banks - only authenticated users can view
CREATE POLICY "Authenticated users can view corporate banks" ON "public"."corporate_banks"
FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for corporate_banks - only admin users can insert/update/delete
-- Note: This assumes you have an admin role or admin users table
-- For now, we'll restrict to authenticated users but you may want to add admin checks
CREATE POLICY "Authenticated users can manage corporate banks" ON "public"."corporate_banks"
FOR ALL USING (auth.role() = 'authenticated');

-- 3. Enable RLS on bank_transfers table
ALTER TABLE "public"."bank_transfers" ENABLE ROW LEVEL SECURITY;

-- Create policy for bank_transfers - users can only see transfers from their accounts
-- This joins with accounts table to check if the fromAccountId belongs to the authenticated user
CREATE POLICY "Users can view own bank transfers" ON "public"."bank_transfers"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "public"."accounts" 
    WHERE "accounts"."id" = "bank_transfers"."fromAccountId" 
    AND "accounts"."userId" = auth.uid()::text
  )
);

-- Create policy for bank_transfers - users can insert transfers from their accounts
CREATE POLICY "Users can create bank transfers" ON "public"."bank_transfers"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM "public"."accounts" 
    WHERE "accounts"."id" = "bank_transfers"."fromAccountId" 
    AND "accounts"."userId" = auth.uid()::text
  )
);

-- Create policy for bank_transfers - users can update their own transfers
CREATE POLICY "Users can update own bank transfers" ON "public"."bank_transfers"
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM "public"."accounts" 
    WHERE "accounts"."id" = "bank_transfers"."fromAccountId" 
    AND "accounts"."userId" = auth.uid()::text
  )
);

-- Create policy for bank_transfers - users can delete their own transfers
CREATE POLICY "Users can delete own bank transfers" ON "public"."bank_transfers"
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM "public"."accounts" 
    WHERE "accounts"."id" = "bank_transfers"."fromAccountId" 
    AND "accounts"."userId" = auth.uid()::text
  )
);

-- Additional security: Enable RLS on other sensitive tables if not already enabled
-- Check and enable RLS on users table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public'
    ) THEN
        ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON "public"."users"
        FOR SELECT USING (auth.uid()::text = id);
        
        CREATE POLICY "Users can update own profile" ON "public"."users"
        FOR UPDATE USING (auth.uid()::text = id);
    END IF;
END $$;

-- Check and enable RLS on accounts table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND schemaname = 'public'
    ) THEN
        ALTER TABLE "public"."accounts" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own accounts" ON "public"."accounts"
        FOR SELECT USING (auth.uid()::text = "userId");
        
        CREATE POLICY "Users can update own accounts" ON "public"."accounts"
        FOR UPDATE USING (auth.uid()::text = "userId");
    END IF;
END $$;

-- Check and enable RLS on transactions table if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND schemaname = 'public'
    ) THEN
        ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own transactions" ON "public"."transactions"
        FOR SELECT USING (auth.uid()::text = "userId");
        
        CREATE POLICY "Users can create transactions" ON "public"."transactions"
        FOR INSERT WITH CHECK (auth.uid()::text = "userId");
    END IF;
END $$;

-- Verify RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('kycDocuments', 'corporate_banks', 'bank_transfers', 'users', 'accounts', 'transactions')
ORDER BY tablename; 