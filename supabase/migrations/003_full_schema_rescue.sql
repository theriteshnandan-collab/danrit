-- =============================================
-- DANRIT: Full Database Schema (Rescue)
-- Run this in Supabase SQL Editor to fix missing tables
-- =============================================

-- 1. Create Profiles Table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ,
    
    -- Monetization Columns
    credits_balance INTEGER DEFAULT 50,
    tier TEXT DEFAULT 'free', -- 'free' | 'pro'
    daily_usage JSONB DEFAULT '{}',
    last_usage_reset TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT username_length CHECK (char_length(full_name) >= 3)
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- 4. Create Trigger to Auto-Create Profile on Signup
-- (Standard Supabase Pattern)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits_balance)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    50 -- Free 50 credits on signup
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger checks
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Backfill existing users (if any)
INSERT INTO public.profiles (id, email, credits_balance)
SELECT id, email, 50
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 6. Create Credit Packs Table (Monetization)
CREATE TABLE IF NOT EXISTS credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    amount_paid_cents INTEGER NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_provider TEXT DEFAULT 'razorpay',
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Credit Packs RLS
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit packs"
ON credit_packs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_credit_packs_user_id ON credit_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- 9. Usage Logs (Telemetry)
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    key_id UUID, -- For API Keys
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    duration_ms INTEGER,
    cost INTEGER DEFAULT 0,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
ON usage_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service Role (Backend) Policy
CREATE POLICY "Service role can insert logs"
ON usage_logs FOR INSERT
TO service_role
WITH CHECK (true);
