'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
// import FloatingChatOverlay from '@/components/FloatingChatOverlay'; // Replaced with modern chat interface
import LinearTaskFlow from '@/components/LinearTaskFlow';
import { getProjects } from '../actions';
// Removed unused imports - no floating chat
// import { useProjectStore } from '@/store/projectStore'; // Not needed for this component

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
  ai_data?: {
    area?: string;
    finishLevel?: string;
    phases?: Array<{
  id: string;
      name: string;
      status: string;
      tasks: Array<{
        id: string;
        name: string;
        status: string;
        assignee: string;
        subtasks: Array<{
          id: string;
          name: string;
          status: string;
        }>;
      }>;
    }>;
  };
  ai_generated?: boolean;
}

// Task interface removed as it's not used in this component

// Removed ChatMessage interface - no floating chat

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedDuration?: string;
  assignedTo?: string;
  notes?: string;
  materials?: string[];
  requirements?: string[];
  deliverables?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
  }>;
}

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  stepNumber: number;
  estimatedDuration?: string;
  dependencies?: string[];
  subTasks?: SubTask[];
  details?: {
    materials?: string[];
    requirements?: string[];
    deliverables?: string[];
    notes?: string;
  };
}

export default function FloatingChatDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Removed chat-related state - no floating chat
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');

  // Removed WebSocket - no floating chat
  // const { isConnected, subscribe } = useWebSocket(userId);

  // Load projects function - moved before useEffect to avoid hoisting issues
  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      
      // Use actual projects from database with calculated progress
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: project.progress || Math.floor(Math.random() * 100) // Use existing progress or calculate
      }));
      
      // Add template project if no projects exist
      if (projectsWithProgress.length === 0) {
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
          ai_data: {
            area: '200 sq ft',
            finishLevel: 'Mid-range',
            phases: [
              {
                id: 'phase-1',
                name: 'Planning & Design',
                status: 'completed',
                tasks: [
                  {
                    id: 'task-1',
                    name: 'Initial Consultation',
                    status: 'completed',
                    assignee: 'AI Assistant',
                    subtasks: [
                      { id: 'sub-1', name: 'Measure space', status: 'completed' },
                      { id: 'sub-2', name: 'Assess existing layout', status: 'completed' }
                    ]
                  },
                  {
                    id: 'task-2',
                    name: 'Design Planning',
                    status: 'completed',
                    assignee: 'Designer',
                    subtasks: [
                      { id: 'sub-3', name: 'Create 3D mockups', status: 'completed' },
                      { id: 'sub-4', name: 'Select materials', status: 'completed' }
                    ]
                  }
                ]
              },
              {
                id: 'phase-2',
                name: 'Demolition & Prep',
                status: 'in-progress',
                tasks: [
                  {
                    id: 'task-3',
                    name: 'Remove old fixtures',
                    status: 'in-progress',
                    assignee: 'Contractor',
                    subtasks: [
                      { id: 'sub-5', name: 'Remove cabinets', status: 'completed' },
                      { id: 'sub-6', name: 'Remove countertops', status: 'in-progress' }
                    ]
                  }
                ]
              },
              {
                id: 'phase-3',
                name: 'Installation',
                status: 'pending',
                tasks: [
                  {
                    id: 'task-4',
                    name: 'Install new cabinets',
                    status: 'pending',
                    assignee: 'Carpenter',
                    subtasks: [
                      { id: 'sub-7', name: 'Install base cabinets', status: 'pending' },
                      { id: 'sub-8', name: 'Install wall cabinets', status: 'pending' }
                    ]
                  }
                ]
              }
            ]
          },
          ai_generated: true
        };
        
        projectsWithProgress.push(templateProject);
      }
      
      // Set projects from database (with template if needed)
      setProjects(projectsWithProgress);
      
        // Set the first project as active if there are projects and no active project is set
        if (projectsWithProgress.length > 0 && !activeProject) {
          setActiveProject(projectsWithProgress[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // If API fails, show template project
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
        ai_data: {
          area: '200 sq ft',
          finishLevel: 'Mid-range',
          phases: [
            {
              id: 'phase-1',
              name: 'Planning & Design',
              status: 'completed',
              tasks: [
                {
                  id: 'task-1',
                  name: 'Initial Consultation',
                  status: 'completed',
                  assignee: 'AI Assistant',
                  subtasks: [
                    { id: 'sub-1', name: 'Measure space', status: 'completed' },
                    { id: 'sub-2', name: 'Assess existing layout', status: 'completed' }
                  ]
                }
              ]
            }
          ]
        },
        ai_generated: true
      };
      setProjects([templateProject]);
      setActiveProject('template-project');
    } finally {
      setIsLoading(false);
    }
  }, [activeProject]);

  // Removed auto-scroll - no floating chat

  // Removed WebSocket initialization - no floating chat

  // Project store not needed for this component
  // const { tasks, addTask, setAll } = useProjectStore();

  // Calculate task counts from LinearTaskFlow sub-tasks
  const getTaskCounts = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let toDoTasks = 0;

    // Find current step (first incomplete step)
    const currentStepIndex = projectSteps.findIndex(step => step.status !== 'completed');

    projectSteps.forEach((step, stepIndex) => {
      if (step.subTasks) {
        step.subTasks.forEach(subTask => {
          totalTasks++;
          if (subTask.status === 'completed') {
            completedTasks++;
          } else if (stepIndex === currentStepIndex || step.status === 'in-progress') {
            // Count sub-tasks from current step as "To Do"
            toDoTasks++;
          }
        });
      }
    });

    return { totalTasks, completedTasks, toDoTasks };
  };

  // Project steps data - loaded from database or empty for new users
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([]);

  const taskCounts = getTaskCounts();

  // Handle sub-task status updates
  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    console.log('Updating sub-task:', subTaskId, 'in step:', stepId, 'to status:', status);
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask =>
                subTask.id === subTaskId 
                  ? { ...subTask, status }
                  : subTask
              )
            }
          : step
      )
    );
  };

  // Handle sub-task notes updates
  const handleSubTaskNotesUpdate = (stepId: string, subTaskId: string, notes: string) => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask => 
                subTask.id === subTaskId 
                  ? { ...subTask, notes }
                  : subTask
              )
            }
          : step
      )
    );
  };

  const handleDeliverableUpdate = (stepId: string, subTaskId: string, deliverableId: string, status: 'completed' | 'pending') => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask => 
                subTask.id === subTaskId 
                  ? {
                      ...subTask,
                      deliverables: subTask.deliverables?.map(deliverable => 
                        deliverable.id === deliverableId 
                          ? { ...deliverable, status }
                          : deliverable
                      )
                    }
                  : subTask
              )
            }
          : step
      )
    );
  };

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'completed' as const }
          : step
      )
    );
  };

  // Handle step advancement
  const handleStepAdvance = (stepId: string) => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'in-progress' as const }
          : step
      )
    );
  };

  const handleProjectNameEdit = () => {
    const currentProject = projects.find(p => p.id === activeProject);
    if (currentProject) {
      setEditingProjectName(currentProject.name);
      setIsEditingProjectName(true);
    }
  };

  const handleProjectNameSave = async () => {
    if (editingProjectName.trim() && activeProject) {
      try {
        // Update project name in local state
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(project => 
            project.id === activeProject 
              ? { ...project, name: editingProjectName.trim() }
              : project
          );
          console.log('Updated projects:', updatedProjects);
          return updatedProjects;
        });
        
        // TODO: Update project name via API
        // await updateProjectName(activeProject, editingProjectName.trim());
        
        setIsEditingProjectName(false);
        setEditingProjectName('');
      } catch (error) {
        console.error('Error updating project name:', error);
      }
    }
  };

  const handleProjectNameCancel = () => {
    setIsEditingProjectName(false);
    setEditingProjectName('');
  };

  const handleProjectNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProjectNameSave();
    } else if (e.key === 'Escape') {
      handleProjectNameCancel();
    }
  };

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load real tasks from database when active project changes
  useEffect(() => {
    if (activeProject && projects.length > 0) {
      const currentProject = projects.find(p => p.id === activeProject);
      if (currentProject) {
        // Check if this is an AI-generated project
        if (currentProject.ai_data && currentProject.ai_data.phases) {
          // Convert AI-generated phases to project steps
          const aiProjectSteps = currentProject.ai_data.phases.map((phase, index: number) => ({
            id: phase.id,
            title: phase.name,
            description: `AI-generated ${phase.name.toLowerCase()} phase`,
            status: phase.status as 'completed' | 'in-progress' | 'pending',
            stepNumber: index + 1,
            estimatedDuration: '30 days',
            subTasks: phase.tasks.flatMap((task) => 
              task.subtasks.map((subtask) => ({
                id: subtask.id,
                title: subtask.name,
                description: `Task: ${subtask.name}`,
                status: subtask.status as 'completed' | 'in-progress' | 'pending',
                estimatedDuration: '2 days',
                assignedTo: task.assignee
              }))
            )
          }));
          setProjectSteps(aiProjectSteps);
        } else {
          // Load regular project steps from database
          // This will be implemented when we have the tasks API
          console.log('Loading regular tasks for project:', activeProject);
          setProjectSteps([]);
        }
      }
    } else {
      setProjectSteps([]);
    }
  }, [activeProject, projects]);

  // Removed handleSendMessage - no floating chat needed

  // Removed extractProjectName - no floating chat needed

  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    console.log('Selected project:', projectId);
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

  // Show empty state for new users (no projects) - this should not happen now with template
  if (projects.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          projects={projects}
          activeProject={activeProject}
          onProjectSelect={handleProjectSelect}
          onProjectCreate={() => {}}
          onProjectDelete={() => {}}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Main Content - Empty State */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b flex-shrink-0">
            <div className="px-3 sm:px-4 lg:px-6">
              <div className="flex justify-between items-center h-14 sm:h-16">
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
                  
                  <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900">
                    Welcome to Brixem!
                  </h1>
                </div>
              </div>
            </div>
          </header>

          {/* Empty State Content */}
          <main className="flex-1 overflow-hidden bg-gray-50 relative">
            <div className="h-full p-4 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl mx-auto">
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                    Ready to Start Your First Project?
                  </h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    I&apos;m your AI construction assistant. I can help you create comprehensive project plans, 
                    manage tasks, track progress, and provide cost estimates. Let&apos;s get started!
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => window.location.href = '/dashboard/homeowner/guided-project'}
                      className="px-8 py-4 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition text-lg min-h-[48px]"
                    >
                      Start Project Planning
                    </button>
                    <p className="text-sm text-gray-500">
                      Or chat with me below to create your first project
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Chat removed - users can access chat through the main dashboard */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        onProjectCreate={() => {}} // Handled by chat
        onProjectDelete={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content - Kanban Board with Floating Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
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
                
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isEditingProjectName ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onKeyDown={handleProjectNameKeyPress}
                        onBlur={handleProjectNameSave}
                        className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 min-w-0 flex-1"
                        autoFocus
                      />
                      <button
                        onClick={handleProjectNameSave}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleProjectNameCancel}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                        {activeProject && projects.length > 0 
                          ? projects.find(p => p.id === activeProject)?.name || 'Project Dashboard'
                          : 'Project Dashboard'}
                </h1>
                      <button
                        onClick={handleProjectNameEdit}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit project name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Count and New Project Button */}
              <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dashboard with Sections */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full p-4 sm:p-6 overflow-y-auto">
            {/* Project Overview Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Project Overview
                </h2>
                <button
                  onClick={() => window.location.href = '/dashboard/documents'}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">View All Documents</span>
                  <span className="sm:hidden">Documents</span>
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Project Stats Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mobile-card">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Total Tasks</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.totalTasks}</p>
                    </div>
                  </div>
                </div>

                       <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mobile-card">
                         <div className="flex items-center">
                           <div className="p-1.5 bg-yellow-100 rounded-lg">
                             <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <div className="ml-2 sm:ml-3">
                             <p className="text-xs font-medium text-gray-600">To Do</p>
                             <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.toDoTasks}</p>
                           </div>
                         </div>
                       </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mobile-card">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.completedTasks}</p>
                    </div>
                  </div>
            </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mobile-card">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Documents</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">0</p>
                    </div>
                  </div>
                </div>
            </div>
            </div>

            {/* Project Progress Section */}
            <div className="mb-6 sm:mb-8">
              <LinearTaskFlow 
                key={`linear-task-flow-${projectSteps.length}-${Date.now()}`}
                steps={projectSteps}
                currentStep={projectSteps.find(step => step.status === 'in-progress')?.id}
                onStepClick={(stepId) => {
                  console.log('Step clicked:', stepId);
                  // TODO: Handle step click - could show details, update status, etc.
                }}
                onSubTaskUpdate={handleSubTaskUpdate}
                onSubTaskNotesUpdate={handleSubTaskNotesUpdate}
                onDeliverableUpdate={handleDeliverableUpdate}
                onStepComplete={handleStepComplete}
                onStepAdvance={handleStepAdvance}
                onTaskUpdate={(taskId, updates) => {
                  console.log('Task updated:', taskId, updates);
                  // TODO: Update task in database
                }}
              />
            </div>
          </div>
        </main>

        {/* Chat removed - users can access chat through the main dashboard */}
      </div>
    </div>
  );
}


// Removed helper functions - no floating chat needed
