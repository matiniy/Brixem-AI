"use client";
import { useState, useRef, useEffect } from "react";
import { trackAction, trackFeatureUsage, BUSINESS_EVENTS, FEATURES } from "@/lib/analytics";

interface Message {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface FloatingChatOverlayProps {
  onSend: (message: string) => void;
  messages: Message[];
  placeholder?: string;
  isExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
}

export default function FloatingChatOverlay({
  onSend,
  messages,
  placeholder = "Ask about your project tasks...",
  isExpanded = false,
  onToggleExpanded
}: FloatingChatOverlayProps) {
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

    // Track chat usage
    trackFeatureUsage(FEATURES.AI_CHAT, 'message_sent');
    trackAction('chat_message', 'engagement', 'floating_chat');

    // Check if this is a task creation request
    const detectedTask = detectTask(message);
    if (detectedTask) {
      setPendingTask(detectedTask);
      setLocalMessages(prev => [
        ...prev,
        { role: "user", text: message },
        { role: "ai", text: `Would you like me to create a task: "${detectedTask}"?`, type: "task-confirm", taskText: detectedTask }
      ]);
      
      // Track task creation attempt
      trackAction('task_creation_attempt', 'engagement', 'floating_chat');
    } else {
      onSend(message);
      
      // Track AI chat started
      trackAction(BUSINESS_EVENTS.AI_CHAT_STARTED, 'business', 'floating_chat');
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
      
      // Track successful task creation
      trackAction('task_created', 'engagement', 'floating_chat');
      trackFeatureUsage(FEATURES.TASK_MANAGEMENT, 'task_created');
    } else {
      setLocalMessages(prev => [
        ...prev,
        { role: "ai", text: `Task creation cancelled.`, type: "system" }
      ]);
      
      // Track task creation cancellation
      trackAction('task_creation_cancelled', 'engagement', 'floating_chat');
    }
    setPendingTask(null);
  };

  // Collapsed state - centered at bottom
  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:bottom-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
        <div 
          className="bg-white rounded-2xl shadow-2xl border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-3xl hover:scale-105 active:scale-95 w-full sm:w-80 touch-manipulation"
          onClick={handleChatClick}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* AI Icon */}
            <div className="w-8 h-8 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
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
                className="w-full bg-transparent text-gray-900 placeholder-gray-500 text-sm focus:outline-none cursor-pointer min-h-[44px] px-3 py-2"
              />
            </div>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="w-7 h-7 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] rounded-full flex items-center justify-center hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Expanded state - centered at bottom
  return (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-end justify-center p-2 sm:p-4 pb-2 sm:pb-6">
      <div className="w-full max-w-md h-[70vh] sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Brixem Assistant</h3>
              <p className="text-xs text-white/80">Ask me about your project</p>
            </div>
          </div>
          <button
            onClick={() => onToggleExpanded?.(false)}
            className="text-white/80 hover:text-white transition-colors duration-200 p-1 rounded-lg hover:bg-white/20 active:scale-95 touch-manipulation"
            title="Minimize chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 h-[calc(70vh-120px)] sm:h-[320px]">
          <div className="space-y-4">
            {localMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="text-base font-medium text-gray-700 mb-2">Welcome to Brixem Assistant</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                  I can help you manage tasks, track progress, and answer questions about your project. 
                  Try asking me to create a task or show your progress!
                </p>
              </div>
            ) : (
              localMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : msg.type === 'system' ? 'justify-center' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm max-w-[85%] break-words shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-br-md'
                        : msg.type === 'system'
                          ? 'bg-green-100 text-green-800 font-medium'
                          : 'bg-gray-100 text-gray-900 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                    {msg.type === 'task-confirm' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold shadow hover:opacity-90 active:scale-95 transition touch-manipulation text-sm"
                          onClick={() => handleTaskConfirm(true)}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 active:scale-95 transition touch-manipulation text-sm"
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
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30 focus:border-[#23c6e6] text-sm text-gray-900 min-h-[44px] placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold rounded-lg hover:opacity-90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
