import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Add a Project type for the sidebar
export type Project = {
  id: string;
  name: string;
  progress: number;
  type?: string;
  status?: string;
  budget?: string;
  description?: string;
  location?: string;
  timeline?: string;
  createdAt?: string;
  contractors?: unknown[]; // Changed from any[] to unknown[]
};

interface SidebarProps {
  projects: Project[];
  activeProject: string;
  onProjectSelect?: (projectId: string) => void;
  onProjectCreate?: (project: Omit<Project, "id">) => void;
  onProjectDelete?: (projectId: string) => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export default function Sidebar({ 
  projects, 
  activeProject, 
  onProjectSelect, 
  onProjectCreate,
  onProjectDelete,
  isMobileOpen = false,
  onMobileToggle
}: SidebarProps) {
  const router = useRouter();
  
  // State for project management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  
  // New project form state
  const [newProject, setNewProject] = useState({
    name: "",
    type: "renovation",
    description: "",
    location: "",
    budget: "$10,000 - $25,000",
    timeline: "4-8 weeks"
  });

  // Handle project click to navigate to Kanban board
  const handleProjectClick = (projectId: string) => {
    if (onProjectSelect) {
      onProjectSelect(projectId);
    } else {
      router.push(`/dashboard/homeowner/project/${projectId}`);
    }
    // Close mobile sidebar after navigation
    if (onMobileToggle) {
      onMobileToggle();
    }
  };

  // Handle project deletion
  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (projectToDelete && onProjectDelete) {
      onProjectDelete(projectToDelete.id);
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  // Handle project creation
  const handleCreateProject = () => {
    if (newProject.name.trim() && onProjectCreate) {
      const projectData = {
        name: newProject.name,
        progress: 0,
        type: newProject.type,
        status: "planning",
        budget: newProject.budget,
        description: newProject.description,
        location: newProject.location,
        timeline: newProject.timeline,
        createdAt: new Date().toISOString()
      };
      
      onProjectCreate(projectData);
      setShowCreateModal(false);
      setNewProject({
        name: "",
        type: "renovation",
        description: "",
        location: "",
        budget: "$10,000 - $25,000",
        timeline: "4-8 weeks"
      });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative lg:translate-x-0 z-50 w-full sm:w-72 lg:w-80 bg-gray-900 h-screen flex flex-col justify-between py-3 sm:py-4 lg:py-6 border-r border-gray-800 transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div>
          {/* Branding Section */}
          <div className="px-3 sm:px-4 lg:px-6 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md">
                  B
                </div>
                <span className="text-white font-bold text-lg sm:text-xl">Brixem</span>
              </div>
              {/* Mobile Close Button */}
              <button
                onClick={onMobileToggle}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition touch-manipulation"
              >
                <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Projects Section */}
          <div className="px-3 sm:px-4 lg:px-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</h2>
              <button
                onClick={() => window.location.href = '/dashboard/homeowner/guided-project'}
                className="w-6 h-6 rounded-full bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center text-white hover:opacity-80 transition-all duration-200 shadow-lg hover:shadow-xl touch-manipulation"
                title="Add New Project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            
            <nav className="flex flex-col gap-2 sm:gap-3">
              {projects.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-400 text-sm mb-2">No projects yet</div>
                  <div className="text-xs text-gray-500">Create your first project to get started</div>
                </div>
              ) : (
                projects.map((project) => (
                <div
                  key={project.id}
                  className="relative group"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <button
                    onClick={() => handleProjectClick(project.id)}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base cursor-pointer touch-manipulation ${
                      activeProject === project.id 
                        ? "bg-[#23c6e6] text-white shadow-lg" 
                        : "text-white hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="truncate font-semibold text-left">{project.name}</span>
                      <span className="text-xs sm:text-sm font-semibold ml-2">
                        {project.progress}%
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full h-1 sm:h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                          activeProject === project.id
                            ? "bg-white"
                            : project.id === "1" 
                              ? "bg-[#23c6e6]" 
                              : project.id === "2"
                                ? "bg-purple-500"
                                : project.id === "3"
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                        }`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    
                    {/* Delete Button */}
                    {hoveredProject === project.id && (
                      <button
                        onClick={(e) => handleDeleteClick(e, project)}
                        className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white text-xs transition opacity-0 group-hover:opacity-100 touch-manipulation"
                        title="Delete Project"
                      >
                        <svg className="w-2 h-2 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </button>
                </div>
                ))
              )}
            </nav>
          </div>
        </div>
        
        {/* Navigation Links */}
        <div className="px-3 sm:px-4 lg:px-6">
          <nav className="flex flex-col gap-1 sm:gap-2 mb-4 sm:mb-6">
            {/* Back to Main Website */}
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors touch-manipulation"
              onClick={onMobileToggle}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Back to Main Website</span>
            </Link>
            
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors touch-manipulation"
              onClick={onMobileToggle}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Profile</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors touch-manipulation"
              onClick={onMobileToggle}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Settings</span>
            </Link>
            <Link
              href="/dashboard/payment"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors touch-manipulation"
              onClick={onMobileToggle}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Payment</span>
            </Link>
          </nav>
          
          {/* User Section */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
              <span className="text-white font-medium text-xs sm:text-sm">N</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xs sm:text-sm">Homeowner</span>
              <span className="text-gray-400 text-xs">Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter project name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="renovation">Renovation</option>
                  <option value="new-build">New Build</option>
                  <option value="fit-out">Fit-out</option>
                  <option value="extension">Extension</option>
                  <option value="landscaping">Landscaping</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  rows={3}
                  placeholder="Brief description of your project"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={newProject.location}
                  onChange={(e) => setNewProject(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Project location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                <select
                  value={newProject.budget}
                  onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="$100,000 - $250,000">$100,000 - $250,000</option>
                  <option value="$250,000+">$250,000+</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline</label>
                <select
                  value={newProject.timeline}
                  onChange={(e) => setNewProject(prev => ({ ...prev, timeline: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="4-8 weeks">4-8 weeks</option>
                  <option value="8-12 weeks">8-12 weeks</option>
                  <option value="12-16 weeks">12-16 weeks</option>
                  <option value="16-24 weeks">16-24 weeks</option>
                  <option value="24+ weeks">24+ weeks</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateProject}
                disabled={!newProject.name.trim()}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-md hover:opacity-90 transition disabled:opacity-50 touch-manipulation"
              >
                Create Project
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Delete Project</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 touch-manipulation"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{projectToDelete.name}&quot;? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition touch-manipulation"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition touch-manipulation"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 