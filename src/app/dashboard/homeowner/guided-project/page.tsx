'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function GuidedProjectPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\nLet's start by gathering some key information about your project:\n\nWhat type of project is this?\n• Extension (rear, side, or wrap-around)\n• Loft conversion\n• New build\n• Renovation/refurbishment\n• Commercial development\n• Other (please specify)\n\nPlease describe your project type and I'll guide you through the next steps!"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectPhase, setProjectPhase] = useState<'initial' | 'scope' | 'wbs' | 'schedule' | 'cost' | 'complete'>('initial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);

  const initialQuestions = [
    {
      question: "What type of project is this?",
      options: ["Extension (rear, side, or wrap-around)", "Loft conversion", "New build", "Renovation/refurbishment", "Commercial development", "Other (please specify)"]
    },
    {
      question: "Where is the project located?",
      options: ["London", "Other UK location", "International"]
    },
    {
      question: "What's the approximate area/size?",
      options: ["Under 20m²", "20-50m²", "50-100m²", "100-200m²", "Over 200m²"]
    },
    {
      question: "What's your budget range?",
      options: ["Under £50k", "£50k-£100k", "£100k-£250k", "£250k-£500k", "Over £500k"]
    },
    {
      question: "What's your preferred finish level?",
      options: ["Basic (cost-effective)", "Standard (good quality)", "Premium (high-end)"]
    }
  ];

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      if (projectPhase === 'initial') {
        await handleInitialPhase(message);
      } else if (projectPhase === 'scope') {
        await handleScopePhase(message);
      } else if (projectPhase === 'wbs') {
        await handleWBSPhase(message);
      } else if (projectPhase === 'schedule') {
        await handleSchedulePhase(message);
      } else if (projectPhase === 'cost') {
        await handleCostPhase(message);
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

  const handleInitialPhase = async (message: string) => {
    const updatedProjectData = { ...projectData };
    
    if (currentStep < initialQuestions.length) {
      const currentQ = initialQuestions[currentStep];
      updatedProjectData[currentQ.question] = message;
      setProjectData(updatedProjectData);
      setCurrentStep(currentStep + 1);

      if (currentStep + 1 < initialQuestions.length) {
        const nextQ = initialQuestions[currentStep + 1];
        let nextMessage = `Great! Thanks for that information.\n\n${nextQ.question}`;
        
        if (nextQ.options.length > 0) {
          nextMessage += `\n\nPlease choose from:\n${nextQ.options.map((opt) => `• ${opt}`).join('\n')}`;
        }
        
        const response: Message = { role: "ai", text: nextMessage };
        setMessages(prev => [...prev, response]);
      } else {
        // All questions answered, move to scope generation
        setProjectPhase('scope');
        await generateScopeOfWorks(updatedProjectData);
      }
    }
  };

  const generateScopeOfWorks = async (data: Record<string, string>) => {
    setIsGenerating(true);
    
    const scopeMessage: Message = {
      role: "ai",
      text: `🎯 SCOPE OF WORKS GENERATED\n\nBased on your project details, here's your comprehensive Scope of Works:\n\nProject: ${data.projectType || 'Not specified'}\nLocation: ${data.location || 'Not specified'}\nBudget: ${data.budget || 'Not specified'}\n\nKey Components:\n• Demolition and site preparation\n• Foundation works\n• Structural elements\n• MEP (Mechanical, Electrical, Plumbing)\n• Internal finishes\n• External works\n\nRequired Consultants:\n• Architect\n• Structural Engineer\n• Party Wall Surveyor (if applicable)\n• Planning Consultant\n\nPlanning Requirements:\n• ${data.constraints?.includes('Conservation') ? 'Full planning permission required' : 'Permitted development may apply'}\n• Building regulations approval needed\n• Party wall agreements (if applicable)\n\nRisk Flags:\n• ${data.challenges?.includes('Party wall') ? 'Party wall issues require specialist attention' : 'No major access issues identified'}\n• ${data.constraints?.includes('Listed') ? 'Listed building consent required' : 'Standard planning process'}\n\n✅ Your Scope of Works is ready!\n\nWould you like to:\n1. Download as PDF\n2. Download as Word document\n3. Proceed to Work Breakdown Structure\n4. Revise details\n\nPlease choose an option (1-4):`
    };
    
    setMessages(prev => [...prev, scopeMessage]);
    setIsGenerating(false);
  };

  const handleScopePhase = async (message: string) => {
    if (message.includes('1') || message.toLowerCase().includes('pdf')) {
      const response: Message = {
        role: "ai",
        text: "📄 Generating PDF...\n\nYour Scope of Works PDF is being generated and will be available in your Documents section shortly.\n\nWould you like to proceed to the Work Breakdown Structure (WBS)? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('2') || message.toLowerCase().includes('word')) {
      const response: Message = {
        role: "ai",
        text: "📄 Generating Word Document...\n\nYour Scope of Works Word document is being generated and will be available in your Documents section shortly.\n\nWould you like to proceed to the Work Breakdown Structure (WBS)? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('3') || message.toLowerCase().includes('proceed') || message.toLowerCase().includes('yes')) {
      setProjectPhase('wbs');
      await generateWorkBreakdownStructure();
    } else if (message.includes('4') || message.toLowerCase().includes('revise')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the details. Which aspect would you like to change?\n\n1. Project type\n2. Location\n3. Budget\n4. Finish level\n5. Start over"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateWorkBreakdownStructure = async () => {
    setIsGenerating(true);
    
    const wbsMessage: Message = {
      role: "ai",
      text: `🔨 WORK BREAKDOWN STRUCTURE (WBS)\n\nHere's your detailed task breakdown:\n\nLevel 1 - Project Phases:\n1. Pre-Construction (Client)\n2. Design & Planning (Architect)\n3. Construction (Contractor)\n4. Completion (Client)\n\nLevel 2 - Key Tasks:\n\nPre-Construction:\n• Site survey and measurements (Architect)\n• Planning application submission (Architect)\n• Party wall agreements (Party Wall Surveyor)\n• Building regulations approval (Architect)\n\nDesign & Planning:\n• Architectural drawings (Architect)\n• Structural calculations (Structural Engineer)\n• MEP design (MEP Consultant)\n• Tender documentation (Architect)\n\nConstruction:\n• Site setup and demolition (Contractor)\n• Foundation works (Contractor) - *Depends on: Planning approval*\n• Structural works (Contractor) - *Depends on: Foundation completion*\n• MEP installation (Contractor) - *Depends on: Structural completion*\n• Finishes (Contractor) - *Depends on: MEP completion*\n\nCompletion:\n• Snagging and handover (Contractor)\n• Final inspections (Building Control)\n• Project closeout (Client)\n\n✅ Your Work Breakdown Structure is complete!\n\nWould you like to:\n1. Download as Excel spreadsheet\n2. Proceed to Project Schedule\n3. Revise WBS details\n\nPlease choose an option (1-3):`
    };
    
    setMessages(prev => [...prev, wbsMessage]);
    setIsGenerating(false);
  };

  const handleWBSPhase = async (message: string) => {
    if (message.includes('1') || message.toLowerCase().includes('excel')) {
      const response: Message = {
        role: "ai",
        text: "📊 Generating Excel Spreadsheet...\n\nYour Work Breakdown Structure Excel file is being generated and will be available in your Documents section shortly.\n\nWould you like to proceed to the Project Schedule? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('2') || message.toLowerCase().includes('proceed') || message.toLowerCase().includes('yes')) {
      setProjectPhase('schedule');
      await generateProjectSchedule();
    } else if (message.includes('3') || message.toLowerCase().includes('revise')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the WBS. Which phase would you like to modify?\n\n1. Pre-Construction\n2. Design & Planning\n3. Construction\n4. Completion\n5. Start over"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateProjectSchedule = async () => {
    setIsGenerating(true);
    
    const startDate = new Date();
    const scheduleMessage: Message = {
      role: "ai",
      text: `📅 PROJECT SCHEDULE GENERATED\n\nProject Timeline: ${startDate.toLocaleDateString()} - ${new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\nKey Milestones:\n\nPhase 1 - Pre-Construction (4 weeks):\n• Week 1-2: Site survey and planning application\n• Week 3-4: Party wall agreements and building regulations\n\nPhase 2 - Design & Planning (6 weeks):\n• Week 5-8: Architectural and structural design\n• Week 9-10: MEP design and tender documentation\n\nPhase 3 - Construction (20 weeks):\n• Week 11-12: Site setup and demolition\n• Week 13-16: Foundation works\n• Week 17-20: Structural works\n• Week 21-24: MEP installation\n• Week 25-30: Finishes and completion\n\nPhase 4 - Completion (2 weeks):\n• Week 31-32: Snagging and handover\n\nCritical Path: Planning approval → Foundation works → Structural works → MEP → Finishes\n\n✅ Your project schedule is ready!\n\nWould you like to:\n1. Download as Gantt chart (Excel)\n2. Download as PDF timeline\n3. Proceed to Cost Estimation\n4. Revise schedule\n\nPlease choose an option (1-4):`
    };
    
    setMessages(prev => [...prev, scheduleMessage]);
    setIsGenerating(false);
  };

  const handleSchedulePhase = async (message: string) => {
    if (message.includes('1') || message.toLowerCase().includes('gantt')) {
      const response: Message = {
        role: "ai",
        text: "📊 Generating Gantt Chart...\n\nYour project Gantt chart is being generated and will be available in your Documents section shortly.\n\nWould you like to proceed to Cost Estimation? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('2') || message.toLowerCase().includes('pdf')) {
      const response: Message = {
        role: "ai",
        text: "📄 Generating PDF Timeline...\n\nYour project timeline PDF is being generated and will be available in your Documents section shortly.\n\nWould you like to proceed to Cost Estimation? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('3') || message.toLowerCase().includes('proceed') || message.toLowerCase().includes('yes')) {
      setProjectPhase('cost');
      await generateCostEstimation();
    } else if (message.includes('4') || message.toLowerCase().includes('revise')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the schedule. Which phase would you like to modify?\n\n1. Pre-Construction timeline\n2. Design & Planning timeline\n3. Construction timeline\n4. Completion timeline\n5. Start over"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateCostEstimation = async () => {
    setIsGenerating(true);
    
    const costMessage: Message = {
      role: "ai",
      text: `💰 COST ESTIMATION GENERATED\n\nProject: ${projectData.projectType || 'Extension'}\nLocation: ${projectData.location || 'UK'}\nEstimated Total: £${getCostEstimate(projectData.budget).toLocaleString()}\n\nItemized Breakdown:\n\nConstruction Costs:\n• Demolition & site prep: £8,000 - £12,000\n• Foundation works: £15,000 - £25,000\n• Structural works: £25,000 - £40,000\n• MEP installation: £12,000 - £18,000\n• Internal finishes: £20,000 - £35,000\n• External works: £5,000 - £10,000\n\nProfessional Fees:\n• Architect: £8,000 - £15,000\n• Structural Engineer: £3,000 - £6,000\n• Party Wall Surveyor: £1,500 - £3,000\n• Planning Consultant: £2,000 - £4,000\n\nAdditional Costs:\n• Building regulations: £1,500 - £3,000\n• Planning fees: £500 - £1,000\n• Party wall agreements: £1,000 - £2,000\n• Contingency (10%): £${Math.round(getCostEstimate(projectData.budget) * 0.1).toLocaleString()}\n\nFinish Tiers:\n• Basic: -20% from estimate\n• Standard: Current estimate\n• Premium: +30% from estimate\n\n✅ Your cost estimation is complete!\n\nWould you like to:\n1. Download detailed Excel spreadsheet\n2. Download PDF summary\n3. Create project and finish setup\n4. Revise cost assumptions\n\nPlease choose an option (1-4):`
    };
    
    setMessages(prev => [...prev, costMessage]);
    setIsGenerating(false);
  };

  const handleCostPhase = async (message: string) => {
    if (message.includes('1') || message.toLowerCase().includes('excel')) {
      const response: Message = {
        role: "ai",
        text: "📊 Generating Detailed Excel Spreadsheet...\n\nYour comprehensive cost breakdown Excel file is being generated and will be available in your Documents section shortly.\n\nWould you like to create your project and finish setup? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('2') || message.toLowerCase().includes('pdf')) {
      const response: Message = {
        role: "ai",
        text: "📄 Generating PDF Summary...\n\nYour cost estimate PDF summary is being generated and will be available in your Documents section shortly.\n\nWould you like to create your project and finish setup? (yes/no)"
      };
      setMessages(prev => [...prev, response]);
    } else if (message.includes('3') || message.toLowerCase().includes('create') || message.toLowerCase().includes('yes')) {
      setProjectPhase('complete');
      await completeProjectSetup();
    } else if (message.includes('4') || message.toLowerCase().includes('revise')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the cost assumptions. Which aspect would you like to modify?\n\n1. Budget range\n2. Finish level\n3. Project scope\n4. Location factors\n5. Start over"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const completeProjectSetup = async () => {
    const completionMessage: Message = {
      role: "ai",
      text: `🎉 PROJECT CREATION COMPLETE!\n\nYour comprehensive project plan has been generated and saved:\n\n✅ Scope of Works\n✅ Work Breakdown Structure\n✅ Project Schedule\n✅ Cost Estimation\n\nAll documents are available in your Documents section.\n\nRedirecting you to your dashboard in 3 seconds...`
    };

    setMessages(prev => [...prev, completionMessage]);
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = '/dashboard/homeowner';
    }, 3000);
  };

  const getCostEstimate = (budget: string) => {
    const budgetRanges: Record<string, number> = {
      'Under £50k': 45000,
      '£50k-£100k': 75000,
      '£100k-£250k': 175000,
      '£250k-£500k': 375000,
      'Over £500k': 600000
    };
    return budgetRanges[budget] || 100000;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(currentInput);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Guided Project Creation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Phase: {projectPhase.charAt(0).toUpperCase() + projectPhase.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">AI Construction Assistant</h2>
                <p className="text-sm text-gray-500">
                  Guiding you through comprehensive project creation
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / initialQuestions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Generating...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend(currentInput)}
                disabled={!currentInput.trim() || isLoading}
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