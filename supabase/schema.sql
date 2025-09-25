-- AI-SaaS Boilerplate Database Schema
-- This schema supports multi-tenancy, RBAC, subscriptions, and credit system

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret-here';

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE subscription_plan AS ENUM ('free', 'starter', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid');
CREATE TYPE credit_transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'expiry');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan subscription_plan DEFAULT 'free',
  credits INTEGER DEFAULT 100,
  max_credits INTEGER DEFAULT 100,
  owner_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table
CREATE TABLE public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role team_role DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  plan subscription_plan DEFAULT 'free',
  status subscription_status DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type credit_transaction_type NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API usage table
CREATE TABLE public.api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  credits_used INTEGER NOT NULL,
  request_data JSONB,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_teams_owner_id ON public.teams(owner_id);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_subscriptions_team_id ON public.subscriptions(team_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_credit_transactions_team_id ON public.credit_transactions(team_id);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_api_usage_team_id ON public.api_usage(team_id);
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Teams policies
CREATE POLICY "Team members can view their teams" ON public.teams
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = teams.id
    )
  );

CREATE POLICY "Team owners can update their teams" ON public.teams
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Team owners can delete their teams" ON public.teams
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create teams" ON public.teams
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Team members can view team membership" ON public.team_members
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.team_members tm2 
      WHERE tm2.team_id = team_members.team_id 
      AND tm2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Team owners and admins can manage team members" ON public.team_members
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members tm2 
      WHERE tm2.team_id = team_members.team_id 
      AND tm2.role IN ('owner', 'admin')
    )
  );

-- Subscriptions policies
CREATE POLICY "Team members can view subscription" ON public.subscriptions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = subscriptions.team_id
    )
  );

CREATE POLICY "Team owners can manage subscription" ON public.subscriptions
  FOR ALL USING (
    auth.uid() IN (
      SELECT owner_id FROM public.teams 
      WHERE id = subscriptions.team_id
    )
  );

-- Credit transactions policies
CREATE POLICY "Team members can view credit transactions" ON public.credit_transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = credit_transactions.team_id
    )
  );

CREATE POLICY "System can insert credit transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (true);

-- API usage policies
CREATE POLICY "Team members can view API usage" ON public.api_usage
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.team_members 
      WHERE team_id = api_usage.team_id
    )
  );

CREATE POLICY "System can insert API usage" ON public.api_usage
  FOR INSERT WITH CHECK (true);

-- Functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to automatically add team owner as team member
CREATE OR REPLACE FUNCTION add_team_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_team_owner_as_member_trigger 
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION add_team_owner_as_member();

-- Function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to deduct credits
CREATE OR REPLACE FUNCTION deduct_credits(
  team_uuid UUID,
  user_uuid UUID,
  credit_amount INTEGER,
  usage_description TEXT,
  usage_metadata JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits 
  FROM public.teams 
  WHERE id = team_uuid;
  
  -- Check if enough credits
  IF current_credits < credit_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE public.teams 
  SET credits = credits - credit_amount 
  WHERE id = team_uuid;
  
  -- Record transaction
  INSERT INTO public.credit_transactions (
    team_id, user_id, amount, type, description, metadata
  ) VALUES (
    team_uuid, user_uuid, -credit_amount, 'usage', usage_description, usage_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;