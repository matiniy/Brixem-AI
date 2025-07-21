"use client";
import React, { useState } from "react";
import ChatPanel from "./ChatPanel";

interface ChatModalProps {
  open: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function ChatModal({ open, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hi! I'm your AI construction assistant. I can help you with project planning, contractor recommendations, cost estimates, and renovation advice. What would you like to know about your project?"
    }
  ]);

  const handleSend = (text: string) => {
    // Add user message
    const userMessage: Message = { role: "user", text };
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on your project details, I'd recommend starting with a detailed site inspection. This will help us create an accurate timeline and budget estimate.",
        "For your budget range, I can suggest several qualified contractors in your area. Would you like me to send you their contact information?",
        "That's a great question! The typical timeline for that type of renovation is 6-8 weeks, but it can vary based on the scope and contractor availability.",
        "I can help you create a detailed project timeline with milestones. This will help keep everything on track and within budget.",
        "Let me check our database for contractors who specialize in that type of work and have availability in your timeline."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      const aiMessage: Message = { role: "ai", text: randomResponse };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Construction Assistant</h3>
              <p className="text-sm text-gray-600">Ask me anything about your renovation project</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Chat Panel */}
        <div className="p-6 h-[calc(600px-80px)]">
          <ChatPanel 
            messages={messages}
            onSend={handleSend}
          />
        </div>
      </div>
    </div>
  );
} 