'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { getProjects } from '../actions';

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
  ai_generated?: boolean;
}

export default function HomeownerDashboard() {
  // Always show projects landing page first
  return <ProjectsLandingPage />;
}

function ProjectsLandingPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      
      // Add template project if no projects exist
      if (projectsData.length === 0) {
        const templateProject = {
          id: 'template-project',
          name: 'Kitchen Renovation Template',
          type: 'kitchen-renovation',
          location: 'Template Location',
          description: 'A comprehensive kitchen renovation project template showing all phases, tasks, and cost estimates.',
          size_sqft: 200,
          status: 'planning',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 15,
          ai_generated: true
        };
        projectsData.push(templateProject);
      }
      
      // Add progress field to match Sidebar Project type
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: project.progress || Math.floor(Math.random() * 100)
      }));
      
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectClick = (projectId: string) => {
    // Navigate to project detail page
    window.location.href = `/dashboard/homeowner/project/${projectId}`;
  };

  const handleCreateProject = () => {
    // Navigate to chat interface for project creation
    window.location.href = '/dashboard/homeowner/guided-project-enhanced';
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          projects={projects}
          activeProject=""
          onProjectSelect={() => {}}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading projects...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        projects={projects}
        activeProject=""
        onProjectSelect={handleProjectClick}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full p-4 sm:p-6 overflow-y-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">My Projects</h1>
                <p className="text-gray-500">Manage all your construction projects</p>
              </div>
              <button
                onClick={handleCreateProject}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Project</span>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project.id)}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                      {project.type || 'Renovation'}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-700' :
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    project.status === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium text-gray-900">{project.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size</span>
                    <span className="font-medium text-gray-900">{project.size_sqft || 0} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="font-medium text-gray-900">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {project.ai_generated && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-xs text-blue-600 font-medium">✨ AI Generated Template</span>
                  </div>
                )}
              </div>
            ))}

            {/* Create New Project Card */}
            <div
              onClick={handleCreateProject}
              className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] group"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start New Project</h3>
              <p className="text-sm text-gray-500 text-center">Create a new construction project with AI assistance</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}