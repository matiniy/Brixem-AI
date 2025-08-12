'use client';

import { useState, useRef, useEffect } from 'react';

interface ZeroStateProps {
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

export function ZeroState({ onProjectCreated }: ZeroStateProps) {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const steps = [
    { question: "What would you like to call your project?", field: 'name' },
    { question: "Where is this project located? (City, State)", field: 'location' },
    { question: "What type of project is this? (e.g., kitchen remodel, bathroom renovation, deck addition)", field: 'type' },
    { question: "What's the approximate size in square feet?", field: 'size_sqft' },
    { question: "Describe your project in detail. What are your goals and requirements?", field: 'description' }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    
    const updatedProjectData = {
      ...projectData,
      [field]: value
    };
    
    setProjectData(updatedProjectData);

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
          content: "🎉 Project created successfully! I've generated your Scope of Work document. Redirecting you to your project dashboard...",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, completionMessage]);
        setIsGenerating(false);
        
        // Add debugging
        console.log('Calling onProjectCreated with data:', updatedProjectData);
        
        // Call the parent function with the updated project data
        try {
          onProjectCreated(updatedProjectData);
          console.log('onProjectCreated called successfully');
          
          // Add a fallback redirect after a longer delay
          setTimeout(() => {
            console.log('Fallback redirect triggered');
            // Force redirect to dashboard after 5 seconds if parent doesn't handle it
            window.location.href = '/dashboard/homeowner';
          }, 5000);
        } catch (error) {
          console.error('Error calling onProjectCreated:', error);
          // If there's an error, redirect anyway
          setTimeout(() => {
            window.location.href = '/dashboard/homeowner';
          }, 2000);
        }
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
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Brixem AI Assistant</h2>
            <p className="text-sm text-gray-600">Let me help you build your project step by step</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-white font-bold text-xs">B</span>
              </div>
            )}
            
            <div
              className={`max-w-2xl px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white ml-auto'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 ml-3">
                <span className="text-gray-600 font-medium text-xs">U</span>
              </div>
            )}
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0 mr-3">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <div className="bg-white text-gray-900 px-4 py-3 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-600">Creating your project...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Project Setup Progress</span>
          <span className="text-sm font-semibold text-blue-600">{currentStep}/5</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
        {currentStep <= 5 && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Step {currentStep}: {steps[currentStep - 1].question}
          </p>
        )}
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
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            disabled={isGenerating}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Processing...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
