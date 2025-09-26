'use server';

import { createUserClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export interface CreateProjectData {
  name: string;
  location: string;
  size_sqft?: number;
  description?: string;
  type?: string;
}

export async function createProject(formData: CreateProjectData) {
  try {
    console.log('createProject: Connecting to Supabase...');
    
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('User not authenticated');
    }
    
    // Get user's workspace
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();
    
    if (!workspaceMember) {
      throw new Error('No workspace found for user');
    }
    
    // Create project in Supabase
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        workspace_id: workspaceMember.workspace_id,
        name: formData.name,
        type: formData.type,
        location: formData.location,
        description: formData.description,
        size_sqft: formData.size_sqft,
        status: 'planning',
        created_by: user.id
      })
      .select()
      .single();
    
    if (error) {
      console.error('createProject: Supabase error:', error);
      throw error;
    }
    
    console.log('createProject: Real project created:', project);
    
    // Revalidate the projects page
    revalidatePath('/dashboard/homeowner');
    
    return project;
    
  } catch (error) {
    console.error('createProject: Error creating project:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    console.log('getProjects: Connecting to Supabase...');
    
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('getProjects: No authenticated user, returning empty array');
      return [];
    }
    
    // Get user's workspace
    const { data: workspaceMember } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();
    
    if (!workspaceMember) {
      console.log('getProjects: No workspace found for user');
      return [];
    }
    
    // Get projects from the user's workspace
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceMember.workspace_id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('getProjects: Supabase error:', error);
      return [];
    }
    
    console.log('getProjects: Real projects returned:', projects);
    return projects || [];
    
  } catch (error) {
    console.error('getProjects: Error connecting to Supabase:', error);
    // Fallback to empty array if Supabase fails
    return [];
  }
}

export async function getProject(projectId: string) {
  try {
    console.log('getProject: Using mock data for now (API not ready)');
    
    // Return mock project data instead of database connection
    const mockProject = {
      id: projectId,
      name: 'Mock Project',
      location: 'San Francisco, CA',
      description: 'This is a mock project for testing purposes',
      size_sqft: 300,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      workspaces: [
        {
          id: 'mock-workspace-123',
          name: 'Mock Workspace'
        }
      ]
    };
    
    console.log('getProject: Mock project returned:', mockProject);
    
    // Simulate a small delay to mimic real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockProject;
    
  } catch (error) {
    console.error('getProject: Error in mock getProject:', error);
    throw error;
  }
}
