'use server';

import { createUserClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
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
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's workspace
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (memberError || !member) {
      throw new Error('No workspace found. Please contact support.');
    }

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects_new')
      .insert({
        workspace_id: member.workspace_id,
        name: formData.name,
        location: formData.location,
        size_sqft: formData.size_sqft,
        description: formData.description,
        type: formData.type,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      throw new Error('Failed to create project');
    }

    // Revalidate dashboard to show new project
    revalidatePath('/dashboard');
    
    // Redirect to the new project
    redirect(`/dashboard/project/${project.id}`);
    
  } catch (error) {
    console.error('Error in createProject action:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get projects from user's workspace
    const { data: projects, error: projectsError } = await supabase
      .from('projects_new')
      .select(`
        id,
        name,
        location,
        description,
        size_sqft,
        type,
        status,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      throw new Error('Failed to fetch projects');
    }

    return projects || [];
    
  } catch (error) {
    console.error('Error in getProjects action:', error);
    throw error;
  }
}

export async function getProject(projectId: string) {
  try {
    const supabase = await createUserClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Get project with workspace validation
    const { data: project, error: projectError } = await supabase
      .from('projects_new')
      .select(`
        id,
        name,
        location,
        description,
        size_sqft,
        status,
        created_at,
        updated_at,
        workspaces!inner (
          id,
          name
        )
      `)
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      throw new Error('Project not found');
    }

    return project;
    
  } catch (error) {
    console.error('Error in getProject action:', error);
    throw error;
  }
}
