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

interface ChatStep {
  id: number;
  title: string;
  question: string;
  suggestions: string[];
  placeholder: string;
  completed: boolean;
}

// 8-Step Guided Flow Configuration
const CHAT_STEPS: ChatStep[] = [
  {
    id: 1,
    title: "Project Type",
    question: "What type of project are you planning?",
    suggestions: ["Kitchen Renovation", "Bathroom Renovation", "Extension", "Loft Conversion", "Whole House Renovation", "Garden Room"],
    placeholder: "e.g., Kitchen renovation, Extension, etc.",
    completed: false
  },
  {
    id: 2,
    title: "Location",
    question: "Where is your project located?",
    suggestions: ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Other UK City"],
    placeholder: "e.g., London, Manchester, etc.",
    completed: false
  },
  {
    id: 3,
    title: "Size & Scope",
    question: "What's the size or scope of your project?",
    suggestions: ["Small (under 20m²)", "Medium (20-50m²)", "Large (50-100m²)", "Very Large (100m²+)"],
    placeholder: "e.g., 30m² kitchen, 2-story extension, etc.",
    completed: false
  },
  {
    id: 4,
    title: "Budget Range",
    question: "What's your budget range?",
    suggestions: ["Under £25k", "£25k - £50k", "£50k - £100k", "£100k - £200k", "£200k+"],
    placeholder: "e.g., £50k - £75k",
    completed: false
  },
  {
    id: 5,
    title: "Timeline",
    question: "When would you like to start and finish?",
    suggestions: ["ASAP", "Next 3 months", "Next 6 months", "Next year", "Flexible"],
    placeholder: "e.g., Start in March, finish by summer",
    completed: false
  },
  {
    id: 6,
    title: "Goals & Priorities",
    question: "What are your main goals for this project?",
    suggestions: ["More Space", "Modern Design", "Energy Efficiency", "Increased Value", "Better Functionality"],
    placeholder: "e.g., More space, modern look, energy efficient",
    completed: false
  },
  {
    id: 7,
    title: "Challenges",
    question: "Are there any specific challenges or requirements?",
    suggestions: ["Planning Permission", "Party Wall Issues", "Access Problems", "Listed Building", "Conservation Area"],
    placeholder: "e.g., Need planning permission, tight access",
    completed: false
  },
  {
    id: 8,
    title: "Additional Details",
    question: "Any other important details we should know?",
    suggestions: ["Specific Materials", "Design Preferences", "Contractor Preferences", "Special Requirements"],
    placeholder: "e.g., Want eco-friendly materials, specific style",
    completed: false
  }
];

