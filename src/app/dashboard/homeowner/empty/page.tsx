"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { sendChatMessage } from "@/lib/ai";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ProjectData {
  projectType: string;
  location: string;
  budget: string;
  timeline: string;
  description: string;
  scope: string;
  requirements: string;
}

export default function EmptyDashboard() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm here to help you create your first project and generate a comprehensive Plan of Works document. Let's start by understanding your project better. What type of renovation or construction project are you planning?"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData>({
    projectType: "",
    location: "",
    budget: "",
    timeline: "",
    description: "",
    scope: "",
    requirements: ""
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [planOfWorks, setPlanOfWorks] = useState<string>("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const setupQuestions = [
    {
      question: "What type of renovation or construction project are you planning?",
      key: "projectType",
      examples: "e.g., Kitchen renovation, Bathroom remodel, Living room update, Home office, Basement finishing, etc."
    },
    {
      question: "Where is your project located? (City, State)",
      key: "location",
      examples: "e.g., New York, NY or Los Angeles, CA"
    },
    {
      question: "What's your budget range for this project?",
      key: "budget",
      examples: "e.g., $10,000 - $25,000 or $50,000+"
    },
    {
      question: "What's your ideal timeline for completion?",
      key: "timeline",
      examples: "e.g., 2-3 months, 6-8 weeks, ASAP"
    },
    {
      question: "Can you describe your project in detail? What are you looking to achieve?",
      key: "description",
      examples: "e.g., Complete kitchen renovation with new cabinets, countertops, and modern appliances"
    },
    {
      question: "What specific areas or rooms are involved in your project?",
      key: "scope",
      examples: "e.g., Kitchen and dining area, Master bathroom and closet, etc."
    },
    {
      question: "Any specific requirements or preferences? (materials, style, features)",
      key: "requirements",
      examples: "e.g., Modern style, eco-friendly materials, smart home features, etc."
    }
  ];

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      // If we're in the setup phase, handle the structured questions
      if (currentStep < setupQuestions.length) {
        const currentQuestion = setupQuestions[currentStep];
        const updatedProjectData = { ...projectData };
        updatedProjectData[currentQuestion.key as keyof ProjectData] = message;
        setProjectData(updatedProjectData);

        // Move to next question or finish setup
        if (currentStep + 1 < setupQuestions.length) {
          const nextQuestion = setupQuestions[currentStep + 1];
          const aiResponse: Message = {
            role: "ai",
            text: `${nextQuestion.question}\n\n${nextQuestion.examples}`
          };
          setMessages(prev => [...prev, aiResponse]);
          setCurrentStep(currentStep + 1);
        } else {
          // All questions answered, generate plan
          const aiResponse: Message = {
            role: "ai",
            text: "Perfect! I have all the information I need. Let me generate a comprehensive Plan of Works document for your project. This will include detailed scope, timeline, budget breakdown, and next steps. Generating your plan now..."
          };
          setMessages(prev => [...prev, aiResponse]);
          
          // Generate the plan
          await generatePlanOfWorks(updatedProjectData);
        }
      } else {
        // Handle general chat after setup
        const response = await sendChatMessage(message);
        const aiResponse: Message = { role: "ai", text: response };
        setMessages(prev => [...prev, aiResponse]);
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

  const generatePlanOfWorks = async (data: ProjectData) => {
    setIsGeneratingPlan(true);
    
    try {
      const prompt = `Generate a comprehensive Plan of Works document for a ${data.projectType} project with the following details:

Project Type: ${data.projectType}
Location: ${data.location}
Budget: ${data.budget}
Timeline: ${data.timeline}
Description: ${data.description}
Scope: ${data.scope}
Requirements: ${data.requirements}

Please create a detailed Plan of Works that includes:
1. Project Overview and Objectives
2. Detailed Scope of Work
3. Timeline and Milestones
4. Budget Breakdown
5. Required Permits and Approvals
6. Contractor Requirements
7. Risk Assessment
8. Next Steps and Recommendations

Format it professionally with clear sections and actionable items.`;

      const plan = await sendChatMessage(prompt);
      setPlanOfWorks(plan);
      
      const successMessage: Message = {
        role: "ai",
        text: `🎉 Your Plan of Works document has been generated! Here's your comprehensive project plan:\n\n${plan}\n\nWould you like me to help you with the next steps, such as finding contractors or creating a detailed project timeline?`
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error("Error generating plan:", error);
      const errorMessage: Message = {
        role: "ai",
        text: "I apologize, but I encountered an error while generating your Plan of Works. Please try again or contact support."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGeneratingPlan(false);
    }
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
              <h1 className="text-xl font-bold text-gray-900">Brixem Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/homeowner')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                View All Projects
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Welcome Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your First Project!</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Let&apos;s create your first project and generate a comprehensive Plan of Works document. 
                  I&apos;ll guide you through the process step by step.
                </p>
              </div>

              {/* Progress Indicator */}
              {currentStep < setupQuestions.length && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Step {currentStep + 1} of {setupQuestions.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentStep + 1) / setupQuestions.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / setupQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Current Question Display */}
              {currentStep < setupQuestions.length && (
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {setupQuestions[currentStep].question}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {setupQuestions[currentStep].examples}
                  </p>
                </div>
              )}

              {/* Plan of Works Display */}
              {planOfWorks && (
                <div className="bg-green-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan of Works</h3>
                  <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                      {planOfWorks}
                    </pre>
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Download PDF
                    </button>
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                      Share
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                    <p className="text-xs text-gray-500">Ready to help with your project</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-lg ${
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
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                {isGeneratingPlan && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        <span className="text-sm">Generating your Plan of Works...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={currentStep < setupQuestions.length ? 
                      `Answer: ${setupQuestions[currentStep].question}` : 
                      "Ask me anything about your project..."
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading || isGeneratingPlan}
                  />
                  <button
                    onClick={() => handleSend(currentInput)}
                    disabled={!currentInput.trim() || isLoading || isGeneratingPlan}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 