'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import FloatingChatOverlay from '@/components/FloatingChatOverlay';
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


interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  progress: number;
  assignedUsers: string[];
  comments: number;
  likes: number;
  dueDate?: string;
  estimatedHours?: number;
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  progress: number;
  assignedUsers: string[];
  dueDate?: string;
  estimatedHours?: number;
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "in-progress" | "completed";
  progress: number;
  duration: string;
  tasks: Task[];
  color: string;
  icon: string;
}


export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Multi-level project structure state
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Floating chat state
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; type?: 'normal' | 'task-confirm' | 'system' }>>([
    {
      role: "ai",
      text: "Welcome back! I'm here to help you manage your project. What would you like to work on today?",
      type: "normal"
    }
  ]);

  // Comprehensive Project Phases with Tasks and Subtasks
  const [projectPhases] = useState<ProjectPhase[]>([
    {
      id: 'pre-plan',
      name: 'Pre-Plan',
      description: 'Initial planning, design, and preparation phase',
      status: 'completed',
      progress: 100,
      duration: '2-4 weeks',
      color: 'green',
      icon: '📋',
    tasks: [
      {
          id: 'pre-plan-1',
          title: 'Project Planning & Design',
          description: 'Finalize project scope and design requirements',
          status: 'completed',
          priority: 'high',
        progress: 100,
          assignedUsers: ['Project Manager', 'Designer'],
        comments: 3,
          likes: 5,
          dueDate: '2024-01-15',
          estimatedHours: 40,
          subtasks: [
            {
              id: 'pre-plan-1-1',
              title: 'Initial consultation and site survey',
              description: 'Meet with client and assess current space',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-10',
              estimatedHours: 8
            },
            {
              id: 'pre-plan-1-2',
              title: 'Design concept development',
              description: 'Create initial design concepts and layouts',
              status: 'completed',
              priority: 'high',
        progress: 100,
              assignedUsers: ['Designer'],
              dueDate: '2024-01-12',
        estimatedHours: 16
      },
      {
              id: 'pre-plan-1-3',
              title: 'Client approval and revisions',
              description: 'Present designs and incorporate feedback',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Designer', 'Project Manager'],
              dueDate: '2024-01-15',
              estimatedHours: 16
            }
          ]
        },
        {
          id: 'pre-plan-2',
          title: 'Permit Applications',
          description: 'Submit necessary permits and approvals',
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignedUsers: ['Project Manager'],
        comments: 1,
          likes: 2,
          dueDate: '2024-01-20',
          estimatedHours: 12,
          subtasks: [
            {
              id: 'pre-plan-2-1',
              title: 'Building permit application',
              description: 'Submit building permit to local authority',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-18',
              estimatedHours: 4
            },
            {
              id: 'pre-plan-2-2',
              title: 'Electrical permit application',
              description: 'Submit electrical work permit',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-19',
              estimatedHours: 4
            },
            {
              id: 'pre-plan-2-3',
              title: 'Plumbing permit application',
              description: 'Submit plumbing work permit',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-20',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'pre-plan-3',
          title: 'Contractor Selection',
          description: 'Interview and select contractors',
          status: 'completed',
          priority: 'medium',
          progress: 100,
          assignedUsers: ['Project Manager'],
        comments: 0,
          likes: 1,
          dueDate: '2024-01-25',
          estimatedHours: 16,
          subtasks: [
            {
              id: 'pre-plan-3-1',
              title: 'Contractor research and vetting',
              description: 'Research and shortlist potential contractors',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-22',
              estimatedHours: 8
            },
            {
              id: 'pre-plan-3-2',
              title: 'Contractor interviews and quotes',
              description: 'Interview contractors and collect quotes',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-24',
              estimatedHours: 6
            },
            {
              id: 'pre-plan-3-3',
              title: 'Contractor selection and contracts',
              description: 'Select final contractors and sign contracts',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-25',
              estimatedHours: 2
            }
          ]
        }
      ]
    },
    {
      id: 'pre-construction',
      name: 'Pre-Construction',
      description: 'Site preparation, permits, and material procurement',
      status: 'in-progress',
      progress: 30,
      duration: '1-2 weeks',
      color: 'blue',
      icon: '🚧',
    tasks: [
      {
          id: 'pre-construction-1',
          title: 'Site Preparation',
          description: 'Prepare the construction site for work',
          status: 'in-progress',
          priority: 'high',
          progress: 50,
          assignedUsers: ['Site Supervisor'],
        comments: 2,
          likes: 3,
          dueDate: '2024-02-05',
          estimatedHours: 24,
          subtasks: [
            {
              id: 'pre-construction-1-1',
              title: 'Site survey and measurements',
              description: 'Final site measurements and marking',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Site Supervisor'],
              dueDate: '2024-01-30',
              estimatedHours: 4
            },
            {
              id: 'pre-construction-1-2',
              title: 'Utility location and marking',
              description: 'Locate and mark all utilities',
              status: 'in-progress',
              priority: 'high',
              progress: 50,
              assignedUsers: ['Utility Specialist'],
              dueDate: '2024-02-05',
              estimatedHours: 4
            },
            {
              id: 'pre-construction-1-3',
              title: 'Site security and fencing',
              description: 'Install security measures and site fencing',
              status: 'todo',
              priority: 'medium',
        progress: 0,
              assignedUsers: ['Site Supervisor'],
              dueDate: '2024-02-05',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'pre-construction-2',
          title: 'Demolition & Prep',
          description: 'Remove existing structures and prepare for construction',
          status: 'todo',
          priority: 'high',
        progress: 0,
          assignedUsers: ['Demolition Team'],
        comments: 0,
        likes: 0,
          dueDate: '2024-02-10',
          estimatedHours: 32,
          subtasks: [
            {
              id: 'pre-construction-2-1',
              title: 'Remove existing fixtures',
              description: 'Remove old cabinets, appliances, and fixtures',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Demolition Team'],
              dueDate: '2024-02-08',
              estimatedHours: 16
            },
            {
              id: 'pre-construction-2-2',
              title: 'Wall and floor preparation',
              description: 'Prepare walls and floors for new construction',
              status: 'todo',
              priority: 'high',
        progress: 0,
              assignedUsers: ['Demolition Team'],
              dueDate: '2024-02-10',
              estimatedHours: 16
            }
          ]
        },
        {
          id: 'pre-construction-3',
          title: 'Material Procurement',
          description: 'Order and schedule delivery of construction materials',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: ['Procurement Manager'],
        comments: 0,
        likes: 0,
          dueDate: '2024-02-15',
          estimatedHours: 12,
          subtasks: [
            {
              id: 'pre-construction-3-1',
              title: 'Material specifications and quantities',
              description: 'Finalize material specifications and calculate quantities',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Procurement Manager'],
              dueDate: '2024-02-12',
              estimatedHours: 6
            },
            {
              id: 'pre-construction-3-2',
              title: 'Supplier selection and ordering',
              description: 'Select suppliers and place material orders',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Procurement Manager'],
              dueDate: '2024-02-15',
              estimatedHours: 6
            }
          ]
        }
      ]
    },
    {
      id: 'build',
      name: 'Build',
      description: 'Main construction work and installation',
      status: 'upcoming',
      progress: 0,
      duration: '6-8 weeks',
      color: 'orange',
      icon: '🔨',
    tasks: [
      {
          id: 'build-1',
          title: 'Structural Work',
          description: 'Foundation, framing, and structural modifications',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['General Contractor'],
          comments: 0,
          likes: 0,
          dueDate: '2024-03-15',
          estimatedHours: 80,
          subtasks: [
            {
              id: 'build-1-1',
              title: 'Foundation work',
              description: 'Any necessary foundation modifications',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Foundation Specialist'],
              dueDate: '2024-02-20',
              estimatedHours: 24
            },
            {
              id: 'build-1-2',
              title: 'Framing and structural modifications',
              description: 'Install new framing and structural elements',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Carpenter'],
              dueDate: '2024-03-01',
              estimatedHours: 40
            },
            {
              id: 'build-1-3',
              title: 'Structural inspection',
              description: 'Inspect structural work and obtain approvals',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Inspector'],
              dueDate: '2024-03-05',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'build-2',
          title: 'Rough-in Work',
          description: 'Electrical, plumbing, and HVAC rough-in',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['Electrician', 'Plumber', 'HVAC Tech'],
          comments: 0,
          likes: 0,
          dueDate: '2024-03-20',
          estimatedHours: 60,
          subtasks: [
            {
              id: 'build-2-1',
              title: 'Electrical rough-in',
              description: 'Install electrical wiring and outlets',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Electrician'],
              dueDate: '2024-03-10',
              estimatedHours: 20
            },
            {
              id: 'build-2-2',
              title: 'Plumbing rough-in',
              description: 'Install plumbing lines and fixtures',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Plumber'],
              dueDate: '2024-03-15',
              estimatedHours: 20
            },
            {
              id: 'build-2-3',
              title: 'HVAC rough-in',
              description: 'Install HVAC ductwork and equipment',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['HVAC Tech'],
              dueDate: '2024-03-20',
              estimatedHours: 20
            }
          ]
        },
        {
          id: 'build-3',
          title: 'Finishing Work',
          description: 'Drywall, flooring, painting, and final installations',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: ['Drywaller', 'Painter', 'Flooring Installer'],
          comments: 0,
          likes: 0,
          dueDate: '2024-04-10',
          estimatedHours: 100,
          subtasks: [
            {
              id: 'build-3-1',
              title: 'Drywall installation and finishing',
              description: 'Install and finish drywall',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Drywaller'],
              dueDate: '2024-03-25',
              estimatedHours: 32
            },
            {
              id: 'build-3-2',
              title: 'Flooring installation',
              description: 'Install new flooring materials',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Flooring Installer'],
              dueDate: '2024-04-01',
              estimatedHours: 40
            },
            {
              id: 'build-3-3',
              title: 'Painting and touch-ups',
              description: 'Paint walls and perform final touch-ups',
              status: 'todo',
              priority: 'low',
              progress: 0,
              assignedUsers: ['Painter'],
              dueDate: '2024-04-10',
              estimatedHours: 28
            }
          ]
        }
      ]
    },
    {
      id: 'handover',
      name: 'Handover',
      description: 'Final inspections, cleanup, and project delivery',
      status: 'upcoming',
      progress: 0,
      duration: '1 week',
      color: 'purple',
      icon: '🎉',
    tasks: [
      {
          id: 'handover-1',
          title: 'Final Inspections',
          description: 'Complete all required inspections and approvals',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['Inspector', 'Project Manager'],
          comments: 0,
          likes: 0,
          dueDate: '2024-04-15',
          estimatedHours: 16,
          subtasks: [
            {
              id: 'handover-1-1',
              title: 'Building inspection',
              description: 'Final building code inspection',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Building Inspector'],
              dueDate: '2024-04-12',
              estimatedHours: 4
            },
            {
              id: 'handover-1-2',
              title: 'Electrical inspection',
              description: 'Final electrical work inspection',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Electrical Inspector'],
              dueDate: '2024-04-13',
        estimatedHours: 4
      },
      {
              id: 'handover-1-3',
              title: 'Plumbing inspection',
              description: 'Final plumbing work inspection',
              status: 'todo',
              priority: 'high',
        progress: 0,
              assignedUsers: ['Plumbing Inspector'],
              dueDate: '2024-04-14',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'handover-2',
          title: 'Punch List & Cleanup',
          description: 'Address any remaining issues and clean up site',
          status: 'todo',
          priority: 'medium',
        progress: 0,
          assignedUsers: ['Cleanup Crew'],
        comments: 0,
        likes: 0,
          dueDate: '2024-04-18',
          estimatedHours: 24,
          subtasks: [
            {
              id: 'handover-2-1',
              title: 'Punch list completion',
              description: 'Complete any remaining minor tasks',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['General Contractor'],
              dueDate: '2024-04-16',
              estimatedHours: 16
            },
            {
              id: 'handover-2-2',
              title: 'Site cleanup and debris removal',
              description: 'Clean up construction site and remove debris',
              status: 'todo',
              priority: 'low',
              progress: 0,
              assignedUsers: ['Cleanup Crew'],
              dueDate: '2024-04-18',
        estimatedHours: 8
            }
          ]
        },
        {
          id: 'handover-3',
          title: 'Project Delivery',
          description: 'Final walkthrough and project handover to client',
          status: 'todo',
          priority: 'high',
        progress: 0,
          assignedUsers: ['Project Manager', 'Client'],
        comments: 0,
        likes: 0,
          dueDate: '2024-04-20',
          estimatedHours: 8,
          subtasks: [
            {
              id: 'handover-3-1',
              title: 'Final walkthrough with client',
              description: 'Conduct final walkthrough with client',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Project Manager', 'Client'],
              dueDate: '2024-04-19',
              estimatedHours: 4
            },
            {
              id: 'handover-3-2',
              title: 'Documentation and warranties',
              description: 'Provide final documentation and warranties',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-04-20',
              estimatedHours: 4
            }
          ]
        }
      ]
    }
  ]);

  const loadProjects = useCallback(async () => {
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
  }, [projectId]);

  // Load projects and find the current one
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleProjectSelect = (projectId: string) => {
    window.location.href = `/dashboard/homeowner/project/${projectId}`;
  };

  const handleBackToProjects = () => {
    window.location.href = '/dashboard/homeowner';
  };


  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user" as const,
      text: message,
      type: "normal" as const
    };

    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage = {
        role: "ai" as const,
        text: `I understand you're asking about "${message}". I'm here to help you with your ${project?.name || 'project'}. You can ask me about tasks, progress, documents, or any other project-related questions.`,
        type: "normal" as const
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: "ai" as const,
        text: "I apologize, but I encountered an error. Please try again.",
        type: "normal" as const
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
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
                onClick={() => window.location.href = '/dashboard/documents?projectId=' + projectId}
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
            
          {/* Project Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
            </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                  <p className="text-2xl font-bold text-gray-900">{projectPhases.reduce((total, phase) => total + phase.tasks.length, 0)}</p>
          </div>
              </div>
      </div>

            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">To Do</p>
                  <p className="text-2xl font-bold text-gray-900">{projectPhases.reduce((total, phase) => total + phase.tasks.filter(task => task.status === 'todo').length, 0)}</p>
                </div>
                </div>
              </div>
              
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{projectPhases.reduce((total, phase) => total + phase.tasks.filter(task => task.status === 'completed').length, 0)}</p>
                              </div>
                          </div>
                        </div>
                        
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Documents</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress Overview */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Progress</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  • {projectPhases.filter(phase => phase.status === 'completed').length} phases done • {projectPhases.filter(phase => phase.status === 'in-progress').length} in progress • {projectPhases.filter(phase => phase.status === 'upcoming').length} upcoming
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round(projectPhases.reduce((total, phase) => total + phase.progress, 0) / projectPhases.length)}% Complete
                          </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round(projectPhases.reduce((total, phase) => total + phase.progress, 0) / projectPhases.length)}%` }}
                ></div>
              </div>
            </div>
                        </div>
                        
          {/* Phase Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Details</h3>
            <p className="text-sm text-gray-600 mb-6">Click on any phase card below to expand and view detailed tasks</p>
            
            <div className="space-y-4">
              {projectPhases.map((phase) => (
                <div key={phase.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          phase.status === 'completed' ? 'bg-green-100 text-green-600' :
                          phase.status === 'in-progress' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {phase.status === 'completed' ? '✓' : phase.icon}
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{phase.name}</h4>
                          <p className="text-sm text-gray-600">{phase.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{phase.duration}</p>
                          <p className="text-xs text-gray-500">{phase.progress}% complete</p>
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                          <svg 
                            className={`w-4 h-4 text-gray-400 transform transition-transform ${
                              expandedPhase === phase.id ? 'rotate-180' : ''
                            }`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          </div>
                      </div>
                    </div>
                  </div>
                  
                  {expandedPhase === phase.id && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="space-y-3">
                        {phase.tasks.map((task) => (
                          <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div 
                              className="cursor-pointer"
                              onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                    task.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {task.status === 'completed' ? '✓' : '○'}
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900">{task.title}</h5>
                                    <p className="text-sm text-gray-600">{task.description}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="text-right">
                                    <p className="text-sm text-gray-900">{task.assignedUsers.join(', ')}</p>
                                    <p className="text-xs text-gray-500">{task.estimatedHours}h • {task.dueDate}</p>
                                  </div>
                                  <div className="w-4 h-4 flex items-center justify-center">
                                    <svg 
                                      className={`w-3 h-3 text-gray-400 transform transition-transform ${
                                        expandedTask === task.id ? 'rotate-180' : ''
                                      }`} 
                                      fill="none" 
                                      stroke="currentColor" 
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {expandedTask === task.id && task.subtasks && (
                              <div className="mt-4 pl-11 space-y-3">
                                {task.subtasks.map((subtask) => (
                                  <div key={subtask.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                        subtask.status === 'completed' ? 'bg-green-100 text-green-600' :
                                        subtask.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                                        'bg-gray-100 text-gray-600'
                                      }`}>
                                        {subtask.status === 'completed' ? '✓' : '○'}
                                      </div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-900 text-sm">{subtask.title}</h6>
                                        <p className="text-xs text-gray-600">{subtask.description}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            subtask.priority === 'high' ? 'bg-red-100 text-red-800' :
                                            subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                          }`}>
                                            {subtask.priority}
                                          </span>
                                          <span className="text-xs text-gray-500">{subtask.assignedUsers.join(', ')}</span>
                                          <span className="text-xs text-gray-500">{subtask.estimatedHours}h</span>
                                          <span className="text-xs text-gray-500">{subtask.dueDate}</span>
                                        </div>
                                      </div>
                                    </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
                        ))}
            </div>
          </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Chat Overlay */}
        <FloatingChatOverlay
          onSend={handleSendMessage}
          messages={chatMessages}
          placeholder="Ask about your project tasks..."
          isExpanded={isChatExpanded}
          onToggleExpanded={setIsChatExpanded}
        />
      </main>
    </div>
  );
} 
