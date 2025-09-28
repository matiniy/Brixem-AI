'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { sendChatMessage } from '@/lib/ai';

interface Message {
  role: 'user' | 'ai';
  text: string;
  type?: 'question' | 'response' | 'document' | 'download';
  data?: any;
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

interface ConversationState {
  currentStep: number;
  totalSteps: number;
  collectedData: Partial<ProjectData>;
  isComplete: boolean;
  generatedDocuments: any[];
}

interface ConversationStep {
  id: number;
  question: string;
  type: 'multiple_choice' | 'location' | 'text_area' | 'budget_range' | 'date_range' | 'property_status' | 'challenges';
  options?: string[];
  subQuestions?: string[];
  fields: string[];
}

const CONVERSATION_STEPS: ConversationStep[] = [
  {
    id: 1,
    question: "What type of project is this?",
    type: "multiple_choice",
    options: ["Extension", "Loft Conversion", "New Build", "Renovation", "Kitchen", "Bathroom", "Other"],
    fields: ["projectType"]
  },
  {
    id: 2,
    question: "What is the intended use?",
    type: "multiple_choice",
    options: ["Residential", "Rental", "Commercial", "Mixed Use"],
    fields: ["intendedUse"]
  },
  {
    id: 3,
    question: "Where is the project located?",
    type: "location",
    fields: ["location.city", "location.country"]
  },
  {
    id: 4,
    question: "Describe the project in your own words",
    type: "text_area",
    subQuestions: [
      "What size is the project? (e.g., 50 sqm, 2 bedrooms)",
      "What are your main goals?",
      "Are there any known issues or challenges?"
    ],
    fields: ["description", "size", "goals", "knownIssues"]
  },
  {
    id: 5,
    question: "What is your approximate budget range?",
    type: "budget_range",
    fields: ["budgetRange", "budgetMin", "budgetMax"]
  },
  {
    id: 6,
    question: "Do you have preferred start/completion dates?",
    type: "date_range",
    fields: ["preferredStartDate", "preferredCompletionDate"]
  },
  {
    id: 7,
    question: "Is the property in a conservation area, green belt, or a listed building?",
    type: "property_status",
    fields: ["conservationArea", "greenBelt", "listedBuilding"]
  },
  {
    id: 8,
    question: "Any known party wall, access, or planning challenges?",
    type: "challenges",
    fields: ["partyWallIssues", "accessChallenges", "planningChallenges", "additionalChallenges"]
  }
];

export default function EnhancedGuidedProjectPage() {
  const [conversationState, setConversationState] = useState<ConversationState>({
    currentStep: 1,
    totalSteps: 8,
    collectedData: {},
    isComplete: false,
    generatedDocuments: []
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\n**Let's start with some key questions about your project:**\n\n**Question 1 of 8:** What type of project is this?\n\nPlease select from:\n• Extension\n• Loft Conversion\n• New Build\n• Renovation\n• Kitchen\n• Bathroom\n• Other",
      type: "question"
    }
  ]);

  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
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
    if (!message.trim() || isLoading || isGeneratingDocuments) return;

