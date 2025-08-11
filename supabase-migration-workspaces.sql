-- Brixem Workspace Migration
-- Run this in your Supabase SQL Editor to add workspace support
-- This migration adds new tables and RLS without affecting existing data

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (replaces users table structure)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('homeowner', 'contractor')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'owner',
  PRIMARY KEY (workspace_id, user_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create new projects table (workspace-based)
CREATE TABLE IF NOT EXISTS public.projects_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  location TEXT,
  description TEXT,
  size_sqft INTEGER,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2),
  status TEXT DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create documents table for generated content
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_new(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('sow', 'estimate', 'contract', 'other')) NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT,
  pdf_path TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create usage events table for metering
CREATE TABLE IF NOT EXISTS public.usage_events (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event TEXT NOT NULL, -- 'chat', 'generate_doc', 'export_pdf'
  qty INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create new subscriptions table (workspace-based)
CREATE TABLE IF NOT EXISTS public.subscriptions_new (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('free', 'plus')) DEFAULT 'free',
  status TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_projects_new_workspace_id ON public.projects_new(workspace_id);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_usage_events_workspace_id ON public.usage_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_new_workspace_id ON public.subscriptions_new(workspace_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_new_updated_at BEFORE UPDATE ON public.projects_new
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_new_updated_at BEFORE UPDATE ON public.subscriptions_new
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects_new ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions_new ENABLE ROW LEVEL SECURITY;

-- Helper function: membership check
CREATE OR REPLACE FUNCTION public.is_workspace_member(wid UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = wid AND user_id = auth.uid()
  );
$$;

-- RLS Policies

-- Profiles
CREATE POLICY "read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());

-- Workspaces
CREATE POLICY "select workspaces I belong to" ON public.workspaces FOR SELECT USING (public.is_workspace_member(id));
CREATE POLICY "insert own workspaces" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspace Members
CREATE POLICY "select my memberships" ON public.workspace_members FOR SELECT USING (user_id = auth.uid() OR public.is_workspace_member(workspace_id));
CREATE POLICY "insert workspace members" ON public.workspace_members FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));

-- Projects
CREATE POLICY "select projects in my workspaces" ON public.projects_new FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "insert projects in my workspaces" ON public.projects_new FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "update projects in my workspaces" ON public.projects_new FOR UPDATE USING (public.is_workspace_member(workspace_id));
CREATE POLICY "delete projects in my workspaces" ON public.projects_new FOR DELETE USING (public.is_workspace_member(workspace_id));

-- Documents
CREATE POLICY "select docs in my workspaces" ON public.documents FOR SELECT USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "insert docs in my workspaces" ON public.documents FOR INSERT WITH CHECK (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "update docs in my workspaces" ON public.documents FOR UPDATE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "delete docs in my workspaces" ON public.documents FOR DELETE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);

-- Usage Events
CREATE POLICY "usage in my workspaces" ON public.usage_events FOR ALL USING (public.is_workspace_member(workspace_id));

-- Subscriptions
CREATE POLICY "select subscription in my workspace" ON public.subscriptions_new FOR SELECT USING (public.is_workspace_member(workspace_id));
CREATE POLICY "insert subscription in my workspace" ON public.subscriptions_new FOR INSERT WITH CHECK (public.is_workspace_member(workspace_id));
CREATE POLICY "update subscription in my workspace" ON public.subscriptions_new FOR UPDATE USING (public.is_workspace_member(workspace_id));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.workspaces TO anon, authenticated;
GRANT ALL ON public.workspace_members TO anon, authenticated;
GRANT ALL ON public.projects_new TO anon, authenticated;
GRANT ALL ON public.documents TO anon, authenticated;
GRANT ALL ON public.usage_events TO anon, authenticated;
GRANT ALL ON public.subscriptions_new TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.usage_events_id_seq TO anon, authenticated;

-- Insert default free subscription for existing users (run this after user creation)
-- This will be handled by the provisioning API route
