-- ============================================
-- Real Estate CRM Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Links to auth.users, stores app-specific user data
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'agent' CHECK (role IN ('agent', 'admin')),
  trial_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DEAL STAGES ENUM
-- ============================================
CREATE TYPE deal_stage AS ENUM (
  'new_lead_buyer',
  'new_lead_seller',
  'viewing_scheduling',
  'post_viewing',
  'offer_preparation',
  'offer_submitted',
  'offer_received_seller',
  'negotiation',
  'contract_signing_buyer',
  'contract_signing_seller',
  'financing_check',
  'missing_documents',
  'third_party_followup',
  'closing_buyer',
  'closing_seller'
);

-- ============================================
-- DEALS TABLE
-- ============================================
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_type TEXT NOT NULL CHECK (client_type IN ('buyer', 'seller')),
  property_address TEXT,
  deal_stage deal_stage NOT NULL DEFAULT 'new_lead_buyer',
  last_contact_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  missing_item TEXT,
  next_step TEXT,
  deadline TIMESTAMPTZ,
  notes TEXT,
  archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Deals policies - users can only access their own deals
CREATE POLICY "Users can view own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_deals_user_id ON public.deals(user_id);
CREATE INDEX idx_deals_last_contact ON public.deals(last_contact_at);
CREATE INDEX idx_deals_stage ON public.deals(deal_stage);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
  tone TEXT NOT NULL CHECK (tone IN ('friendly', 'neutral', 'firm')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_messages_deal_id ON public.messages(deal_id);
CREATE INDEX idx_messages_user_id ON public.messages(user_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- ============================================
-- API USAGE LOG TABLE (for rate limiting & analytics)
-- ============================================
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  tokens_estimate INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Only allow inserts from server (no select for users)
CREATE POLICY "Service role can insert usage"
  ON public.api_usage FOR INSERT
  WITH CHECK (true);

-- Index for rate limiting queries
CREATE INDEX idx_api_usage_user_created ON public.api_usage(user_id, created_at DESC);

-- ============================================
-- REMINDERS TABLE (optional, computed for MVP)
-- ============================================
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Reminders policies
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_reminders_user_due ON public.reminders(user_id, due_at);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- HELPER FUNCTION: Get deals due for follow-up
-- ============================================
CREATE OR REPLACE FUNCTION public.get_deals_by_urgency(p_user_id UUID)
RETURNS TABLE (
  deal_id UUID,
  client_name TEXT,
  deal_stage deal_stage,
  last_contact_at TIMESTAMPTZ,
  days_since_contact INTEGER,
  follow_up_days INTEGER,
  urgency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id as deal_id,
    d.client_name,
    d.deal_stage,
    d.last_contact_at,
    EXTRACT(DAY FROM NOW() - d.last_contact_at)::INTEGER as days_since_contact,
    CASE d.deal_stage
      WHEN 'new_lead_buyer' THEN 1
      WHEN 'new_lead_seller' THEN 1
      WHEN 'viewing_scheduling' THEN 2
      WHEN 'post_viewing' THEN 1
      WHEN 'offer_preparation' THEN 2
      WHEN 'offer_submitted' THEN 3
      WHEN 'offer_received_seller' THEN 1
      WHEN 'negotiation' THEN 1
      WHEN 'contract_signing_buyer' THEN 2
      WHEN 'contract_signing_seller' THEN 2
      WHEN 'financing_check' THEN 3
      WHEN 'missing_documents' THEN 2
      WHEN 'third_party_followup' THEN 3
      WHEN 'closing_buyer' THEN 2
      WHEN 'closing_seller' THEN 2
      ELSE 3
    END as follow_up_days,
    CASE 
      WHEN EXTRACT(DAY FROM NOW() - d.last_contact_at) > 
        CASE d.deal_stage
          WHEN 'new_lead_buyer' THEN 1
          WHEN 'new_lead_seller' THEN 1
          WHEN 'viewing_scheduling' THEN 2
          WHEN 'post_viewing' THEN 1
          WHEN 'offer_preparation' THEN 2
          WHEN 'offer_submitted' THEN 3
          WHEN 'offer_received_seller' THEN 1
          WHEN 'negotiation' THEN 1
          WHEN 'contract_signing_buyer' THEN 2
          WHEN 'contract_signing_seller' THEN 2
          WHEN 'financing_check' THEN 3
          WHEN 'missing_documents' THEN 2
          WHEN 'third_party_followup' THEN 3
          WHEN 'closing_buyer' THEN 2
          WHEN 'closing_seller' THEN 2
          ELSE 3
        END THEN 'overdue'
      WHEN EXTRACT(DAY FROM NOW() - d.last_contact_at) = 
        CASE d.deal_stage
          WHEN 'new_lead_buyer' THEN 1
          WHEN 'new_lead_seller' THEN 1
          WHEN 'viewing_scheduling' THEN 2
          WHEN 'post_viewing' THEN 1
          WHEN 'offer_preparation' THEN 2
          WHEN 'offer_submitted' THEN 3
          WHEN 'offer_received_seller' THEN 1
          WHEN 'negotiation' THEN 1
          WHEN 'contract_signing_buyer' THEN 2
          WHEN 'contract_signing_seller' THEN 2
          WHEN 'financing_check' THEN 3
          WHEN 'missing_documents' THEN 2
          WHEN 'third_party_followup' THEN 3
          WHEN 'closing_buyer' THEN 2
          WHEN 'closing_seller' THEN 2
          ELSE 3
        END THEN 'due_today'
      ELSE 'upcoming'
    END as urgency
  FROM public.deals d
  WHERE d.user_id = p_user_id
    AND d.archived = false
  ORDER BY 
    CASE 
      WHEN EXTRACT(DAY FROM NOW() - d.last_contact_at) > 
        CASE d.deal_stage
          WHEN 'new_lead_buyer' THEN 1
          WHEN 'new_lead_seller' THEN 1
          ELSE 2
        END THEN 0
      ELSE 1
    END,
    d.last_contact_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
