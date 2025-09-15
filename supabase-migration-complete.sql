-- Brixem Complete Database Migration
-- Run this in your Supabase SQL Editor to add missing tables for full functionality
-- This builds on your existing workspace-based schema

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create milestones table for project phases
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_new(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'doing', 'done')) DEFAULT 'todo',
  due_date DATE,
  order_index INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table (enhanced version)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_new(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_users UUID[] DEFAULT '{}',
  due_date DATE,
  estimated_hours DECIMAL(5,2),
  comments_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table for tasks and projects
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects_new(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comments_target_check CHECK (
    (project_id IS NOT NULL AND task_id IS NULL) OR 
    (project_id IS NULL AND task_id IS NOT NULL)
  )
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'comment_added', 'milestone_reached', 'project_updated')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create project members table for collaboration
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id UUID NOT NULL REFERENCES public.projects_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (project_id, user_id)
);

-- Create audit logs table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  changed_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create chat messages table for AI conversations
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects_new(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create file attachments table
CREATE TABLE IF NOT EXISTS public.file_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects_new(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT file_attachments_target_check CHECK (
    (project_id IS NOT NULL AND task_id IS NULL AND comment_id IS NULL) OR 
    (project_id IS NULL AND task_id IS NOT NULL AND comment_id IS NULL) OR 
    (project_id IS NULL AND task_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_milestone_id ON public.tasks(milestone_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_users ON public.tasks USING GIN(assigned_users);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace_id ON public.notifications(workspace_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read_at ON public.notifications(read_at);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON public.audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON public.audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON public.chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_project_id ON public.file_attachments(project_id);
CREATE INDEX IF NOT EXISTS idx_file_attachments_task_id ON public.file_attachments(task_id);

-- Create updated_at triggers
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Milestones
CREATE POLICY "select milestones in my workspaces" ON public.milestones FOR SELECT USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "insert milestones in my workspaces" ON public.milestones FOR INSERT WITH CHECK (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "update milestones in my workspaces" ON public.milestones FOR UPDATE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "delete milestones in my workspaces" ON public.milestones FOR DELETE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);

-- Tasks
CREATE POLICY "select tasks in my workspaces" ON public.tasks FOR SELECT USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "insert tasks in my workspaces" ON public.tasks FOR INSERT WITH CHECK (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "update tasks in my workspaces" ON public.tasks FOR UPDATE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "delete tasks in my workspaces" ON public.tasks FOR DELETE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);

-- Comments
CREATE POLICY "select comments in my workspaces" ON public.comments FOR SELECT USING (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id)))
);
CREATE POLICY "insert comments in my workspaces" ON public.comments FOR INSERT WITH CHECK (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id)))
);
CREATE POLICY "update comments in my workspaces" ON public.comments FOR UPDATE USING (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id)))
);
CREATE POLICY "delete comments in my workspaces" ON public.comments FOR DELETE USING (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id)))
);

-- Notifications
CREATE POLICY "select my notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "insert notifications for workspace members" ON public.notifications FOR INSERT WITH CHECK (
  public.is_workspace_member(workspace_id)
);
CREATE POLICY "update my notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Project Members
CREATE POLICY "select project members in my workspaces" ON public.project_members FOR SELECT USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "insert project members in my workspaces" ON public.project_members FOR INSERT WITH CHECK (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "update project members in my workspaces" ON public.project_members FOR UPDATE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "delete project members in my workspaces" ON public.project_members FOR DELETE USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);

-- Audit Logs
CREATE POLICY "select audit logs in my workspaces" ON public.audit_logs FOR SELECT USING (
  public.is_workspace_member(workspace_id)
);
CREATE POLICY "insert audit logs in my workspaces" ON public.audit_logs FOR INSERT WITH CHECK (
  public.is_workspace_member(workspace_id)
);

-- Chat Messages
CREATE POLICY "select chat messages in my workspaces" ON public.chat_messages FOR SELECT USING (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);
CREATE POLICY "insert chat messages in my workspaces" ON public.chat_messages FOR INSERT WITH CHECK (
  public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))
);

