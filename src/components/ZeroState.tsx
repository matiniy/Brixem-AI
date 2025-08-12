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
        
        // Call the parent function with the updated project data
        onProjectCreated(updatedProjectData);
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
    <div className="flex-1 flex flex-col h-full bg-gray-900/95 backdrop-blur-xl">
      {/* Chat Header */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Brixem AI Assistant</h2>
            <p className="text-sm text-gray-400">Let me help you build your project step by step</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
          >
            <div
              className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] break-words shadow-sm backdrop-blur-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-br-md border border-[#23c6e6]/20'
                  : 'bg-gray-800/70 text-gray-100 rounded-bl-md border border-gray-700/50'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="px-4 py-3 rounded-2xl text-sm bg-gray-800/70 text-gray-100 rounded-bl-md border border-gray-700/50 shadow-sm backdrop-blur-sm">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-400">Creating your project...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 px-6 py-4 rounded-b-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Project Setup Progress</span>
          <span className="text-sm font-semibold text-[#23c6e6]">{currentStep}/5</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
        {currentStep <= 5 && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Step {currentStep}: {steps[currentStep - 1].question}
          </p>
        )}
      </div>

      {/* Chat Input */}
      <div className="bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 px-6 py-4 rounded-b-2xl">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={currentStep <= 5 ? `Answer: ${steps[currentStep - 1].question}` : "Type your message..."}
              className="w-full px-4 py-3 text-sm bg-gray-800/70 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30 focus:border-[#23c6e6] text-white placeholder-gray-400 transition-all duration-200"
              disabled={isGenerating}
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => setInputValue("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isGenerating}
            className="px-6 py-3 bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg hover:shadow-xl backdrop-blur-sm border border-[#23c6e6]/20"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send</span>
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
