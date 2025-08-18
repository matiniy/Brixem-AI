'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ZeroState } from '@/components/ZeroState';
import { createProject, getProjects } from '../actions';

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
  progress: number; // Added to match Sidebar Project type
}

export default function HomeownerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showChatInterface, setShowChatInterface] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      // Add progress field to match Sidebar Project type
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: 0 // Default progress for new projects
      }));
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Show the chat interface instead of dialog
    setShowChatInterface(true);
  };

  const handleProjectCreated = async (projectData: {
    name: string;
    location: string;
    size_sqft?: number;
    description: string;
    type: string;
  }) => {
    try {
      console.log('Creating project with data:', projectData);
      
      // Create the project using the server action
      const newProject = await createProject(projectData);
      console.log('Project created successfully:', newProject);
      
      // Reload projects to show the new one
      await loadProjects();
      
      // Hide the chat interface
      setShowChatInterface(false);
      
      // Show success message
      console.log('Project created successfully! Redirecting to Kanban board...');
      
      // Automatically redirect to the new project's kanban dashboard
      if (newProject && newProject.id) {
        console.log('Redirecting to project:', newProject.id);
        // Add a small delay to show the success message
        setTimeout(() => {
          console.log('Executing redirect to:', `/dashboard/project/${newProject.id}`);
          window.location.href = `/dashboard/project/${newProject.id}`;
        }, 1500);
      } else {
        console.error('Project created but no ID returned:', newProject);
        // Fallback redirect
        setTimeout(() => {
          console.log('Fallback redirect to dashboard');
          window.location.href = '/dashboard/homeowner';
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating project:', error);
      // Show error to user
      alert('Failed to create project. Please try again.');
      // Keep chat interface open on error so user can try again
    }
  };

  const handleProjectSelect = (projectId: string) => {
    // Navigate to project page
    window.location.href = `/dashboard/project/${projectId}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProject=""
        onProjectSelect={handleProjectSelect}
        onProjectCreate={() => setShowChatInterface(true)}
        onProjectDelete={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onStartProjectChat={() => {}}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Dashboard
                </h1>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowChatInterface(true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden sm:inline">New Project</span>
                </button>
                
                {/* Test redirect button for debugging */}
                <button
                  onClick={() => {
                    console.log('Test redirect button clicked');
                    window.location.href = '/dashboard/project/test-123';
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Test Redirect
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          {showChatInterface ? (
            <div className="h-full flex flex-col">
              {/* Chat Header with Back Button */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowChatInterface(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
                </div>
              </div>
              
              {/* Chat Interface */}
              <div className="flex-1">
                <ZeroState onProjectCreated={handleProjectCreated} />
              </div>
            </div>
          ) : projects.length === 0 ? (
            <ZeroState onProjectCreated={handleProjectCreated} />
          ) : (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Projects</h2>
                <p className="text-gray-600">Manage your construction projects and generate documents</p>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleProjectSelect(project.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {project.location}
                      </div>
                      
                      {project.type && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {project.type}
                        </div>
                      )}
                      
                      {project.size_sqft && (
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {project.size_sqft} sq ft
                        </div>
                      )}
                      
                      {project.description && (
                        <p className="text-gray-600 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                        <span className="text-blue-600 hover:text-blue-700">View Project →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setShowChatInterface(true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Start New Project
                  </button>
                  
                  <button
                    onClick={() => {
                      // TODO: Implement import project
                      alert('Import project feature coming soon!');
                    }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import Project
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Project Dialog */}
      {/* Removed CreateProjectDialog as it's now handled by the chat interface */}
    </div>
  );
} 