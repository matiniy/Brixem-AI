'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import LinearTaskFlow from '@/components/LinearTaskFlow';
import { getProjects } from '../../../actions';

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

interface TaskStep {
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

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectSteps, setProjectSteps] = useState<TaskStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load projects and find the current one
  useEffect(() => {
    loadProjects();
  }, [projectId]);

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
          ai_data: {
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
        projectsData.push(templateProject);
      }
      
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: project.progress || Math.floor(Math.random() * 100)
      }));
      
      setProjects(projectsWithProgress);
      
      // Find the current project
      const currentProject = projectsWithProgress.find(p => p.id === projectId);
      if (currentProject) {
        setProject(currentProject);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert AI data to project steps
  useEffect(() => {
    if (project?.ai_data?.phases) {
      const aiProjectSteps = project.ai_data.phases.map((phase, index) => ({
        id: phase.id,
        title: phase.name,
        description: `Phase ${index + 1}: ${phase.name}`,
        status: phase.status as 'completed' | 'in-progress' | 'pending',
        stepNumber: index + 1,
        estimatedDuration: '30 days',
        subTasks: phase.tasks.map(task => ({
          id: task.id,
          title: task.name,
          description: `Task: ${task.name}`,
          status: task.status as 'completed' | 'in-progress' | 'pending',
          estimatedDuration: '2-3 days',
          assignedTo: task.assignee,
          subtasks: task.subtasks.map(subtask => ({
            id: subtask.id,
            title: subtask.name,
            description: `Subtask: ${subtask.name}`,
            status: subtask.status as 'completed' | 'in-progress' | 'pending',
            estimatedDuration: '1 day'
          }))
        }))
      }));
      setProjectSteps(aiProjectSteps);
      } else {
      setProjectSteps([]);
    }
  }, [project]);

  const handleProjectSelect = (projectId: string) => {
    window.location.href = `/dashboard/homeowner/project/${projectId}`;
  };

  const handleBackToProjects = () => {
    window.location.href = '/dashboard/homeowner';
  };

  const handleStepComplete = (stepId: string) => {
    console.log('Step completed:', stepId);
  };

  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    console.log('SubTask updated:', stepId, subTaskId, status);
  };

  const handleSubTaskNotesUpdate = (stepId: string, subTaskId: string, notes: string) => {
    console.log('SubTask notes updated:', stepId, subTaskId, notes);
  };

  const handleDeliverableUpdate = (stepId: string, subTaskId: string, deliverableId: string, status: 'completed' | 'pending') => {
    console.log('Deliverable updated:', stepId, subTaskId, deliverableId, status);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          projects={projects}
          activeProject={projectId}
          onProjectSelect={handleProjectSelect}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading project...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          projects={projects}
          activeProject=""
          onProjectSelect={handleProjectSelect}
          isMobileOpen={isMobileSidebarOpen}
          onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full flex items-center justify-center">
        <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist.</p>
          <button
                onClick={handleBackToProjects}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
                Back to Projects
          </button>
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
        activeProject={projectId}
        onProjectSelect={handleProjectSelect}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full p-4 sm:p-6 overflow-y-auto">
            {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                  <button
                  onClick={handleBackToProjects}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
                  <p className="text-gray-500">{project.location} • {project.size_sqft || 0} sq ft</p>
                </div>
                  </div>
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
              </div>

          {/* Project Overview Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Project Overview
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Project Stats Cards */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600">Total Tasks</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {projectSteps.reduce((total, step) => total + (step.subTasks?.length || 0), 0)}
                    </p>
            </div>
          </div>
      </div>

              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="p-1.5 bg-yellow-100 rounded-lg">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600">To Do</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {projectSteps.reduce((total, step) => 
                        total + (step.subTasks?.filter(task => task.status === 'pending').length || 0), 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                <div className="flex items-center">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs font-medium text-gray-600">Completed Tasks</p>
                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                      {projectSteps.reduce((total, step) => 
                        total + (step.subTasks?.filter(task => task.status === 'completed').length || 0), 0
                      )}
                    </p>
                              </div>
                          </div>
                        </div>
                        
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
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
              }}
              onSubTaskUpdate={handleSubTaskUpdate}
              onSubTaskNotesUpdate={handleSubTaskNotesUpdate}
              onDeliverableUpdate={handleDeliverableUpdate}
              onStepComplete={handleStepComplete}
            />
          </div>

          {/* Project Description */}
          {project.description && (
            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Description</h3>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-gray-700">{project.description}</p>
              </div>
            </div>
          )}

          {/* AI Generated Badge */}
          {project.ai_generated && (
            <div className="mb-6 sm:mb-8">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-blue-800 font-medium">AI Generated Template</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">This is a template project showing how to structure and manage construction projects.</p>
              </div>
            </div>
          )}

          {/* Suggested Contractors Section */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggested Contractors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Contractor Card 1 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                {/* Contractor Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1581578731548-c6a0c3f2f4c4?w=400&h=200&fit=crop&crop=center"
                    alt="Premier Construction"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>

                {/* Contractor Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Premier Construction</h4>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">4.8</span>
                        <span className="text-gray-500 text-sm ml-1">(127 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">Specializing in kitchen renovations and extensions with 15+ years experience</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">£25k - £75k</span>
                    <span className="text-xs text-gray-500">London & Surrounding</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Contact Now
                  </button>
                </div>
              </div>

              {/* Contractor Card 2 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                {/* Contractor Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=200&fit=crop&crop=center"
                    alt="Elite Home Improvements"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>

                {/* Contractor Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Elite Home Improvements</h4>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">4.9</span>
                        <span className="text-gray-500 text-sm ml-1">(89 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">Award-winning contractor for whole house renovations and luxury projects</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">£40k - £120k</span>
                    <span className="text-xs text-gray-500">Greater London</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Contact Now
                  </button>
                </div>
              </div>

              {/* Contractor Card 3 */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group">
                {/* Contractor Image */}
                <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=200&fit=crop&crop=center"
                    alt="Swift Build Solutions"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>

                {/* Contractor Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-gray-900 text-lg mb-1">Swift Build Solutions</h4>
                      <div className="flex items-center mb-2">
                        <svg className="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-900">4.7</span>
                        <span className="text-gray-500 text-sm ml-1">(203 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">Fast, reliable, and affordable construction services with guaranteed completion times</p>
                  
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-green-600 font-bold text-lg">£20k - £60k</span>
                    <span className="text-xs text-gray-500">London & Home Counties</span>
                  </div>
                  
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    Contact Now
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                onClick={() => window.location.href = '/dashboard/homeowner/contractor-selection'}
                className="px-8 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-xl hover:opacity-90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                View All Contractors
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 
