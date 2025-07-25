"use client";
import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface FloatingChatProps {
  onSend: (message: string) => void;
  messages: Message[];
  placeholder?: string;
}

export default function FloatingChat({ onSend, messages, placeholder = "Ask Brixem..." }: FloatingChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle clicks outside the chat to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isExpanded && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSend(inputValue.trim());
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      {/* Collapsed State - Dark ChatGPT Style with Shrink Animation */}
      {!isExpanded && (
        <div 
          className={`bg-gray-800/90 backdrop-blur-md rounded-full flex items-center gap-3 shadow-lg border border-gray-700/50 cursor-pointer touch-manipulation transition-all duration-300 hover:bg-gray-800/95 ${
            isHovered ? 'min-w-[280px] max-w-[400px] px-4 py-3' : 'min-w-[200px] max-w-[280px] px-3 py-2.5'
          }`}
          onClick={() => setIsExpanded(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex-1">
            <span className="text-gray-400 text-sm transition-all duration-300">
              Ask Brixem
            </span>
          </div>
          <div className="w-8 h-8 bg-gray-700/80 rounded-full flex items-center justify-center hover:bg-gray-600/90 transition-colors duration-200">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      )}

      {/* Expanded State - Glassy Effect */}
      {isExpanded && (
        <div 
          ref={chatRef} 
          className="bg-gray-900/85 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 w-full sm:w-[450px] h-[600px] sm:h-[500px] animate-in slide-in-from-bottom-2 duration-300"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50 bg-gray-900/90 backdrop-blur-sm rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg">Brixem Assistant</h3>
                <p className="text-xs text-gray-400">Ask me about your project</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white transition-colors duration-200 touch-manipulation p-2 rounded-lg hover:bg-gray-800/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 h-[400px] sm:h-[350px] scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/30">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-300 mb-2">Welcome to Brixem Assistant</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">I can help you manage tasks, track progress, and answer questions about your project.</p>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}
                  >
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] break-words shadow-sm backdrop-blur-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-br-md border border-[#23c6e6]/20'
                          : 'bg-gray-800/70 text-gray-100 rounded-bl-md border border-gray-700/50'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700/50 bg-gray-900/90 backdrop-blur-sm rounded-b-2xl">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 text-sm bg-gray-800/70 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30 focus:border-[#23c6e6] text-white placeholder-gray-400 transition-all duration-200"
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
                disabled={!inputValue.trim()}
                className="px-6 py-3 bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-xl text-sm font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg hover:shadow-xl backdrop-blur-sm border border-[#23c6e6]/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 