    const userMessage: Message = { 
      role: "user", 
      text: message,
      type: "response"
    };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      // Process the response based on current step
      const step = CONVERSATION_STEPS[conversationState.currentStep - 1];
      const processedData = processStepResponse(step, message);
      
      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        collectedData: { ...prev.collectedData, ...processedData }
      }));

      // Check if step is complete
      if (isStepComplete(step, processedData)) {
        await moveToNextStep();
      } else {
        // Ask for more information
        const followUpMessage = generateFollowUpMessage(step, processedData);
        setMessages(prev => [...prev, followUpMessage]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        role: "ai",
        text: "I apologize, but I encountered an error. Please try again or contact support if the issue persists.",
        type: "response"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processStepResponse = (step: ConversationStep, response: string): Partial<ProjectData> => {
    const data: Partial<ProjectData> = {};
    
    switch (step.type) {
      case 'multiple_choice':
        const selectedOption = step.options?.find(option => 
          response.toLowerCase().includes(option.toLowerCase())
        );
        if (selectedOption) {
          data[step.fields[0] as keyof ProjectData] = selectedOption as any;
        }
        break;
        
      case 'location':
        // Extract city and country from response
        const locationMatch = response.match(/(.+?),\s*(.+)/);
        if (locationMatch) {
          data.location = {
            city: locationMatch[1].trim(),
            country: locationMatch[2].trim()
          };
        }
        break;
        
      case 'text_area':
        // Extract information from structured response
        const lines = response.split('\n').filter(line => line.trim());
        data.description = lines[0] || '';
        
        // Extract size from description
        const sizeMatch = data.description.match(/(\d+)\s*(sqm|sqft|m²|ft²)/i);
        if (sizeMatch) {
          data.size = parseInt(sizeMatch[1]);
        }
        
        // Extract goals and issues
        data.goals = lines.filter(line => line.includes('goal') || line.includes('want')).map(line => line.trim());
        data.knownIssues = lines.filter(line => line.includes('issue') || line.includes('challenge')).map(line => line.trim());
        break;
        
      case 'budget_range':
        // Extract budget information
        const budgetMatch = response.match(/(\d+)[kK]?\s*-\s*(\d+)[kK]?/);
        if (budgetMatch) {
          data.budgetMin = parseInt(budgetMatch[1]) * (budgetMatch[1].includes('k') ? 1000 : 1);
          data.budgetMax = parseInt(budgetMatch[2]) * (budgetMatch[2].includes('k') ? 1000 : 1);
          data.budgetRange = `${data.budgetMin}-${data.budgetMax}`;
        }
        break;
        
      case 'date_range':
        // Extract dates
        const dateMatch = response.match(/(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
          data.preferredStartDate = dateMatch[1];
          data.preferredCompletionDate = dateMatch[2];
        }
        break;
        
      case 'property_status':
        data.conservationArea = response.toLowerCase().includes('conservation');
        data.greenBelt = response.toLowerCase().includes('green belt');
        data.listedBuilding = response.toLowerCase().includes('listed');
        break;
        
      case 'challenges':
        data.partyWallIssues = response.toLowerCase().includes('party wall');
        data.accessChallenges = response.toLowerCase().includes('access');
        data.planningChallenges = response.toLowerCase().includes('planning');
        data.additionalChallenges = response.split(',').map(challenge => challenge.trim());
        break;
    }
    
    return data;
  };

  const isStepComplete = (step: ConversationStep, data: Partial<ProjectData>): boolean => {
    return step.fields.every(field => {
      const fieldValue = getNestedValue(data, field);
      return fieldValue !== undefined && fieldValue !== null && fieldValue !== '';
    });
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const moveToNextStep = async () => {
    const nextStep = conversationState.currentStep + 1;
    
    if (nextStep > CONVERSATION_STEPS.length) {
      // All steps complete, generate documents
      await generateAllDocuments();
    } else {
      // Move to next question
      const step = CONVERSATION_STEPS[nextStep - 1];
      const questionMessage = generateQuestionMessage(step, nextStep);
      setMessages(prev => [...prev, questionMessage]);
      
      setConversationState(prev => ({
        ...prev,
        currentStep: nextStep
      }));
    }
  };

  const generateQuestionMessage = (step: ConversationStep, stepNumber: number): Message => {
    let questionText = `**Question ${stepNumber} of 8:** ${step.question}\n\n`;
    
    switch (step.type) {
      case 'multiple_choice':
        questionText += "Please select from:\n" + step.options?.map(option => `• ${option}`).join('\n');
        break;
      case 'location':
        questionText += "Please provide: City, Country (e.g., London, UK)";
        break;
      case 'text_area':
        questionText += "Please provide:\n" + step.subQuestions?.map(q => `• ${q}`).join('\n');
        break;
      case 'budget_range':
        questionText += "Please provide your budget range (e.g., 50k-100k or 50000-100000)";
        break;
      case 'date_range':
        questionText += "Please provide start and completion dates (YYYY-MM-DD - YYYY-MM-DD)";
        break;
      case 'property_status':
        questionText += "Please indicate if any apply: Conservation Area, Green Belt, Listed Building";
        break;
      case 'challenges':
        questionText += "Please describe any challenges: Party Wall, Access, Planning, or other issues";
        break;
    }
    
    return {
      role: "ai",
      text: questionText,
      type: "question"
    };
  };

  const generateFollowUpMessage = (step: ConversationStep, data: Partial<ProjectData>): Message => {
    const missingFields = step.fields.filter(field => {
      const fieldValue = getNestedValue(data, field);
      return fieldValue === undefined || fieldValue === null || fieldValue === '';
    });
    
    return {
      role: "ai",
      text: `I need a bit more information. Please provide: ${missingFields.join(', ')}`,
      type: "question"
    };
  };

  const generateAllDocuments = async () => {
    setIsGeneratingDocuments(true);
    
    const generatingMessage: Message = {
      role: "ai",
      text: "🎉 **Excellent! All information collected!**\n\nNow I'll generate your comprehensive project documents:\n\n• **Scope of Works** - Detailed project scope\n• **Work Breakdown Structure** - Task breakdown\n• **Project Schedule** - Timeline with Gantt chart\n• **Cost Estimation** - Detailed cost breakdown\n• **Verified Professionals** - Local contractors & architects\n• **Complete Project Pack** - All documents combined\n\n⏳ **Generating documents... This may take a moment.**",
      type: "document"
    };
    setMessages(prev => [...prev, generatingMessage]);

    try {
      // Generate documents in sequence
      const documents = [];
      
      // Generate SOW
      const sowResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'sow'
        })
      });
      
      if (sowResponse.ok) {
        const sowData = await sowResponse.json();
        documents.push({ type: 'SOW', data: sowData });
        
        const sowMessage: Message = {
          role: "ai",
          text: "✅ **Scope of Works generated!**\n\nYour detailed project scope is ready with local authority notes and risk flags.\n\n📄 **Download SOW:** [Download PDF] [Download Word]",
          type: "download",
          data: sowData
        };
        setMessages(prev => [...prev, sowMessage]);
      }

      // Generate WBS
      const wbsResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'wbs'
        })
      });
      
      if (wbsResponse.ok) {
        const wbsData = await wbsResponse.json();
        documents.push({ type: 'WBS', data: wbsData });
        
        const wbsMessage: Message = {
          role: "ai",
          text: "✅ **Work Breakdown Structure generated!**\n\nYour multi-level task breakdown with RACI assignments is ready.\n\n📄 **Download WBS:** [Download PDF] [Download Excel]",
          type: "download",
          data: wbsData
        };
        setMessages(prev => [...prev, wbsMessage]);
      }

      // Generate Schedule
      const scheduleResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'schedule'
        })
      });
      
      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        documents.push({ type: 'Schedule', data: scheduleData });
        
        const scheduleMessage: Message = {
          role: "ai",
          text: "✅ **Project Schedule generated!**\n\nYour timeline with Gantt chart and dependencies is ready.\n\n📄 **Download Schedule:** [Download PDF] [Download Excel]",
          type: "download",
          data: scheduleData
        };
        setMessages(prev => [...prev, scheduleMessage]);
      }

      // Generate Cost Estimate
      const costResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'cost_estimate'
        })
      });
      
      if (costResponse.ok) {
        const costData = await costResponse.json();
        documents.push({ type: 'Cost Estimate', data: costData });
        
        const costMessage: Message = {
          role: "ai",
          text: "✅ **Cost Estimation generated!**\n\nYour detailed cost breakdown with local rates and finish tiers is ready.\n\n📄 **Download Cost Estimate:** [Download PDF] [Download Excel]",
          type: "download",
          data: costData
        };
        setMessages(prev => [...prev, costMessage]);
      }

      // Generate Professional List
      const professionalsResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'professionals'
        })
      });
      
      if (professionalsResponse.ok) {
        const professionalsData = await professionalsResponse.json();
        documents.push({ type: 'Professionals', data: professionalsData });
        
        const professionalsMessage: Message = {
          role: "ai",
          text: "✅ **Verified Professionals generated!**\n\nYour list of local contractors, architects, and consultants is ready.\n\n📄 **Download Professionals:** [Download PDF] [Download Excel]",
          type: "download",
          data: professionalsData
        };
        setMessages(prev => [...prev, professionalsMessage]);
      }

      // Generate Project Pack
      const projectPackResponse = await fetch('/api/documents/generate-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectData: conversationState.collectedData,
          documentType: 'project_pack'
        })
      });
      
      if (projectPackResponse.ok) {
        const projectPackData = await projectPackResponse.json();
        
        const projectPackMessage: Message = {
          role: "ai",
          text: "🎉 **Complete Project Pack generated!**\n\nYour comprehensive project package includes:\n• Cover Page\n• Table of Contents\n• Scope of Works\n• Work Breakdown Structure\n• Project Schedule\n• Cost Estimate\n• Verified Professionals\n\n📦 **Download Complete Pack:** [Download ZIP] [Download PDF]",
          type: "download",
          data: projectPackData
        };
        setMessages(prev => [...prev, projectPackMessage]);
      }

      // Update conversation state
      setConversationState(prev => ({
        ...prev,
        isComplete: true,
        generatedDocuments: documents
      }));

      // Final message
      const finalMessage: Message = {
        role: "ai",
        text: "🚀 **Project Planning Complete!**\n\nYour comprehensive project plan is ready! You can now:\n\n• **Create Project in Dashboard** - Start managing your project\n• **Download All Documents** - Save your project pack\n• **Contact Professionals** - Reach out to verified contractors\n• **Share with Team** - Collaborate with stakeholders\n\n**Ready to create your project in the dashboard?**",
        type: "document"
      };
      setMessages(prev => [...prev, finalMessage]);

    } catch (error) {
      console.error('Error generating documents:', error);
      const errorMessage: Message = {
        role: "ai",
        text: "❌ **Error generating documents**\n\nI encountered an error while generating your project documents. Please try again or contact support if the issue persists.",
        type: "response"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingDocuments(false);
    }
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Guided Project Creation</h1>
              <p className="text-gray-600">Step {conversationState.currentStep} of {conversationState.totalSteps}</p>
            </div>
            <div className="w-64 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(conversationState.currentStep / conversationState.totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.type === 'question'
                      ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900'
                      : message.type === 'document'
                      ? 'bg-green-50 border-l-4 border-green-600 text-green-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  {message.type === 'download' && message.data && (
                    <div className="mt-2 space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Download PDF
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                        Download Word
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        {!conversationState.isComplete && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex space-x-4">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || isGeneratingDocuments}
              />
              <button
                onClick={() => handleSend(currentInput)}
                disabled={!currentInput.trim() || isLoading || isGeneratingDocuments}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(isLoading || isGeneratingDocuments) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">
                {isGeneratingDocuments ? 'Generating documents...' : 'Processing...'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