export default function GuidedProjectEnhanced() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<Partial<ProjectData>>({});
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [, setCompletedSteps] = useState<number[]>([]);
  const [projectCreationError, setProjectCreationError] = useState(false);
  const [showLoadingPage, setShowLoadingPage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message and first step
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'ai',
      text: "Hello! I&apos;m your Brixem AI assistant. I&apos;m here to help you create a comprehensive construction project plan through 8 simple steps. Let&apos;s get started!",
      type: 'question'
    };
    setMessages([welcomeMessage]);
    setCurrentStep(0);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading || isCreatingProject) return;

    const userMessage: Message = {
      role: 'user',
      text: inputText.trim(),
      type: 'response'
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      // Process the current step
      await processStepResponse(currentInput);
      
      // Move to next step or create project
      if (currentStep < CHAT_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1);
        setCompletedSteps(prev => [...prev, currentStep]);
        
        // Add AI response for next step
        const nextStep = CHAT_STEPS[currentStep + 1];
        const nextStepMessage: Message = {
          role: 'ai',
          text: `Great! Now let's move to step ${nextStep.id}: ${nextStep.title}\n\n${nextStep.question}`,
          type: 'question'
        };
        setMessages(prev => [...prev, nextStepMessage]);
      } else {
        // All steps completed, show loading page with contractor cards
        console.log('All steps completed, showing loading page...', { currentStep, projectData });
        setCompletedSteps(prev => [...prev, currentStep]);
        setIsCreatingProject(true);
        setShowLoadingPage(true);
        
        // Add completion message
        const completionMessage: Message = {
          role: 'ai',
          text: "Perfect! I have all the information I need. Let me create your project and find the best contractors for you...",
          type: 'response'
        };
        setMessages(prev => [...prev, completionMessage]);
        
        // Start project creation after showing loading page
        setTimeout(() => {
          createProjectFromSteps();
        }, 1000);
      }

    } catch (error) {
      console.error('Error processing step:', error);
      const errorMessage: Message = {
        role: 'ai',
        text: "I&apos;m sorry, I encountered an error. Please try again.",
        type: 'response'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Only set loading to false if we're not creating a project
      if (!isCreatingProject) {
        setIsLoading(false);
      }
    }
  };

  const processStepResponse = async (response: string) => {
    const step = CHAT_STEPS[currentStep];
    
    // Update project data based on current step
    const updatedData = { ...projectData };
    
    switch (step.id) {
      case 1: // Project Type
        updatedData.projectType = response;
        updatedData.description = response;
        break;
      case 2: // Location
        updatedData.location = { city: response, country: 'UK' };
        break;
      case 3: // Size & Scope
        const sizeMatch = response.match(/(\d+)/);
        if (sizeMatch) {
          updatedData.size = parseInt(sizeMatch[1]);
        }
        break;
      case 4: // Budget Range
        const budgetMatch = response.match(/(\d+)(?:k|,000)?\s*(?:to|-)?\s*(\d+)?(?:k|,000)?/i);
        if (budgetMatch) {
          const min = parseInt(budgetMatch[1]) * (budgetMatch[1].includes('k') ? 1000 : 1);
          const max = budgetMatch[2] ? parseInt(budgetMatch[2]) * (budgetMatch[2].includes('k') ? 1000 : 1) : min * 1.5;
          updatedData.budgetMin = min;
          updatedData.budgetMax = max;
          updatedData.budgetRange = `${min.toLocaleString()} - ${max.toLocaleString()}`;
        }
        break;
      case 5: // Timeline
        updatedData.preferredStartDate = response;
        break;
      case 6: // Goals
        updatedData.goals = [response];
        break;
      case 7: // Challenges
        updatedData.knownIssues = [response];
        break;
      case 8: // Additional Details
        updatedData.additionalChallenges = [response];
        break;
    }
    
    setProjectData(updatedData);
  };

          const createProjectFromSteps = async () => {
            try {
              console.log('createProjectFromSteps called with projectData:', projectData);
              
              // Create project with collected data
              console.log('Calling createProjectInDashboard...');
              await createProjectInDashboard(projectData);
              
            } catch (error) {
              console.error('Error creating project:', error);
              // Hide loading page and show error
              setShowLoadingPage(false);
              setProjectCreationError(true);
              setIsCreatingProject(false);
            }
          };

  const retryProjectCreation = async () => {
    setProjectCreationError(false);
    setIsCreatingProject(true);
    await createProjectFromSteps();
  };

  const createProjectInDashboard = async (data: Partial<ProjectData>) => {
    try {
      console.log('createProjectInDashboard called with data:', data);
      
      // Create a more robust project name
      const projectName = data.projectType && data.description 
        ? `${data.projectType} - ${data.description}`.substring(0, 100)
        : data.projectType || data.description || 'New Construction Project';
      
      console.log('Project name:', projectName);
      
      const projectPayload = {
        name: projectName,
        type: data.projectType?.toLowerCase().replace(/\s+/g, '-') || 'renovation',
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

      console.log('Sending project payload:', projectPayload);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectPayload),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create project: ${response.status} ${errorText}`);
      }

              const newProject = await response.json();
              console.log('Project created successfully:', newProject);
              
              // Hide loading page and redirect to contractor selection
              setShowLoadingPage(false);
              setIsCreatingProject(false);
              
              // Redirect to contractor selection page with project data
              const params = new URLSearchParams({
                type: data.projectType || 'Renovation',
                location: data.location?.city || 'London',
                budget: data.budgetRange || '£25k - £75k',
                size: data.size?.toString() || 'Medium',
                timeline: data.preferredStartDate || 'Next 3 months',
                goals: (data.goals || []).join(','),
                challenges: (data.knownIssues || []).join(','),
                details: (data.additionalChallenges || []).join(',')
              });
              
              window.location.href = `/dashboard/homeowner/contractor-selection?${params.toString()}`;

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

  const currentStepData = CHAT_STEPS[currentStep];
  const progress = ((currentStep + 1) / CHAT_STEPS.length) * 100;

  // Loading page with contractor cards
  if (showLoadingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => window.location.href = '/dashboard/homeowner'}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Creating Your Project</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Finding the best contractors for your project...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Project</h2>
            <p className="text-gray-600 mb-6">We&apos;re analyzing your requirements and finding the best contractors for your project...</p>
          </div>

          {/* Contractor Cards Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Contractor Card 1 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
              <div className="relative h-24 rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1581578731548-c6a0c3f2f4c4?w=300&h=150&fit=crop&crop=center"
                  alt="Premier Construction"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Premier Construction Ltd</h3>
              <div className="flex items-center mb-2">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900 text-sm">4.8</span>
                <span className="text-gray-500 text-xs ml-1">(127 reviews)</span>
              </div>
              <p className="text-green-600 font-semibold text-sm">£25k - £75k</p>
            </div>

            {/* Contractor Card 2 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
              <div className="relative h-24 rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&h=150&fit=crop&crop=center"
                  alt="Elite Home Improvements"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Elite Home Improvements</h3>
              <div className="flex items-center mb-2">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900 text-sm">4.9</span>
                <span className="text-gray-500 text-xs ml-1">(89 reviews)</span>
              </div>
              <p className="text-green-600 font-semibold text-sm">£40k - £120k</p>
            </div>

            {/* Contractor Card 3 */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200">
              <div className="relative h-24 rounded-lg overflow-hidden mb-3">
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=300&h=150&fit=crop&crop=center"
                  alt="Swift Build Solutions"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute top-2 right-2">
                  <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </div>
                </div>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Swift Build Solutions</h3>
              <div className="flex items-center mb-2">
                <svg className="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-semibold text-gray-900 text-sm">4.7</span>
                <span className="text-gray-500 text-xs ml-1">(203 reviews)</span>
              </div>
              <p className="text-green-600 font-semibold text-sm">£20k - £60k</p>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Creating your project and finding contractors...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <button
                onClick={() => window.location.href = '/dashboard/homeowner'}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition flex-shrink-0"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Guided Project Creation</h1>
                <p className="text-xs sm:text-sm text-gray-500 truncate">Step {currentStep + 1} of {CHAT_STEPS.length}: {currentStepData?.title}</p>
              </div>
            </div>
            {isCreatingProject && (
              <div className="flex items-center space-x-2 text-blue-600 flex-shrink-0">
                <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-600"></div>
                <span className="text-xs sm:text-sm hidden sm:inline">Creating project...</span>
                <span className="text-xs sm:hidden">Creating...</span>
              </div>
            )}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-lg flex flex-col h-[calc(100vh-200px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

                  {/* Current Step Question & Suggestions */}
                  {currentStepData && !isCreatingProject && !projectCreationError && (
                    <div className="border-t border-gray-200 p-4 sm:p-6 bg-blue-50 flex-shrink-0">
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1">{currentStepData.question}</h3>
                        <p className="text-xs text-gray-600">You can choose from the suggestions below or type your own answer.</p>
                      </div>
                      
                      {/* Suggestion Boxes */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-3 sm:mb-4">
                        {currentStepData.suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInputText(suggestion);
                              handleSend();
                            }}
                            className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left text-gray-900 hover:text-gray-900"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Creation Error Retry */}
                  {projectCreationError && (
                    <div className="border-t border-gray-200 p-4 sm:p-6 bg-red-50 flex-shrink-0">
                      <div className="text-center">
                        <div className="w-12 h-12 aspect-square bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </div>
                        <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">Project Creation Failed</h3>
                        <p className="text-xs text-gray-600 mb-4">There was an error creating your project. You can try again or contact support for assistance.</p>
                        <div className="flex flex-col sm:flex-row gap-2 justify-center">
                          <button
                            onClick={retryProjectCreation}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={() => window.location.href = '/dashboard/homeowner'}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                          >
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

          {/* Input */}
          {!projectCreationError && (
            <div className="border-t border-gray-200 p-4 sm:p-6 flex-shrink-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentStepData?.placeholder || "Type your response here..."}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 bg-white text-sm sm:text-base"
                  disabled={isLoading || isCreatingProject}
                  style={{ color: '#111827' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputText.trim() || isLoading || isCreatingProject}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium text-sm sm:text-base"
                >
                  {currentStep < CHAT_STEPS.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}