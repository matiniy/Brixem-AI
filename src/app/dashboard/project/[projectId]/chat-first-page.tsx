'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '../../actions';
import ProjectShell from '@/components/ProjectShell';
import { ProjectHydrator } from '@/components/ProjectHydrator';
// import { CHAT_FIRST } from '@/lib/flags'; // Removed unused import
import { useProjectStore } from '@/store/projectStore';
import { sendChatMessage } from '@/lib/ai';

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
  workspaces: Array<{
    id: string;
    name: string;
  }>;
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

export default function ChatFirstProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome back! I'm here to help you manage your project. What would you like to work on today?",
      type: "normal"
    }
  ]);
  // const [isGenerating, setIsGenerating] = useState(false); // Removed unused variable

  const { tasks, addTask } = useProjectStore(); // Removed unused variables

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectData = await getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/dashboard/homeowner');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  // Initialize with sample data for demo
  useEffect(() => {
    if (project && tasks.length === 0) {
      // Add some sample tasks for demonstration
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
      useProjectStore.getState().setAll(
        { ...project, percentComplete: 25, currentMilestoneId: 'milestone-1' },
        sampleMilestones,
        sampleTasks
      );
    }
  }, [project, tasks.length]);

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
      const response = await sendChatMessage([userMessage], `Project: ${project?.name || 'Unknown'}`);
      
      const aiMessage: ChatMessage = {
        role: "ai",
        text: response.message,
        type: "normal"
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle task creation if detected
      if (message.toLowerCase().includes('create task') || message.toLowerCase().includes('add task')) {
        const taskTitle = message.replace(/create task|add task/gi, '').trim();
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-4">The project you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push('/dashboard/homeowner')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <ProjectHydrator 
        project={{ ...project, percentComplete: 25, currentMilestoneId: 'milestone-1' }}
        milestones={[
          {
            id: 'milestone-1',
            title: 'Planning Phase',
            status: 'doing',
            order: 1,
            description: 'Complete project planning and design'
          },
          {
            id: 'milestone-2', 
            title: 'Permits & Approvals',
            status: 'todo',
            order: 2,
            description: 'Obtain all necessary permits'
          },
          {
            id: 'milestone-3',
            title: 'Contractor Selection',
            status: 'todo',
            order: 3,
            description: 'Choose and hire contractors'
          }
        ]}
        tasks={tasks}
      />
      <ProjectShell 
        onSend={handleSendMessage}
        messages={messages}
        placeholder="Ask about your project tasks..."
      />
    </div>
  );
}
