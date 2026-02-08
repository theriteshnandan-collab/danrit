-- =============================================
-- DANRIT: Credits & Monetization Migration
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add monetization columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS daily_usage JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMPTZ DEFAULT NOW();

-- 2. Create Credit Packs table (for purchase history)
CREATE TABLE IF NOT EXISTS credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits INTEGER NOT NULL,
    amount_paid_cents INTEGER NOT NULL, -- In cents (e.g., 1000 = $10)
    currency TEXT DEFAULT 'USD',
    payment_provider TEXT DEFAULT 'razorpay', -- 'razorpay' | 'lemonsqueezy'
    payment_id TEXT, -- External payment reference
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add RLS policies
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit packs"
ON credit_packs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_packs_user_id ON credit_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- 5. Grant access to service role (for backend updates)
-- (Service role has full access by default)

-- =============================================
-- VERIFICATION: Check if columns exist
-- =============================================
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
