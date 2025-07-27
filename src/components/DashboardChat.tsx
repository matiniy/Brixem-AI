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
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>(messages);
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Use a more reliable state management approach
  const isActuallyExpanded = internalExpanded || isExpanded;

  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  // Sync internal expanded state with external state
  useEffect(() => {
    setInternalExpanded(isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    if (messagesEndRef.current && isExpanded) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isExpanded]);

  // Removed click-outside detection to prevent chat from disappearing
  // Users can close chat manually using the X button

  // Task-like message detection
  function detectTask(text: string): string | null {
    const taskPattern = /^(add|create task|to-?do)[:\s-]+(.+)/i;
    const match = text.match(taskPattern);
    if (match) {
      return match[2].trim();
    }
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      const taskText = detectTask(inputValue.trim());
      if (taskText) {
        // Show confirmation prompt
        setLocalMessages(prev => [
          ...prev,
          { role: "user", text: inputValue.trim() },
          { role: "ai", text: `Create this as a task?`, type: "task-confirm", taskText }
        ]);
        setPendingTask(taskText);
        setInputValue("");
        return;
      }
      // Normal message
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

  const handleInputFocus = () => {
    setIsFocused(true);
    // Only expand if not already expanded to prevent conflicts
    if (!isActuallyExpanded) {
      setInternalExpanded(true);
      onToggleExpanded?.(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Chat clicked, current expanded state:', isActuallyExpanded);
    if (!isActuallyExpanded) {
      console.log('Expanding chat...');
      setInternalExpanded(true);
      onToggleExpanded?.(true);
    }
  };

  // Handle task confirmation
  const handleTaskConfirm = (yes: boolean) => {
    if (yes && pendingTask) {
      // Simulate adding to Kanban (replace with real logic as needed)
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

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[999999] pointer-events-auto">
      {/* Collapsed State - Unified Style */}
      {!isActuallyExpanded && (
        <div 
          ref={chatRef}
          className={`bg-gray-900/90 backdrop-blur-lg rounded-full flex items-center gap-2 sm:gap-3 shadow-2xl border border-white/20 cursor-pointer touch-manipulation transition-all duration-300 ease-in-out hover:shadow-2xl overflow-x-hidden
            ${isFocused || isHovered
              ? 'min-w-[280px] sm:min-w-[320px] max-w-[340px] sm:max-w-[400px] px-3 sm:px-4 py-2.5 sm:py-3 scale-105'
              : 'min-w-[220px] sm:min-w-[280px] max-w-[280px] sm:max-w-[340px] px-2.5 sm:px-3 py-2 sm:py-2.5 scale-100'}
          `}
          onClick={handleChatClick}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Chat Icon */}
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#23c6e6] transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              className="w-full bg-transparent text-white placeholder-gray-300 text-sm sm:text-base focus:outline-none transition-colors duration-200"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Microphone Icon */}
            <button
              type="button"
              className="p-1.5 sm:p-2 rounded-full hover:bg-[#23c6e6]/20 active:bg-[#23c6e6]/30 transition-colors duration-200 touch-manipulation"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-[#23c6e6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 shadow touch-manipulation"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Expanded State - Full Chat Interface with Better Visibility */}
      {isActuallyExpanded && (
        <div 
          ref={chatRef} 
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onMouseUp={(e) => e.stopPropagation()}
        >
         <div 
           className="relative flex flex-col w-full h-full min-w-[320px] sm:w-full sm:max-w-[520px] sm:max-h-[calc(100vh-48px)] bg-gray-900/95 backdrop-blur-xl sm:rounded-2xl sm:shadow-2xl sm:border sm:border-[#23c6e6]/30 overflow-hidden"
           onClick={(e) => e.stopPropagation()}
         >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700/50 bg-gray-900/90 backdrop-blur-sm sticky top-0 left-0 right-0 z-10 sm:rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-base">AI</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Brixem Assistant</h3>
                  <p className="text-sm text-gray-400">Ask me about your project</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setInternalExpanded(false);
                  onToggleExpanded?.(false);
                }}
                className="text-gray-400 hover:text-white transition-colors duration-200 touch-manipulation p-2 rounded-lg hover:bg-gray-800/50"
                style={{ zIndex: 10 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 h-[calc(100vh-200px)] sm:h-[500px] scrollbar-thin scrollbar-thumb-gray-600/50 scrollbar-track-gray-800/30">
              <div className="space-y-4 pr-1">
                {localMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-16">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-300 mb-3">Welcome to Brixem Assistant</h4>
                    <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">I can help you manage tasks, track progress, and answer questions about your project. Try asking me to create a task or show your Kanban board!</p>
                  </div>
                ) : (
                  localMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'} animate-in fade-in translate-y-2 duration-300`}
                    >
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm max-w-[90%] sm:max-w-[85%] break-words shadow-lg backdrop-blur-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-br-md border border-[#23c6e6]/20'
                            : msg.type === 'system'
                              ? 'bg-gray-700/80 text-white font-semibold'
                              : 'bg-gray-800/70 text-gray-100 rounded-bl-md border border-gray-700/50'
                        }`}
                      >
                        {msg.text}
                        {/* Task confirmation buttons */}
                        {msg.type === 'task-confirm' && (
                          <div className="flex gap-3 mt-3">
                            <button
                              type="button"
                              className="px-4 py-2 min-w-[80px] rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold shadow hover:opacity-90 active:scale-95 transition border-0"
                              onClick={() => handleTaskConfirm(true)}
                            >
                              Yes
                            </button>
                            <button
                              type="button"
                              className="px-4 py-2 min-w-[64px] rounded-lg bg-gray-200 text-black font-semibold hover:bg-gray-300 active:scale-95 transition border border-gray-300"
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
            <div className="p-3 sm:p-4 border-t border-gray-700/50 bg-gray-900/90 backdrop-blur-sm sticky bottom-0 left-0 right-0 z-10 sm:rounded-b-2xl">
              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 pb-2">
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
                  className="px-6 py-3 bg-gradient-to-r from-[#23c6e6]/90 to-[#4b1fa7]/90 text-white rounded-xl text-sm font-medium hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg hover:shadow-xl backdrop-blur-sm border border-[#23c6e6]/20 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
              {/* Quick Actions */}
              <div className="flex justify-between mt-3 gap-2">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-[#23c6e6]/80 to-[#4b1fa7]/80 text-white text-xs font-medium shadow hover:opacity-90 active:scale-95 transition-all duration-150"
                  onClick={() => {/* TODO: Open create task modal/flow */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Create Task
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs font-medium shadow hover:bg-gray-700 active:scale-95 transition-all duration-150"
                  onClick={() => {/* TODO: Show Kanban board */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  Show Kanban
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs font-medium shadow hover:bg-gray-700 active:scale-95 transition-all duration-150"
                  onClick={() => {/* TODO: Attach file */}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  Attach File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 