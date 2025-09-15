'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import KanbanBoard from '@/components/KanbanBoard';
import FloatingChatOverlay from '@/components/FloatingChatOverlay';
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

export default function FloatingChatDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! I'm your AI construction assistant. I can help you create new projects, manage tasks, and guide you through your construction journey. What would you like to work on today?",
      type: "normal"
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  const { tasks, addTask, updateTask, deleteTask, setAll } = useProjectStore();

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: Math.floor(Math.random() * 100) // Random progress for demo
      }));
      setProjects(projectsWithProgress);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsGenerating(true);

    try {
      const response = await sendChatMessage([userMessage], 'Homeowner Dashboard - Project Management');
      
      const aiMessage: ChatMessage = {
        role: "ai",
        text: response.message,
        type: "normal"
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle task creation if detected
      if (message.toLowerCase().includes('create task') || message.toLowerCase().includes('add task')) {
        const taskTitle = extractProjectName(message);
        if (taskTitle) {
          addTask({
            title: taskTitle,
            status: 'todo',
            priority: 'medium',
            progress: 0,
            assignedUsers: [],
            comments: 0,
            likes: 0
          });
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
            await loadProjects();
            
            const successMessage: ChatMessage = {
              role: "ai",
              text: `Great! I've created your project "${projectName}". You can now view it in your projects list or click on it to manage tasks and track progress.`,
              type: "system"
            };
            setMessages(prev => [...prev, successMessage]);
          } catch (error) {
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
      setIsGenerating(false);
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
    
    return null;
  };

  const handleProjectSelect = (projectId: string) => {
    window.location.href = `/dashboard/project/${projectId}`;
  };

  const handleTaskUpdate = (taskId: string, updates: any) => {
    updateTask(taskId, updates);
  };

  const handleAddTask = (task: any) => {
    addTask(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
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
        onProjectCreate={() => {}} // Handled by chat
        onProjectDelete={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onStartProjectChat={() => {}}
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

              {/* Project Count */}
              <div className="text-sm text-gray-600">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </header>

        {/* Kanban Board - Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Kanban Board</h2>
              <p className="text-gray-600">Manage tasks and track progress for your projects</p>
            </div>

            <div className="h-[calc(100%-120px)]">
              <KanbanBoard 
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onAddTask={handleAddTask}
                onDeleteTask={handleDeleteTask}
                interactive={true}
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
