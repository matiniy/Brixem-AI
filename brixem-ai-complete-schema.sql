-- Brixem AI - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    company TEXT,
    role TEXT CHECK (role IN ('homeowner', 'contractor', 'consultant')) DEFAULT 'homeowner',
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    location TEXT,
    description TEXT,
    size_sqft INTEGER,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('task_assigned', 'task_completed', 'milestone_due', 'project_update', 'comment_added')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id UUID, -- Can reference task, milestone, or project
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system')),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create file_attachments table
CREATE TABLE IF NOT EXISTS file_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON comments(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON comments(task_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create audit log trigger function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), OLD.created_by);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create audit triggers
CREATE TRIGGER audit_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION create_audit_log();
CREATE TRIGGER audit_milestones AFTER INSERT OR UPDATE OR DELETE ON milestones FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Create helper function for project progress
CREATE OR REPLACE FUNCTION calculate_project_progress(project_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE project_id = project_uuid;
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE project_id = project_uuid AND status = 'completed';
    
    progress_percentage := (completed_tasks * 100) / total_tasks;
    
    RETURN progress_percentage;
END;
$$ language 'plpgsql';

-- Create helper function for milestone progress
CREATE OR REPLACE FUNCTION calculate_milestone_progress(milestone_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    total_tasks INTEGER;
    completed_tasks INTEGER;
    progress_percentage INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_tasks FROM tasks WHERE milestone_id = milestone_uuid;
    
    IF total_tasks = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_tasks FROM tasks WHERE milestone_id = milestone_uuid AND status = 'completed';
    
    progress_percentage := (completed_tasks * 100) / total_tasks;
    
    RETURN progress_percentage;
END;
$$ language 'plpgsql';

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_attachments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view projects they created or are members of" ON projects FOR SELECT USING (
    created_by = auth.uid() OR 
    id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Project owners can update projects" ON projects FOR UPDATE USING (auth.uid() = created_by);
CREATE POLICY "Project owners can delete projects" ON projects FOR DELETE USING (auth.uid() = created_by);

-- Tasks policies
CREATE POLICY "Users can view tasks from their projects" ON tasks FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can create tasks in their projects" ON tasks FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can update tasks in their projects" ON tasks FOR UPDATE USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- Milestones policies
CREATE POLICY "Users can view milestones from their projects" ON milestones FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can create milestones in their projects" ON milestones FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- Comments policies
CREATE POLICY "Users can view comments from their projects" ON comments FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can create comments in their projects" ON comments FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Project members policies
CREATE POLICY "Users can view project members of their projects" ON project_members FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- Chat messages policies
CREATE POLICY "Users can view chat messages from their projects" ON chat_messages FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can create chat messages in their projects" ON chat_messages FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- File attachments policies
CREATE POLICY "Users can view file attachments from their projects" ON file_attachments FOR SELECT USING (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);
CREATE POLICY "Users can create file attachments in their projects" ON file_attachments FOR INSERT WITH CHECK (
    project_id IN (
        SELECT id FROM projects WHERE created_by = auth.uid() OR 
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
);

-- Sample data will be created automatically when users sign up and create projects
-- No need to insert hardcoded data that violates foreign key constraints

COMMIT;
