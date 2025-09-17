'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createProject, getProjects } from '@/app/dashboard/actions';

interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  size_sqft?: number;
  type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  progress: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProject: string;
  setActiveProject: (projectId: string) => void;
  addProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>('');

  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await getProjects();
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        if (!activeProject) {
          setActiveProject(projectsData[0].id);
        }
      } else {
        // Fallback to sample project if no projects exist
        const sampleProject: Project = {
          id: 'demo-project-1',
          name: 'Kitchen Renovation',
          location: 'San Francisco, CA',
          description: 'Complete kitchen renovation with modern appliances',
          size_sqft: 150,
          type: 'renovation',
          status: 'in-progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 35
        };
        setProjects([sampleProject]);
        setActiveProject(sampleProject.id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // Fallback to sample project on error
      const sampleProject: Project = {
        id: 'demo-project-1',
        name: 'Kitchen Renovation',
        location: 'San Francisco, CA',
        description: 'Complete kitchen renovation with modern appliances',
        size_sqft: 150,
        type: 'renovation',
        status: 'in-progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 35
      };
      setProjects([sampleProject]);
      setActiveProject(sampleProject.id);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'progress'>) => {
    try {
      const newProject = await createProject(projectData);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === projectId 
          ? { ...project, ...updates }
          : project
      )
    );
  };

  const deleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    if (activeProject === projectId) {
      const remainingProjects = projects.filter(project => project.id !== projectId);
      setActiveProject(remainingProjects[0]?.id || '');
    }
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      activeProject,
      setActiveProject,
      addProject,
      updateProject,
      deleteProject,
      refreshProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}
