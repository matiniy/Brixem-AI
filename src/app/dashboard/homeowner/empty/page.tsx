"use client";
import React, { useState } from "react";
import { sendChatMessage } from "@/lib/ai";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function EmptyDashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\n**Ready to start your project?**\n\nI'll walk you through:\n• Initial project assessment\n• Scope of Works generation\n• Work Breakdown Structure\n• Project Schedule with Gantt charts\n• Detailed Cost Estimation\n\nClick 'Start Guided Project' to begin the comprehensive project creation process!"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      if (message.toLowerCase().includes('start guided project') || message.toLowerCase().includes('start project')) {
        // Redirect to guided project page
        window.location.href = '/dashboard/homeowner/guided-project';
      } else {
        // Regular chat
        const response = await sendChatMessage([{ role: "user", text: message }]);
        const aiResponse: Message = { role: "ai", text: response.message };
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
              <span className="text-sm text-gray-500">0 projects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width Chat */}
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
                  Ready to help you create your first project
                </p>
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
          </div>

          {/* Quick Action Button */}
          <div className="p-6 border-t border-gray-200">
            <div className="text-center mb-4">
              <button
                onClick={() => window.location.href = '/dashboard/homeowner/guided-project'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-semibold text-lg">Start Guided Project</span>
                </div>
                <p className="text-sm opacity-90 mt-1">Comprehensive project planning with AI</p>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Or ask me anything about your construction project..."
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