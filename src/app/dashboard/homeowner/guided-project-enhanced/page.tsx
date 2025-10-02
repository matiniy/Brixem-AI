'use client';

import { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  type?: 'question' | 'response' | 'document' | 'download';
  data?: Record<string, unknown>;
}

interface ProjectData {
  projectType: string;
  intendedUse: string;
  location: {
    city: string;
    country: string;
  };
  description: string;
  size: number;
  goals: string[];
  knownIssues: string[];
  budgetRange: string;
  budgetMin: number;
  budgetMax: number;
  preferredStartDate: string;
  preferredCompletionDate: string;
  conservationArea: boolean;
  greenBelt: boolean;
  listedBuilding: boolean;
  partyWallIssues: boolean;
  accessChallenges: boolean;
  planningChallenges: boolean;
  additionalChallenges: string[];
}

export default function GuidedProjectEnhanced() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<Partial<ProjectData>>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'ai',
        text: "Hello! I&apos;m your Brixem AI assistant. I&apos;m here to help you create a comprehensive construction project plan. \n\nTell me about your project - what are you planning to build or renovate? You can describe it in your own words, and I&apos;ll ask follow-up questions to gather all the details we need.",
      type: 'question'
    };
    setMessages([welcomeMessage]);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      text: inputText.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText.trim(),
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.text
          })),
          projectData: projectData
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        role: 'ai',
        text: data.response,
        type: 'response'
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if AI suggests creating a project
      if (data.response.toLowerCase().includes('create project') || 
          data.response.toLowerCase().includes('ready to create') ||
          data.response.toLowerCase().includes('let\'s create your project')) {
        // Extract project data from conversation
        const extractedData = extractProjectDataFromConversation([...messages, userMessage, aiMessage]);
        if (extractedData) {
          setProjectData(extractedData);
          await createProjectInDashboard(extractedData);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'ai',
        text: "I&apos;m sorry, I encountered an error. Please try again or refresh the page.",
        type: 'response'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const extractProjectDataFromConversation = (conversation: Message[]): Partial<ProjectData> | null => {
    const fullText = conversation.map(msg => msg.text).join(' ');
    
    // Extract basic project information using simple patterns
    const projectType = extractProjectType(fullText);
    const description = extractDescription(fullText);
    const location = extractLocation(fullText);
    const budget = extractBudget(fullText);
    
    if (!projectType || !description) {
      return null;
    }

    return {
      projectType,
      description,
      location: location || { city: 'Unknown', country: 'Unknown' },
      budgetRange: budget?.range || 'Not specified',
      budgetMin: budget?.min || 0,
      budgetMax: budget?.max || 0,
      intendedUse: 'Residential', // Default
      size: 0, // Will be estimated
      goals: [],
      knownIssues: [],
      preferredStartDate: '',
      preferredCompletionDate: '',
      conservationArea: false,
      greenBelt: false,
      listedBuilding: false,
      partyWallIssues: false,
      accessChallenges: false,
      planningChallenges: false,
      additionalChallenges: []
    };
  };

  const extractProjectType = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('kitchen')) return 'Kitchen';
    if (lowerText.includes('bathroom')) return 'Bathroom';
    if (lowerText.includes('extension')) return 'Extension';
    if (lowerText.includes('loft')) return 'Loft Conversion';
    if (lowerText.includes('renovation')) return 'Renovation';
    if (lowerText.includes('new build')) return 'New Build';
    return 'Renovation'; // Default
  };

  const extractDescription = (text: string): string => {
    // Find the most descriptive part of the conversation
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences[0]?.trim() || 'Construction project';
  };

  const extractLocation = (text: string): { city: string; country: string } | null => {
    // Simple location extraction - in a real app, you'd use a more sophisticated approach
    const locationMatch = text.match(/(?:in|at|located in)\s+([A-Za-z\s]+)/i);
    if (locationMatch) {
      return { city: locationMatch[1].trim(), country: 'UK' };
    }
    return null;
  };

  const extractBudget = (text: string): { range: string; min: number; max: number } | null => {
    const budgetMatch = text.match(/(\d+)(?:k|,000)?\s*(?:to|-)?\s*(\d+)?(?:k|,000)?/i);
    if (budgetMatch) {
      const min = parseInt(budgetMatch[1]) * (budgetMatch[1].includes('k') ? 1000 : 1);
      const max = budgetMatch[2] ? parseInt(budgetMatch[2]) * (budgetMatch[2].includes('k') ? 1000 : 1) : min * 1.5;
      return { range: `${min.toLocaleString()} - ${max.toLocaleString()}`, min, max };
    }
    return null;
  };

  const createProjectInDashboard = async (data: Partial<ProjectData>) => {
    try {
      setIsCreatingProject(true);
      
      const projectPayload = {
        name: `${data.projectType} - ${data.description}`.substring(0, 100),
        type: data.projectType?.toLowerCase().replace(' ', '-') || 'renovation',
        location: `${data.location?.city || 'Unknown'}, ${data.location?.country || 'UK'}`,
        description: data.description || 'Construction project',
        size_sqft: data.size || 0,
        budget_min: data.budgetMin || 0,
        budget_max: data.budgetMax || 0,
        goals: data.goals || [],
        known_issues: data.knownIssues || [],
        preferred_start_date: data.preferredStartDate || '',
        preferred_completion_date: data.preferredCompletionDate || '',
        conservation_area: data.conservationArea || false,
        green_belt: data.greenBelt || false,
        listed_building: data.listedBuilding || false,
        party_wall_issues: data.partyWallIssues || false,
        access_challenges: data.accessChallenges || false,
        planning_challenges: data.planningChallenges || false,
        additional_challenges: data.additionalChallenges || []
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectPayload),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const newProject = await response.json();
      
      // Add success message
      const successMessage: Message = {
        role: 'ai',
        text: `🎉 Great! I've created your project "${newProject.name}". You can now view it in your dashboard and I'll help you create detailed project plans, timelines, and documents.`,
        type: 'response'
      };
      
      setMessages(prev => [...prev, successMessage]);

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        window.location.href = '/dashboard/homeowner';
      }, 2000);

    } catch (error) {
      console.error('Error creating project:', error);
      const errorMessage: Message = {
        role: 'ai',
        text: "I&apos;m sorry, I couldn&apos;t create your project right now. Please try again or contact support.",
        type: 'response'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard/homeowner'}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Guided Project Creation</h1>
                <p className="text-sm text-gray-500">Tell me about your project and I&apos;ll help you create a comprehensive plan</p>
              </div>
            </div>
            {isCreatingProject && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Creating project...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Messages */}
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white"
                disabled={isLoading || isCreatingProject}
                style={{ color: '#111827' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || isLoading || isCreatingProject}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}