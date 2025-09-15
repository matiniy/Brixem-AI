import { createClient } from '@supabase/supabase-js';
import { cache, cacheKeys } from './cache';
import { logError } from './error-handling';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  role?: 'homeowner' | 'contractor';
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  type?: string;
  location?: string;
  description?: string;
  size_sqft?: number;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  project_id: string;
  assigned_users: string[];
  created_at: string;
  updated_at: string;
}

// User management functions
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    logError(error as Error, { function: 'getCurrentUser' });
    return null;
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    // Check cache first
    const cached = cache.get<User>(cacheKeys.userProfile(userId));
    if (cached) return cached;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Cache the result
    if (data) {
      cache.set(cacheKeys.userProfile(userId), data, 10 * 60 * 1000); // 10 minutes
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'getUserProfile', userId });
    return null;
  }
}

export async function createUserProfile(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    if (data) {
      cache.delete(cacheKeys.userProfile(data.id));
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'createUserProfile', userData });
    return null;
  }
}

// Project management functions
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    // Check cache first
    const cached = cache.get<Project[]>(cacheKeys.userProjects(userId));
    if (cached) return cached;

    const { data, error } = await supabase
      .from('projects_new')
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cache the result
    if (data) {
      cache.set(cacheKeys.userProjects(userId), data, 5 * 60 * 1000); // 5 minutes
    }

    return data || [];
  } catch (error) {
    logError(error as Error, { function: 'getUserProjects', userId });
    return [];
  }
}

export async function createProject(projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects_new')
      .insert([projectData])
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    if (data) {
      cache.delete(cacheKeys.userProjects(data.user_id));
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'createProject', projectData });
    return null;
  }
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
  try {
    const { data, error } = await supabase
      .from('projects_new')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate caches
    if (data) {
      cache.delete(cacheKeys.project(projectId));
      cache.delete(cacheKeys.userProjects(data.user_id));
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'updateProject', projectId, updates });
    return null;
  }
}

// Task management functions
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  try {
    // Check cache first
    const cached = cache.get<Task[]>(cacheKeys.projectTasks(projectId));
    if (cached) return cached;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Cache the result
    if (data) {
      cache.set(cacheKeys.projectTasks(projectId), data, 5 * 60 * 1000); // 5 minutes
    }

    return data || [];
  } catch (error) {
    logError(error as Error, { function: 'getProjectTasks', projectId });
    return [];
  }
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    if (data) {
      cache.delete(cacheKeys.projectTasks(data.project_id));
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'createTask', taskData });
    return null;
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;

    // Invalidate cache
    if (data) {
      cache.delete(cacheKeys.projectTasks(data.project_id));
    }

    return data;
  } catch (error) {
    logError(error as Error, { function: 'updateTask', taskId, updates });
    return null;
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    // Get task first to know project_id for cache invalidation
    const { data: task } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;

    // Invalidate cache
    if (task) {
      cache.delete(cacheKeys.projectTasks(task.project_id));
    }

    return true;
  } catch (error) {
    logError(error as Error, { function: 'deleteTask', taskId });
    return false;
  }
}

// Authentication helpers
export async function signUp(email: string, password: string, userData: Partial<User>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logError(error as Error, { function: 'signUp', email });
    return { data: null, error: error as Error };
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logError(error as Error, { function: 'signIn', email });
    return { data: null, error: error as Error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear all caches on sign out
    cache.clear();
  } catch (error) {
    logError(error as Error, { function: 'signOut' });
    throw error;
  }
}

// Real-time subscriptions
export function subscribeToProjectChanges(projectId: string, callback: (payload: unknown) => void) {
  return supabase
    .channel(`project:${projectId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'tasks',
      filter: `project_id=eq.${projectId}`
    }, callback)
    .subscribe();
}

export function subscribeToUserProjects(userId: string, callback: (payload: unknown) => void) {
  return supabase
    .channel(`user-projects:${userId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'projects_new',
      filter: `created_by=eq.${userId}`
    }, callback)
    .subscribe();
} 