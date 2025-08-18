'use server';

// Mock data functions - API not ready yet
// import { createUserClient } from '@/lib/supabase-server';
// import { revalidatePath } from 'next/cache';

export interface CreateProjectData {
  name: string;
  location: string;
  size_sqft?: number;
  description?: string;
  type?: string;
}

export async function createProject(formData: CreateProjectData) {
  try {
    console.log('createProject: Using mock data for now (API not ready)');
    
    // Return mock project data instead of database connection
    const mockProject = {
      id: `mock-${Date.now()}`,
      workspace_id: 'mock-workspace-123',
      name: formData.name,
      type: formData.type,
      location: formData.location,
      description: formData.description,
      size_sqft: formData.size_sqft,
      start_date: null,
      end_date: null,
      budget: null,
      status: 'draft',
      created_by: 'mock-user-123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('createProject: Mock project created:', mockProject);
    
    // Simulate a small delay to mimic real API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockProject;
    
  } catch (error) {
    console.error('createProject: Error in mock createProject:', error);
    throw error;
  }
}

export async function getProjects() {
  try {
    console.log('getProjects: Using mock data for now (API not ready)');
    
    // Return mock projects instead of database connection
    const mockProjects = [
      {
        id: 'mock-project-1',
        name: 'Kitchen Remodel',
        location: 'San Francisco, CA',
        description: 'Complete kitchen renovation with modern appliances',
        size_sqft: 250,
        type: 'kitchen remodel',
        status: 'draft',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updated_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'mock-project-2',
        name: 'Bathroom Addition',
        location: 'Los Angeles, CA',
        description: 'New bathroom addition to master bedroom',
        size_sqft: 120,
        type: 'bathroom addition',
        status: 'in-progress',
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updated_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];
    
    console.log('getProjects: Mock projects returned:', mockProjects);
    
    // Simulate a small delay to mimic real API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return mockProjects;
    
  } catch (error) {
    console.error('getProjects: Error in mock getProjects:', error);
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
