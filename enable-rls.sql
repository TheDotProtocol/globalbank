-- Enable Row Level Security (RLS) on all tables
-- Run this in your Supabase SQL Editor

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Enable RLS on accounts table
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on cards table
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Enable RLS on fixed_deposits table
ALTER TABLE public.fixed_deposits ENABLE ROW LEVEL SECURITY;

-- Enable RLS on kyc_documents table
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

-- Enable RLS on ai_interactions table
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on e_checks table
ALTER TABLE public.e_checks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can update own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can insert own cards" ON public.cards;
DROP POLICY IF EXISTS "Users can view own fixed deposits" ON public.fixed_deposits;
DROP POLICY IF EXISTS "Users can insert own fixed deposits" ON public.fixed_deposits;
DROP POLICY IF EXISTS "Users can view own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can insert own KYC documents" ON public.kyc_documents;
DROP POLICY IF EXISTS "Users can view own AI interactions" ON public.ai_interactions;
DROP POLICY IF EXISTS "Users can insert own AI interactions" ON public.ai_interactions;
DROP POLICY IF EXISTS "Users can view own e-checks" ON public.e_checks;
DROP POLICY IF EXISTS "Users can insert own e-checks" ON public.e_checks;

-- Create optimized RLS policies for each table
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING ((select auth.uid()) = id);

-- Accounts - users can only access their own accounts
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own accounts" ON public.accounts
    FOR UPDATE USING ((select auth.uid()) = user_id);

-- Transactions - users can only access their own transactions
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Cards - users can only access their own cards
CREATE POLICY "Users can view own cards" ON public.cards
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own cards" ON public.cards
    FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own cards" ON public.cards
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Fixed deposits - users can only access their own
CREATE POLICY "Users can view own fixed deposits" ON public.fixed_deposits
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own fixed deposits" ON public.fixed_deposits
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- KYC documents - users can only access their own
CREATE POLICY "Users can view own KYC documents" ON public.kyc_documents
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own KYC documents" ON public.kyc_documents
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- AI interactions - users can only access their own
CREATE POLICY "Users can view own AI interactions" ON public.ai_interactions
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own AI interactions" ON public.ai_interactions
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- E-checks - users can only access their own
CREATE POLICY "Users can view own e-checks" ON public.e_checks
    FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own e-checks" ON public.e_checks
    FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename; 