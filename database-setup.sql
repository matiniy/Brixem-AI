-- Brixem Database Setup Script
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  company VARCHAR,
  role VARCHAR CHECK (role IN ('homeowner', 'contractor')) NOT NULL,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  type VARCHAR NOT NULL,
  location VARCHAR NOT NULL,
  description TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(12,2),
  status VARCHAR CHECK (status IN ('planning', 'in-progress', 'completed', 'on-hold')) DEFAULT 'planning',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR CHECK (status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo',
  priority VARCHAR CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date DATE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_users UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_messages table for AI conversations
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR CHECK (role IN ('user', 'ai')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table for payments
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR UNIQUE,
  stripe_customer_id VARCHAR,
  plan_type VARCHAR CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise')) DEFAULT 'free',
  status VARCHAR CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_logs table for tracking API usage
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_project_id ON chat_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can view tasks in own projects" ON tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert tasks in own projects" ON tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update tasks in own projects" ON tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete tasks in own projects" ON tasks
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = tasks.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Chat messages policies
CREATE POLICY "Users can view chat messages in own projects" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = chat_messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert chat messages in own projects" ON chat_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = chat_messages.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Usage logs policies
CREATE POLICY "Users can view own usage logs" ON usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON usage_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions for common operations
CREATE OR REPLACE FUNCTION get_user_projects(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    type VARCHAR,
    location VARCHAR,
    description TEXT,
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, p.type, p.location, p.description, 
           p.start_date, p.end_date, p.budget, p.status, 
           p.created_at, p.updated_at
    FROM projects p
    WHERE p.user_id = user_uuid
    ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get project with tasks
CREATE OR REPLACE FUNCTION get_project_with_tasks(project_uuid UUID)
RETURNS TABLE (
    project_id UUID,
    project_name VARCHAR,
    project_type VARCHAR,
    project_location VARCHAR,
    project_description TEXT,
    project_start_date DATE,
    project_end_date DATE,
    project_budget DECIMAL(12,2),
    project_status VARCHAR,
    task_id UUID,
    task_title VARCHAR,
    task_description TEXT,
    task_status VARCHAR,
    task_priority VARCHAR,
    task_due_date DATE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as project_id,
        p.name as project_name,
        p.type as project_type,
        p.location as project_location,
        p.description as project_description,
        p.start_date as project_start_date,
        p.end_date as project_end_date,
        p.budget as project_budget,
        p.status as project_status,
        t.id as task_id,
        t.title as task_title,
        t.description as task_description,
        t.status as task_status,
        t.priority as task_priority,
        t.due_date as task_due_date
    FROM projects p
    LEFT JOIN tasks t ON p.id = t.project_id
    WHERE p.id = project_uuid
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample data for testing (optional)
-- Uncomment these lines if you want sample data

/*
INSERT INTO users (email, first_name, last_name, role) VALUES
('john@example.com', 'John', 'Doe', 'homeowner'),
('jane@example.com', 'Jane', 'Smith', 'contractor');

INSERT INTO projects (name, type, location, description, start_date, user_id) VALUES
('Kitchen Renovation', 'renovation', 'New York, NY', 'Complete kitchen renovation with new cabinets and countertops', '2024-01-15', (SELECT id FROM users WHERE email = 'john@example.com')),
('Bathroom Remodel', 'remodel', 'Los Angeles, CA', 'Master bathroom remodel with modern fixtures', '2024-02-01', (SELECT id FROM users WHERE email = 'john@example.com'));

INSERT INTO tasks (title, description, status, priority, project_id) VALUES
('Demolition', 'Remove old cabinets and countertops', 'completed', 'high', (SELECT id FROM projects WHERE name = 'Kitchen Renovation')),
('Install Cabinets', 'Install new kitchen cabinets', 'in-progress', 'medium', (SELECT id FROM projects WHERE name = 'Kitchen Renovation')),
('Countertop Installation', 'Install granite countertops', 'todo', 'medium', (SELECT id FROM projects WHERE name = 'Kitchen Renovation'));
*/ 