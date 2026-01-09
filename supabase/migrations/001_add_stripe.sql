-- ============================================
-- Migration: Add Stripe subscription columns
-- Run this AFTER the initial schema
-- ============================================

-- Add Stripe columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

-- Create index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);

-- Update existing users to have trial end date
UPDATE public.profiles 
SET trial_ends_at = created_at + INTERVAL '7 days'
WHERE trial_ends_at IS NULL;
