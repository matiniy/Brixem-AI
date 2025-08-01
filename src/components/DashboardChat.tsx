"use client";

import React, { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface DashboardChatProps {
  onSend: (message: string) => void;
  messages: Message[];
  placeholder?: string;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

export default function DashboardChat({
  onSend,
  messages,
  placeholder = "Ask about your project tasks...",
  isExpanded = false,
  onToggleExpanded
}: DashboardChatProps) {
  const [inputValue, setInputValue] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync messages
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Detect task creation in messages
  function detectTask(text: string): string | null {
    const taskKeywords = ["create task", "add task", "new task", "make task"];
    const lowerText = text.toLowerCase();
    
    for (const keyword of taskKeywords) {
      if (lowerText.includes(keyword)) {
        // Extract task description after the keyword
        const index = lowerText.indexOf(keyword);
        const afterKeyword = text.slice(index + keyword.length).trim();
        if (afterKeyword) {
          return afterKeyword;
        }
      }
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const message = inputValue.trim();
    setInputValue("");

    // Check if this is a task creation request
    const detectedTask = detectTask(message);
    if (detectedTask) {
      setPendingTask(detectedTask);
      setLocalMessages(prev => [
        ...prev,
        { role: "user", text: message },
        { role: "ai", text: `Would you like me to create a task: "${detectedTask}"?`, type: "task-confirm", taskText: detectedTask }
      ]);
    } else {
      onSend(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChatClick = () => {
    if (!isExpanded) {
      onToggleExpanded?.(true);
    }
  };

  const handleTaskConfirm = (yes: boolean) => {
    if (yes && pendingTask) {
      onSend(`Create task: ${pendingTask}`);
      setLocalMessages(prev => [
        ...prev,
        { role: "ai", text: `Task "${pendingTask}" created and added to your Kanban board!`, type: "system" }
      ]);
    } else {
      setLocalMessages(prev => [
        ...prev,
        { role: "ai", text: `Task creation cancelled.`, type: "system" }
      ]);
    }
    setPendingTask(null);
  };

  // Collapsed state
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-[999999]">
        <div 
          className="bg-gray-900/90 backdrop-blur-lg rounded-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 shadow-2xl border border-white/20 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 active:scale-95 min-w-[260px] sm:min-w-[280px] max-w-[90vw] sm:max-w-[400px] touch-manipulation"
          onClick={handleChatClick}
        >
          {/* Chat Icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#23c6e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>

          {/* Input Field */}
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleChatClick}
              placeholder={placeholder}
              className="w-full bg-transparent text-white placeholder-gray-300 text-sm sm:text-base focus:outline-none cursor-pointer"
            />
          </div>

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

    // Expanded state
  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-[999999]">
      <div className="relative flex flex-col w-[calc(100vw-32px)] sm:w-80 md:w-96 h-[calc(100vh-120px)] sm:h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#23c6e6]/30 overflow-hidden">
              {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700/50 bg-gray-900/90">
                      <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-base">AI</span>
              </div>
              <div>
                <h3 className="font-semibold text-white text-base sm:text-lg">Brixem Assistant</h3>
                <p className="text-xs sm:text-sm text-gray-400">Ask me about your project</p>
              </div>
            </div>
          <button
            onClick={() => onToggleExpanded?.(false)}
            className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-lg hover:bg-gray-800/50 active:scale-95 touch-manipulation"
            title="Close chat"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="space-y-4">
            {localMessages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8 sm:py-16">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-800/50 flex items-center justify-center">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-base sm:text-lg font-medium text-gray-300 mb-2 sm:mb-3">Welcome to Brixem Assistant</h4>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                  I can help you manage tasks, track progress, and answer questions about your project. 
                  Try asking me to create a task or show your Kanban board!
                </p>
              </div>
            ) : (
              localMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  <div
                    className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm max-w-[85%] break-words shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-br-md'
                        : msg.type === 'system'
                          ? 'bg-gray-700/80 text-white font-semibold'
                          : 'bg-gray-800/70 text-gray-100 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                                            {msg.type === 'task-confirm' && (
                          <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <button
                              type="button"
                              className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold shadow hover:opacity-90 active:scale-95 transition touch-manipulation text-xs sm:text-sm"
                              onClick={() => handleTaskConfirm(true)}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="px-3 sm:px-4 py-2 rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 active:scale-95 transition touch-manipulation text-xs sm:text-sm"
                              onClick={() => handleTaskConfirm(false)}
                            >
                              No
                            </button>
                          </div>
                        )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="p-4 sm:p-6 border-t border-gray-700/50 bg-gray-900/90">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 text-white placeholder-gray-400 rounded-lg border border-gray-700/50 focus:outline-none focus:border-[#23c6e6]/50 transition-colors text-sm sm:text-base"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 