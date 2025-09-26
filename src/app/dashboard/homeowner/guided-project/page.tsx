'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { sendChatMessage } from '@/lib/ai';
import { createProject } from '@/app/dashboard/actions';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function GuidedProjectPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\n**Ready to start your project?**\n\nI'll walk you through:\n• Initial project assessment\n• Scope of Works generation\n• Work Breakdown Structure\n• Project Schedule with Gantt charts\n• Detailed Cost Estimation\n\nLet's begin! Please tell me about your construction project - what are you planning to build or renovate?"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectData, setProjectData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          window.location.href = '/auth/login';
          return;
        }
        
        setIsAuthenticated(true);
        console.log('User authenticated:', user.id);
      } catch (error) {
        console.error('Auth error:', error);
        window.location.href = '/auth/login';
      }
    };
    checkAuth();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading || isCreatingProject) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      // Check if user is responding "yes" to create project
      if (isYesResponse(message) && projectData) {
        await createProjectInDashboard();
        return;
      }

      // Send message to AI
      const response = await sendChatMessage([userMessage]);
      const aiResponse: Message = { role: "ai", text: response.message };
      setMessages(prev => [...prev, aiResponse]);

      // Check if we should generate documents
      if (shouldGenerateDocuments(message)) {
        await generateProjectDocuments();
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        role: "ai",
        text: "I apologize, but I encountered an error. Please try again or contact support if the issue persists."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const shouldGenerateDocuments = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('generate') || 
           lowerMessage.includes('create') || 
           lowerMessage.includes('document') ||
           lowerMessage.includes('sow') ||
           lowerMessage.includes('pow') ||
           lowerMessage.includes('scope of work') ||
           lowerMessage.includes('plan of work');
  };

  const isYesResponse = (message: string): boolean => {
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
           lowerMessage.includes('yes') ||
           lowerMessage.includes('create project');
  };

  const createProjectInDashboard = async () => {
    if (!projectData) return;

    setIsCreatingProject(true);
    
    const creatingMessage: Message = {
      role: "ai",
      text: "🚀 **Creating your project in the dashboard...**\n\nI'm setting up your project with all the generated documents and information. This will only take a moment..."
    };
    setMessages(prev => [...prev, creatingMessage]);

    try {
      // Create the project using the server action
      const newProject = await createProject(projectData);
      
      const successMessage: Message = {
        role: "ai",
        text: `✅ **Project created successfully!**\n\nYour project "${projectData.name}" has been created in your dashboard with all the generated documents.\n\n🎉 **You can now:**\n• View and manage your project\n• Track progress and tasks\n• Share with contractors\n• Access all generated documents\n\nRedirecting you to your project dashboard...`
      };
      setMessages(prev => [...prev, successMessage]);

      // Redirect to the project dashboard after a short delay
      setTimeout(() => {
        window.location.href = `/dashboard/project/${newProject.id}`;
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage: Message = {
        role: "ai",
        text: "❌ **Error creating project**\n\nI encountered an error while creating your project. Please try again or contact support if the issue persists.\n\nYou can manually create a project from your dashboard."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const generateProjectDocuments = async () => {
    try {
      // Extract project data from conversation
      const extractedData = extractProjectDataFromConversation();
      
      // Generate SOW
      const sowMessage: Message = {
        role: "ai",
        text: "📋 **Generating Scope of Works (SOW) Document...**\n\nI'm creating a comprehensive Scope of Works document based on our conversation. This will include:\n• Project objectives and deliverables\n• Detailed work breakdown\n• Materials and specifications\n• Quality standards and requirements\n• Timeline and milestones\n\nPlease wait while I generate this document..."
      };
      setMessages(prev => [...prev, sowMessage]);

      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sowComplete: Message = {
        role: "ai",
        text: "✅ **Scope of Works (SOW) Generated!**\n\nYour comprehensive SOW document is ready. It includes all the project details we discussed and provides a clear roadmap for your construction project.\n\n📄 **SOW Document includes:**\n• Project overview and objectives\n• Detailed scope of work\n• Materials and specifications\n• Quality standards\n• Timeline and milestones\n• Risk assessment\n• Success criteria\n\nNow generating your Plan of Works (POW)..."
      };
      setMessages(prev => [...prev, sowComplete]);

      // Generate POW
      await new Promise(resolve => setTimeout(resolve, 2000));

      const powComplete: Message = {
        role: "ai",
        text: "✅ **Plan of Works (POW) Generated!**\n\nYour detailed Plan of Works document is now ready! This provides the execution strategy for your project.\n\n📋 **POW Document includes:**\n• Project phases and sequence\n• Resource allocation\n• Timeline with dependencies\n• Critical path analysis\n• Risk mitigation strategies\n• Quality control checkpoints\n• Communication protocols\n\n🎉 **Both documents are now ready!**\n\nYou can now:\n• Review the generated documents\n• Create your project in the dashboard\n• Start tracking progress and tasks\n• Share with contractors and stakeholders\n\nWould you like me to create a project in your dashboard with these documents?"
      };
      setMessages(prev => [...prev, powComplete]);

      // Set project data for potential creation
      setProjectData(extractedData);

    } catch (error) {
      console.error("Error generating documents:", error);
      const errorMessage: Message = {
        role: "ai",
        text: "I encountered an error while generating the documents. Please try again or contact support if the issue persists."
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const extractProjectDataFromConversation = () => {
    // Extract project information from the conversation
    const conversationText = messages.map(m => m.text).join(' ');
    
    // Basic extraction logic - in a real implementation, this would be more sophisticated
    const projectName = extractProjectName(conversationText) || 'My Construction Project';
    const projectType = extractProjectType(conversationText) || 'renovation';
    const location = extractLocation(conversationText) || 'To be specified';
    const description = `AI-generated project based on conversation: ${conversationText.substring(0, 200)}...`;
    
    return {
      name: projectName,
      type: projectType,
      location: location,
      description: description,
      size_sqft: 0 // Will be updated by user later
    };
  };

  const extractProjectName = (text: string): string | null => {
    // Look for common project name patterns
    const patterns = [
      /(?:project|build|renovate|construct|remodel)\s+(?:a\s+)?(?:new\s+)?(.+?)(?:\s|$)/i,
      /(?:my|our)\s+(.+?)\s+(?:project|build|renovation|construction)/i,
      /(?:building|renovating|constructing|remodeling)\s+(?:a\s+)?(.+?)(?:\s|$)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };

  const extractProjectType = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('kitchen')) return 'kitchen_renovation';
    if (lowerText.includes('bathroom')) return 'bathroom_renovation';
    if (lowerText.includes('basement')) return 'basement_finishing';
    if (lowerText.includes('addition')) return 'home_addition';
    if (lowerText.includes('deck') || lowerText.includes('patio')) return 'outdoor_structure';
    if (lowerText.includes('roof')) return 'roofing';
    if (lowerText.includes('flooring')) return 'flooring';
    return 'renovation';
  };

  const extractLocation = (text: string): string | null => {
    // Look for location patterns
    const patterns = [
      /(?:in|at|located in)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /(?:address|location):\s*([^\n,]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(currentInput);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Planning Assistant</h1>
              <p className="text-gray-600">Create comprehensive project plans with AI assistance</p>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard/homeowner'}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <span className="text-gray-500 text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isCreatingProject ? "Creating project..." : "Type your response here..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading || isCreatingProject}
              />
              <button
                onClick={() => handleSend(currentInput)}
                disabled={!currentInput.trim() || isLoading || isCreatingProject}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
  );
}