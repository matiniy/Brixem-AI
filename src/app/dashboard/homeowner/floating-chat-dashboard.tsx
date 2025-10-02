'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
// import FloatingChatOverlay from '@/components/FloatingChatOverlay'; // Replaced with modern chat interface
import LinearTaskFlow from '@/components/LinearTaskFlow';
import { createProject, getProjects } from '../actions';
import { sendChatMessage } from '@/lib/ai';
import { useWebSocket, realtimeUpdates, setupRealtimeListeners } from '@/lib/websocket';
import { trackAction, BUSINESS_EVENTS } from '@/lib/analytics';
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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\n**Ready to start your project?**\n\nI'll walk you through:\n• Initial project assessment\n• Scope of Works generation\n• Work Breakdown Structure\n• Project Schedule with Gantt charts\n• Detailed Cost Estimation\n\nLet's begin! Please tell me about your construction project - what are you planning to build or renovate?",
      type: "normal"
    }
  ]);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // WebSocket connection
  const { isConnected, subscribe } = useWebSocket(userId);

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
      
      // Set projects from database (no mock data)
      setProjects(projectsWithProgress);
      
        // Set the first project as active if there are projects and no active project is set
        if (projectsWithProgress.length > 0 && !activeProject) {
          setActiveProject(projectsWithProgress[0].id);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // If API fails, show empty state (no mock data)
      setProjects([]);
      setActiveProject('');
    } finally {
      setIsLoading(false);
    }
  }, [activeProject]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize WebSocket and real-time listeners
  useEffect(() => {
    // Get user ID from localStorage or auth
    const storedUserId = localStorage.getItem('brixem_user_id');
    if (storedUserId) {
      setUserId(storedUserId);
    }

    // Setup real-time event listeners
    setupRealtimeListeners();

    // Subscribe to real-time updates
    const unsubscribeProject = subscribe('project_update', (data) => {
      console.log('Real-time project update:', data);
      // Refresh projects when updated
      loadProjects();
    });

    const unsubscribeTask = subscribe('task_update', (data) => {
      console.log('Real-time task update:', data);
      // Refresh projects when tasks are updated
      loadProjects();
    });

    const unsubscribeChat = subscribe('chat_message', (data) => {
      console.log('Real-time chat message:', data);
      // Add new chat message to UI
      if (data.role === 'ai' && data.text) {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: String(data.text),
          type: 'normal'
        }]);
      }
    });

    return () => {
      unsubscribeProject();
      unsubscribeTask();
      unsubscribeChat();
    };
  }, [subscribe, loadProjects]);

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: message,
      type: "normal"
    };

    setMessages(prev => [...prev, userMessage]);

    // Send real-time chat message
    if (isConnected) {
      realtimeUpdates.sendChatMessage({
        role: 'user',
        text: message,
        timestamp: new Date().toISOString(),
        userId: userId
      });
    }

    try {
      // Check if this is a project creation request
      const projectName = extractProjectName(message);
      
      if (projectName) {
        // Create new project
        try {
          const newProject = await createProject({
            name: projectName,
            type: 'renovation', // Default type
            location: 'TBD', // Will be updated by user
            description: `Project created via chat: ${message}`,
            size_sqft: 0 // Will be updated by user
          });
          
          // Add to local state
          setProjects(prev => [...prev, newProject]);
          setActiveProject(newProject.id);
          
          // Send real-time project update
          if (isConnected) {
            realtimeUpdates.sendProjectUpdate(newProject.id, {
              action: 'created',
              project: newProject,
              userId: userId
            });
          }

          // Track project creation
          trackAction(BUSINESS_EVENTS.PROJECT_CREATED, 'business', 'chat');
          
          const successMessage: ChatMessage = {
            role: "ai",
            text: `Great! I've created your project "${projectName}". You can now start adding tasks, milestones, and managing your construction project. What would you like to do next?`,
            type: "normal"
          };
          setMessages(prev => [...prev, successMessage]);
          return;
        } catch (error) {
          console.error('Error creating project:', error);
          const errorMessage: ChatMessage = {
            role: "ai",
            text: "I apologize, but I couldn't create the project. Please try again or contact support if the issue persists.",
            type: "normal"
          };
          setMessages(prev => [...prev, errorMessage]);
          return;
        }
      }

      // Regular AI chat
      const projectContext = activeProject ? 
        `Current Project: ${projects.find(p => p.id === activeProject)?.name || 'Unknown'}
        Project Status: ${projects.find(p => p.id === activeProject)?.status || 'Unknown'}
        Project Progress: ${projects.find(p => p.id === activeProject)?.progress || 0}%

        Total Tasks: ${taskCounts.totalTasks}
        Completed Tasks: ${taskCounts.completedTasks}
        To Do Tasks: ${taskCounts.toDoTasks}

        When user asks about tasks, current stage, or what needs to be done, provide specific actionable items based on the current project state.` : 
        'No active project selected';

      const response = await sendChatMessage([userMessage], projectContext);
      
      if (response.message) {
        const aiResponse: ChatMessage = {
          role: "ai",
          text: response.message,
          type: "normal"
        };
        setMessages(prev => [...prev, aiResponse]);

        // Check if AI is suggesting project creation and user responds positively
        if (isProjectCreationSuggestion(aiResponse.text) && isPositiveResponse(message)) {
          // Extract project details from conversation
          const projectData = extractProjectDataFromConversation();
          if (projectData) {
            try {
              const newProject = await createProject(projectData);
              
              // Add to local state
              setProjects(prev => [...prev, newProject]);
              setActiveProject(newProject.id);
              
              // Send real-time project update
              if (isConnected) {
                realtimeUpdates.sendProjectUpdate(newProject.id, {
                  action: 'created',
                  project: newProject,
                  userId: userId
                });
              }

              // Track project creation
              trackAction(BUSINESS_EVENTS.PROJECT_CREATED, 'business', 'chat');
              
              const successMessage: ChatMessage = {
                role: "ai",
                text: `Perfect! I've created your project "${projectData.name}" in your dashboard. You can now start managing tasks, tracking progress, and collaborating with contractors. Let me know what you'd like to work on first!`,
                type: "normal"
              };
              setMessages(prev => [...prev, successMessage]);
            } catch (error) {
              console.error('Error creating project:', error);
              const errorMessage: ChatMessage = {
                role: "ai",
                text: "I encountered an error creating your project. Please try again or contact support if the issue persists.",
                type: "normal"
              };
              setMessages(prev => [...prev, errorMessage]);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Provide more specific error messages
      let errorText = "I apologize, but I encountered an error. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          errorText = "AI service is temporarily unavailable. Please try again later.";
        } else if (error.message.includes('rate limit')) {
          errorText = "I'm receiving too many requests. Please wait a moment and try again.";
        } else if (error.message.includes('network')) {
          errorText = "Network error. Please check your connection and try again.";
        } else {
          errorText = `Error: ${error.message}`;
        }
      }
      
      const errorMessage: ChatMessage = {
        role: "ai",
        text: errorText,
        type: "normal"
      };
      setMessages(prev => [...prev, errorMessage]);
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

  // Show empty state for new users (no projects)
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

          {/* Modern AI Assistant Chat */}
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-96 max-h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                      <p className="text-xs text-gray-500">Ask anything about your project</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatExpanded(!isChatExpanded)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 max-h-[400px]">
                <div className="space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx}>
                      {msg.role === 'ai' && (
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3">
                              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{msg.text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-2 ml-1 block">Just now</span>
                          </div>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <div className="flex items-start space-x-3 justify-end">
                          <div className="flex-1 flex flex-col items-end">
                            <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-lg">
                              <p className="text-sm leading-relaxed">{msg.text}</p>
                            </div>
                            <span className="text-xs text-gray-400 mt-2 mr-1 block">Just now</span>
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <span className="text-gray-700 font-medium text-xs">AT</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={messages.find(m => m.role === 'user')?.text || ''}
                    onChange={() => {
                      // Handle input change
                    }}
                      placeholder="Ask me anything..."
                      className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
                      rows={1}
                    />
                    <button className="absolute right-3 bottom-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      const input = document.querySelector('textarea') as HTMLTextAreaElement;
                      if (input?.value) {
                        handleSendMessage(input.value);
                        input.value = '';
                      }
                    }}
                    className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
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

        {/* Modern AI Assistant Chat */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden w-96 max-h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-xs text-gray-500">Ask anything about your project</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsChatExpanded(!isChatExpanded)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 max-h-[400px]">
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div key={idx}>
                    {msg.role === 'ai' && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-2xl rounded-tl-md px-4 py-3">
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-2 ml-1 block">Just now</span>
                        </div>
                      </div>
                    )}
                    {msg.role === 'user' && (
                      <div className="flex items-start space-x-3 justify-end">
                        <div className="flex-1 flex flex-col items-end">
                          <div className="bg-blue-600 text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-lg">
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                          </div>
                          <span className="text-xs text-gray-400 mt-2 mr-1 block">Just now</span>
                        </div>
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <span className="text-gray-700 font-medium text-xs">AT</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    value={messages.find(m => m.role === 'user')?.text || ''}
                    onChange={() => {
                      // Handle input change
                    }}
                    placeholder="Ask me anything..."
                    className="w-full px-4 py-3 pr-12 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 resize-none"
                    rows={1}
                  />
                  <button className="absolute right-3 bottom-3 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                </div>
                <button
                  onClick={() => {
                    const input = document.querySelector('textarea') as HTMLTextAreaElement;
                    if (input?.value) {
                      handleSendMessage(input.value);
                      input.value = '';
                    }
                  }}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Helper function to detect if AI is suggesting project creation
function isProjectCreationSuggestion(aiText: string): boolean {
  const lowerText = aiText.toLowerCase();
  return lowerText.includes('create a project') ||
         lowerText.includes('create project') ||
         lowerText.includes('set up a project') ||
         lowerText.includes('start a project') ||
         lowerText.includes('project in your dashboard') ||
         lowerText.includes('create this project') ||
         lowerText.includes('would you like me to create') ||
         lowerText.includes('shall i create') ||
         lowerText.includes('let me create');
}

// Helper function to detect positive responses
function isPositiveResponse(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  return lowerMessage === 'yes' || 
         lowerMessage === 'y' || 
         lowerMessage === 'yeah' || 
         lowerMessage === 'yep' || 
         lowerMessage === 'sure' || 
         lowerMessage === 'ok' || 
         lowerMessage === 'okay' ||
         lowerMessage === 'create project' ||
         lowerMessage === 'create' ||
         lowerMessage === 'go ahead' ||
         lowerMessage === 'please' ||
         lowerMessage.includes('yes') ||
         lowerMessage.includes('create project');
}

// Helper function to extract project data from conversation
function extractProjectDataFromConversation(): {
  name: string;
  type: string;
  location: string;
  description: string;
  size_sqft: number;
} {
  // This would extract project details from the conversation history
  // For now, return a default project structure
  return {
    name: 'My Construction Project',
    type: 'renovation',
    location: 'To be specified',
    description: 'Project created via AI chat conversation',
    size_sqft: 0
  };
}
