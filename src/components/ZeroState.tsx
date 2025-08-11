'use client';

import { useState } from 'react';
import PrimaryButton from './PrimaryButton';

interface ZeroStateProps {
  onCreateProject: () => void;
  onProjectCreated: (projectData: ProjectData) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectData {
  name: string;
  location: string;
  size_sqft?: number;
  description: string;
  type: string;
}

export function ZeroState({ onCreateProject, onProjectCreated }: ZeroStateProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your Brixem AI assistant. I'll help you create your first project and generate a professional Scope of Work document. Let's start with the basics - what would you like to call your project?",
      timestamp: new Date()
    }
  ]);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [projectData, setProjectData] = useState<ProjectData>({
    name: '',
    location: '',
    size_sqft: undefined,
    description: '',
    type: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const steps = [
    { question: "What would you like to call your project?", field: 'name' },
    { question: "Where is this project located? (City, State)", field: 'location' },
    { question: "What type of project is this? (e.g., kitchen remodel, bathroom renovation, deck addition)", field: 'type' },
    { question: "What's the approximate size in square feet?", field: 'size_sqft' },
    { question: "Describe your project in detail. What are your goals and requirements?", field: 'description' }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Update project data based on current step
    const field = steps[currentStep - 1].field as keyof ProjectData;
    const value = field === 'size_sqft' ? parseInt(inputValue) || undefined : inputValue;
    
    setProjectData(prev => ({
      ...prev,
      [field]: value
    }));

    // Move to next step or complete
    if (currentStep < 5) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: steps[nextStep - 1].question,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } else {
      // All steps complete, generate project and documents
      setIsGenerating(true);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Perfect! I have all the information I need. Let me create your project and generate your Scope of Work document...",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Simulate AI processing
      setTimeout(() => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: "🎉 Project created successfully! I've generated your Scope of Work document. You can now view and download it, or continue to add more details to your project.",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsGenerating(false);
        
        // Call the parent function to create the project with collected data
        onProjectCreated(projectData);
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900">Brixem AI Assistant</h2>
        <p className="text-sm text-gray-600">Let me help you build your project step by step</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Generating your project and documents...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Project Setup Progress</span>
          <span className="text-sm font-medium text-blue-600">{currentStep}/5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Chat Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentStep <= 5 ? `Answer: ${steps[currentStep - 1].question}` : "Type your message..."}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isGenerating}
          />
          <PrimaryButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="px-6"
          >
            {isGenerating ? 'Processing...' : 'Send'}
          </PrimaryButton>
        </div>
        
        {currentStep <= 5 && (
          <p className="text-xs text-gray-500 mt-2">
            Step {currentStep} of 5: {steps[currentStep - 1].question}
          </p>
        )}
      </div>
    </div>
  );
}
