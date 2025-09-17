'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import FloatingChatOverlay from '@/components/FloatingChatOverlay';
import LinearTaskFlow from '@/components/LinearTaskFlow';
import { createProject, getProjects } from '../actions';
import { sendChatMessage } from '@/lib/ai';
import { useProjectStore } from '@/store/projectStore';

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
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedDuration?: string;
  assignedTo?: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! I'm your AI construction assistant. I can help you create new projects, manage tasks, and guide you through your construction journey. What would you like to work on today?",
      type: "normal"
    }
  ]);
  // const [isGenerating, setIsGenerating] = useState(false); // Removed unused variable
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const { tasks, addTask, setAll } = useProjectStore();

  // Calculate task counts from LinearTaskFlow sub-tasks
  const getTaskCounts = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let inProgressTasks = 0;

    projectSteps.forEach(step => {
      if (step.subTasks) {
        step.subTasks.forEach(subTask => {
          totalTasks++;
          if (subTask.status === 'completed') {
            completedTasks++;
          } else if (subTask.status === 'in-progress') {
            inProgressTasks++;
          }
        });
      }
    });

    return { totalTasks, completedTasks, inProgressTasks };
  };

  // Sample project steps data with sub-tasks and details
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([
    {
      id: '1',
      title: 'Project Planning & Design',
      description: 'Initial project planning, design development, and feasibility studies',
      status: 'completed' as const,
      stepNumber: 1,
      estimatedDuration: '2-4 weeks',
      dependencies: [],
      subTasks: [
        {
          id: '1.1',
          title: 'Site Survey & Analysis',
          description: 'Conduct topographical survey and site analysis',
          status: 'completed' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Survey Team'
        },
        {
          id: '1.2',
          title: 'Concept Design',
          description: 'Develop initial concept designs and layouts',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Architect'
        },
        {
          id: '1.3',
          title: 'Feasibility Study',
          description: 'Assess project feasibility and constraints',
          status: 'completed' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Project Manager'
        }
      ],
      details: {
        materials: ['Survey equipment', 'Design software licenses', 'Drawing materials'],
        requirements: ['Site access permission', 'Client brief', 'Planning constraints'],
        deliverables: ['Site survey report', 'Concept drawings', 'Feasibility report'],
        notes: 'All initial planning completed successfully. Client approved concept design.'
      }
    },
    {
      id: '2',
      title: 'Permits & Approvals',
      description: 'Obtain planning permission, building regulations approval, and other necessary permits',
      status: 'completed' as const,
      stepNumber: 2,
      estimatedDuration: '4-8 weeks',
      dependencies: ['Project Planning & Design'],
      subTasks: [
        {
          id: '2.1',
          title: 'Planning Application',
          description: 'Submit planning permission application',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Planning Consultant'
        },
        {
          id: '2.2',
          title: 'Building Regulations',
          description: 'Submit building regulations application',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Building Control'
        },
        {
          id: '2.3',
          title: 'Utility Connections',
          description: 'Apply for utility connections and NOCs',
          status: 'completed' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Utility Coordinator'
        }
      ],
      details: {
        materials: ['Application forms', 'Technical drawings', 'Supporting documents'],
        requirements: ['Planning permission', 'Building regulations approval', 'Utility NOCs'],
        deliverables: ['Planning permission', 'Building regulations approval', 'Utility agreements'],
        notes: 'All permits obtained within expected timeframe. No objections received.'
      }
    },
    {
      id: '3',
      title: 'Site Preparation',
      description: 'Site mobilization, hoarding, utility connections, and ground preparation',
      status: 'in-progress' as const,
      stepNumber: 3,
      estimatedDuration: '1-2 weeks',
      dependencies: ['Permits & Approvals'],
      subTasks: [
        {
          id: '3.1',
          title: 'Site Mobilization',
          description: 'Set up site office and welfare facilities',
          status: 'completed' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Site Manager'
        },
        {
          id: '3.2',
          title: 'Hoarding Installation',
          description: 'Install site hoarding and security measures',
          status: 'in-progress' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Construction Team'
        },
        {
          id: '3.3',
          title: 'Utility Connections',
          description: 'Connect temporary utilities to site',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Utility Team'
        },
        {
          id: '3.4',
          title: 'Ground Preparation',
          description: 'Clear site and prepare ground for construction',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Groundworks Team'
        }
      ],
      details: {
        materials: ['Hoarding panels', 'Temporary utilities', 'Site office equipment'],
        requirements: ['Site access', 'Utility connections', 'Safety equipment'],
        deliverables: ['Secured site', 'Temporary facilities', 'Utility connections'],
        notes: 'Site mobilization in progress. Hoarding installation started today.'
      }
    },
    {
      id: '4',
      title: 'Foundation & Substructure',
      description: 'Excavation, foundation laying, and substructure construction',
      status: 'pending' as const,
      stepNumber: 4,
      estimatedDuration: '2-3 weeks',
      dependencies: ['Site Preparation'],
      subTasks: [
        {
          id: '4.1',
          title: 'Excavation',
          description: 'Excavate foundation trenches and prepare ground',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Excavation Team'
        },
        {
          id: '4.2',
          title: 'Foundation Pour',
          description: 'Pour concrete foundations and footings',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Concrete Team'
        },
        {
          id: '4.3',
          title: 'Substructure Walls',
          description: 'Build substructure walls and retaining structures',
          status: 'pending' as const,
          estimatedDuration: '5 days',
          assignedTo: 'Masonry Team'
        }
      ],
      details: {
        materials: ['Concrete', 'Reinforcement steel', 'Formwork', 'Brick/block'],
        requirements: ['Excavation equipment', 'Concrete delivery', 'Quality control'],
        deliverables: ['Excavated foundations', 'Concrete foundations', 'Substructure walls'],
        notes: 'Ready to begin once site preparation is complete.'
      }
    },
    {
      id: '5',
      title: 'Superstructure',
      description: 'Main building construction, structural elements, and external envelope',
      status: 'pending' as const,
      stepNumber: 5,
      estimatedDuration: '4-6 weeks',
      dependencies: ['Foundation & Substructure'],
      subTasks: [
        {
          id: '5.1',
          title: 'Structural Frame',
          description: 'Erect main structural frame and steelwork',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Steel Erection Team'
        },
        {
          id: '5.2',
          title: 'External Walls',
          description: 'Build external walls and cladding',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Cladding Team'
        },
        {
          id: '5.3',
          title: 'Roof Structure',
          description: 'Install roof structure and covering',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Roofing Team'
        }
      ],
      details: {
        materials: ['Structural steel', 'Concrete', 'Cladding panels', 'Roofing materials'],
        requirements: ['Crane access', 'Weather protection', 'Quality control'],
        deliverables: ['Structural frame', 'External envelope', 'Roof structure'],
        notes: 'Major construction phase - requires careful coordination.'
      }
    },
    {
      id: '6',
      title: 'Internal Works',
      description: 'Internal partitions, finishes, MEP installation, and fit-out works',
      status: 'pending' as const,
      stepNumber: 6,
      estimatedDuration: '3-4 weeks',
      dependencies: ['Superstructure'],
      subTasks: [
        {
          id: '6.1',
          title: 'MEP Installation',
          description: 'Install mechanical, electrical, and plumbing systems',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'MEP Team'
        },
        {
          id: '6.2',
          title: 'Internal Partitions',
          description: 'Build internal walls and partitions',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Partition Team'
        },
        {
          id: '6.3',
          title: 'Finishes',
          description: 'Apply internal finishes and decorations',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Finishing Team'
        }
      ],
      details: {
        materials: ['MEP equipment', 'Partition materials', 'Finishing materials'],
        requirements: ['MEP coordination', 'Quality control', 'Clean environment'],
        deliverables: ['MEP systems', 'Internal partitions', 'Finished surfaces'],
        notes: 'Requires coordination between multiple trades.'
      }
    },
    {
      id: '7',
      title: 'External Works',
      description: 'Landscaping, external finishes, and site completion',
      status: 'pending' as const,
      stepNumber: 7,
      estimatedDuration: '1-2 weeks',
      dependencies: ['Internal Works'],
      subTasks: [
        {
          id: '7.1',
          title: 'Landscaping',
          description: 'Install landscaping and external features',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Landscaping Team'
        },
        {
          id: '7.2',
          title: 'External Finishes',
          description: 'Complete external finishes and details',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'External Team'
        },
        {
          id: '7.3',
          title: 'Site Cleanup',
          description: 'Clean up site and remove temporary facilities',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Cleanup Team'
        }
      ],
      details: {
        materials: ['Landscaping materials', 'External finishes', 'Cleaning supplies'],
        requirements: ['Weather conditions', 'Access routes', 'Final inspections'],
        deliverables: ['Completed landscaping', 'External finishes', 'Clean site'],
        notes: 'Final external works before handover.'
      }
    },
    {
      id: '8',
      title: 'Testing & Handover',
      description: 'Final testing, commissioning, snagging, and project handover',
      status: 'pending' as const,
      stepNumber: 8,
      estimatedDuration: '1-2 weeks',
      dependencies: ['External Works'],
      subTasks: [
        {
          id: '8.1',
          title: 'System Testing',
          description: 'Test all MEP systems and building services',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Testing Team'
        },
        {
          id: '8.2',
          title: 'Snagging',
          description: 'Identify and rectify any defects or issues',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Snagging Team'
        },
        {
          id: '8.3',
          title: 'Handover',
          description: 'Complete project handover and documentation',
          status: 'pending' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Project Manager'
        }
      ],
      details: {
        materials: ['Testing equipment', 'Documentation', 'Handover materials'],
        requirements: ['System commissioning', 'Quality assurance', 'Client approval'],
        deliverables: ['Tested systems', 'Snag-free building', 'Handover documentation'],
        notes: 'Final phase - ensure everything is perfect for handover.'
      }
    }
  ]);

  const taskCounts = getTaskCounts();

  // Handle sub-task status updates
  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
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

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      
      // Use actual projects from database with calculated progress
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: project.progress || Math.floor(Math.random() * 100) // Use existing progress or calculate
      }));
      setProjects(projectsWithProgress);
      
      // Set the first project as active if there are projects and no active project is set
      if (projectsWithProgress.length > 0 && !activeProject) {
        setActiveProject(projectsWithProgress[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // If API fails, show empty state
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeProject]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Initialize with sample tasks for demo
  useEffect(() => {
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Project Planning & Design',
          description: 'Finalize project scope and design requirements',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        },
        {
          id: '2',
          title: 'Permit Applications',
          description: 'Submit necessary permits and approvals',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        },
        {
          id: '3',
          title: 'Contractor Selection',
          description: 'Interview and select contractors',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        }
      ];

      // Add sample milestones
      const sampleMilestones = [
        {
          id: 'milestone-1',
          title: 'Planning Phase',
          status: 'doing' as const,
          order: 1,
          description: 'Complete project planning and design'
        },
        {
          id: 'milestone-2', 
          title: 'Permits & Approvals',
          status: 'todo' as const,
          order: 2,
          description: 'Obtain all necessary permits'
        },
        {
          id: 'milestone-3',
          title: 'Contractor Selection',
          status: 'todo' as const,
          order: 3,
          description: 'Choose and hire contractors'
        }
      ];

      // Initialize the store with sample data
      setAll(
        { 
          id: 'demo-project',
          name: 'Kitchen Remodel',
          percentComplete: 25, 
          currentMilestoneId: 'milestone-1',
          type: 'kitchen remodel',
          location: 'San Francisco, CA',
          status: 'in-progress'
        },
        sampleMilestones,
        sampleTasks
      );
    }
  }, [tasks.length, setAll]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: message,
      type: "normal"
    };

    setMessages(prev => [...prev, userMessage]);
    // setIsGenerating(true); // Removed unused variable

    try {
      const response = await sendChatMessage([userMessage], 'Homeowner Dashboard - Project Management');
      
      const aiMessage: ChatMessage = {
        role: "ai",
        text: response.message,
        type: "normal"
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle task creation if detected
      if (message.toLowerCase().includes('create task') || message.toLowerCase().includes('add task') || 
          message.toLowerCase().includes('getting building permits') || message.toLowerCase().includes('building permits')) {
        const taskTitle = extractProjectName(message);
        if (taskTitle) {
          addTask({
            title: taskTitle,
            status: 'todo',
            priority: 'high',
            progress: 0,
            assignedUsers: [],
            comments: 0,
            likes: 0
          });
          
          // Add confirmation message
          const confirmMessage: ChatMessage = {
            role: "ai",
            text: `✅ Task created successfully! "${taskTitle}" has been added to your Kanban board.`,
            type: "system"
          };
          setMessages(prev => [...prev, confirmMessage]);
        }
      }

      // Handle project creation if detected
      if (message.toLowerCase().includes('create project') || message.toLowerCase().includes('new project')) {
        const projectName = extractProjectName(message);
        if (projectName) {
          const projectData = {
            name: projectName,
            location: "To be specified",
            description: `Project created via AI: ${message}`,
            type: "renovation"
          };
          
          try {
            const newProject = await createProject(projectData);
            // Reload projects to show the new project in sidebar
            await loadProjects();
            
            // Set the new project as active
            if (newProject && newProject.id) {
              setActiveProject(newProject.id);
            }
            
            const successMessage: ChatMessage = {
              role: "ai",
              text: `Great! I've created your project "${projectName}". You can now see it in your projects list in the left sidebar. Click on it to manage tasks and track progress.`,
              type: "system"
            };
            setMessages(prev => [...prev, successMessage]);
          } catch (error) {
            console.error('Error creating project:', error);
            const errorMessage: ChatMessage = {
              role: "ai",
              text: "I encountered an error creating your project. Please try again or provide more specific details.",
              type: "system"
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: "ai",
        text: "I apologize, but I encountered an error. Please try again.",
        type: "normal"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // setIsGenerating(false); // Removed unused variable
    }
  };

  const extractProjectName = (message: string): string | null => {
    const patterns = [
      /create project (.+)/i,
      /new project (.+)/i,
      /project called (.+)/i,
      /project named (.+)/i,
      /create task (.+)/i,
      /add task (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Special handling for building permits
    if (message.toLowerCase().includes('building permits')) {
      return 'Get Building Permits';
    }
    
    return null;
  };


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
                  Project Dashboard
                </h1>
              </div>

              {/* Project Count and New Project Button */}
              <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dashboard with Sections */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full p-6 overflow-y-auto">
            {/* Project Overview Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeProject && projects.length > 0 
                    ? `${projects.find(p => p.id === activeProject)?.name || 'Project'} - Project Overview` 
                    : 'Project Overview'}
                </h2>
                <button
                  onClick={() => window.location.href = '/dashboard/documents'}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Documents
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Project Stats Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{taskCounts.totalTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{taskCounts.inProgressTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{taskCounts.completedTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Project Progress Section */}
            <div className="mb-8">
              <LinearTaskFlow 
                steps={projectSteps}
                currentStep="3"
                onStepClick={(stepId) => {
                  console.log('Step clicked:', stepId);
                  // TODO: Handle step click - could show details, update status, etc.
                }}
                onSubTaskUpdate={handleSubTaskUpdate}
              />
            </div>

          </div>

          {/* Floating Chat Overlay */}
          <FloatingChatOverlay
            onSend={handleSendMessage}
            messages={messages}
            placeholder="Ask about your project tasks..."
            isExpanded={isChatExpanded}
            onToggleExpanded={setIsChatExpanded}
          />

        </main>
      </div>
    </div>
  );
}
