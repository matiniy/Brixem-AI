'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { createProject, getProjects } from '../actions';
import { sendChatMessage } from '@/lib/ai';
// import { useProjectStore } from '@/store/projectStore'; // Removed unused import

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

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

export default function ChatFirstHomeownerDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! I'm your AI construction assistant. I can help you create new projects, manage existing ones, and guide you through your construction journey. What would you like to work on today?",
      type: "normal"
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);

  // const { setAll } = useProjectStore(); // Removed unused variable

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

      // Handle project creation if detected
      if (message.toLowerCase().includes('create project') || message.toLowerCase().includes('new project')) {
        // Extract project details from the message
        const projectName = extractProjectName(message);
        if (projectName) {
          const projectData = {
            name: projectName,
            location: "To be specified",
            description: `Project created via AI: ${message}`,
            type: "renovation"
          };
          
          try {
            await createProject(projectData);
            await loadProjects();
            
            const successMessage: ChatMessage = {
              role: "ai",
              text: `Great! I've created your project "${projectName}". You can now view it in your projects list or click on it to manage tasks and track progress.`,
              type: "system"
            };
            setMessages(prev => [...prev, successMessage]);
          } catch {
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
    // Simple extraction - look for patterns like "create project X" or "new project Y"
    const patterns = [
      /create project (.+)/i,
      /new project (.+)/i,
      /project called (.+)/i,
      /project named (.+)/i
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

      {/* Main Content - Chat-First Layout */}
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
                  Brixem Assistant
                </h1>
              </div>

              {/* Project Count */}
              <div className="text-sm text-gray-600">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </header>

        {/* Main Chat Interface */}
        <main className="flex-1 overflow-hidden bg-gray-50">
          <div className="h-full flex">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] break-words shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-br-md'
                            : msg.type === 'system'
                              ? 'bg-green-100 text-green-800 font-medium'
                              : 'bg-white text-gray-900 rounded-bl-md border border-gray-200'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-white text-gray-900 rounded-bl-md border border-gray-200 px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t bg-white p-6">
                <div className="max-w-4xl mx-auto">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = e.currentTarget.message;
                      if (input.value.trim()) {
                        handleSendMessage(input.value);
                        input.value = '';
                      }
                    }}
                    className="flex gap-3"
                  >
                    <input
                      name="message"
                      type="text"
                      placeholder="Ask me about your projects, create new ones, or get help..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30 focus:border-[#23c6e6]"
                      disabled={isGenerating}
                    />
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="px-6 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Projects Sidebar */}
            <div className="w-80 border-l bg-white overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Projects</h3>
                
                {projects.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No projects yet</p>
                    <p className="text-gray-400 text-xs mt-1">Ask me to create one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleProjectSelect(project.id)}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{project.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {project.location}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{project.progress}% complete</span>
                          <span>View →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