-- File Attachments
CREATE POLICY "select file attachments in my workspaces" ON public.file_attachments FOR SELECT USING (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id))) OR
  (comment_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id JOIN public.comments c ON t.id = c.task_id WHERE c.id = comment_id)))
);
CREATE POLICY "insert file attachments in my workspaces" ON public.file_attachments FOR INSERT WITH CHECK (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id))) OR
  (comment_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id JOIN public.comments c ON t.id = c.task_id WHERE c.id = comment_id)))
);
CREATE POLICY "delete file attachments in my workspaces" ON public.file_attachments FOR DELETE USING (
  (project_id IS NOT NULL AND public.is_workspace_member((SELECT workspace_id FROM public.projects_new p WHERE p.id = project_id))) OR
  (task_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id WHERE t.id = task_id))) OR
  (comment_id IS NOT NULL AND public.is_workspace_member((SELECT p.workspace_id FROM public.projects_new p JOIN public.tasks t ON p.id = t.project_id JOIN public.comments c ON t.id = c.task_id WHERE c.id = comment_id)))
);

-- Grant necessary permissions
GRANT ALL ON public.milestones TO anon, authenticated;
GRANT ALL ON public.tasks TO anon, authenticated;
GRANT ALL ON public.comments TO anon, authenticated;
GRANT ALL ON public.notifications TO anon, authenticated;
GRANT ALL ON public.project_members TO anon, authenticated;
GRANT ALL ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.file_attachments TO anon, authenticated;

-- Create helper functions for common operations

-- Function to get project progress
CREATE OR REPLACE FUNCTION public.get_project_progress(project_uuid UUID)
RETURNS INTEGER LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(
    ROUND(
      (SELECT COUNT(*) FROM public.tasks WHERE project_id = project_uuid AND status = 'completed')::DECIMAL / 
      NULLIF((SELECT COUNT(*) FROM public.tasks WHERE project_id = project_uuid), 0) * 100
    ), 0
  );
$$;

-- Function to get milestone progress
CREATE OR REPLACE FUNCTION public.get_milestone_progress(milestone_uuid UUID)
RETURNS INTEGER LANGUAGE SQL STABLE AS $$
  SELECT COALESCE(
    ROUND(
      (SELECT COUNT(*) FROM public.tasks WHERE milestone_id = milestone_uuid AND status = 'completed')::DECIMAL / 
      NULLIF((SELECT COUNT(*) FROM public.tasks WHERE milestone_id = milestone_uuid), 0) * 100
    ), 0
  );
$$;

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION public.create_audit_log(
  table_name TEXT,
  record_id UUID,
  action TEXT,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL
)
RETURNS VOID LANGUAGE SQL SECURITY DEFINER AS $$
  INSERT INTO public.audit_logs (workspace_id, table_name, record_id, action, old_values, new_values, changed_by)
  SELECT 
    p.workspace_id,
    table_name,
    record_id,
    action,
    old_values,
    new_values,
    auth.uid()
  FROM public.projects_new p
  WHERE p.id = record_id
  LIMIT 1;
$$;

-- Create triggers for audit logging
CREATE OR REPLACE FUNCTION public.audit_trigger()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (workspace_id, table_name, record_id, action, new_values, changed_by)
    SELECT 
      p.workspace_id,
      TG_TABLE_NAME,
      NEW.id,
      'INSERT',
      to_jsonb(NEW),
      auth.uid()
    FROM public.projects_new p
    WHERE p.id = NEW.project_id
    LIMIT 1;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (workspace_id, table_name, record_id, action, old_values, new_values, changed_by)
    SELECT 
      p.workspace_id,
      TG_TABLE_NAME,
      NEW.id,
      'UPDATE',
      to_jsonb(OLD),
      to_jsonb(NEW),
      auth.uid()
    FROM public.projects_new p
    WHERE p.id = NEW.project_id
    LIMIT 1;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (workspace_id, table_name, record_id, action, old_values, changed_by)
    SELECT 
      p.workspace_id,
      TG_TABLE_NAME,
      OLD.id,
      'DELETE',
      to_jsonb(OLD),
      auth.uid()
    FROM public.projects_new p
    WHERE p.id = OLD.project_id
    LIMIT 1;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

CREATE TRIGGER audit_milestones AFTER INSERT OR UPDATE OR DELETE ON public.milestones
    FOR EACH ROW EXECUTE FUNCTION public.audit_trigger();

-- Update task counts when tasks are modified
CREATE OR REPLACE FUNCTION public.update_task_counts()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update comments count for the task
    UPDATE public.tasks 
    SET comments_count = (
      SELECT COUNT(*) FROM public.comments WHERE task_id = NEW.id
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_task_counts_trigger AFTER INSERT OR UPDATE OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_task_counts();
