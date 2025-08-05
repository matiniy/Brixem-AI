import React, { useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  text: string;
}

interface ChatPanelProps {
  messages: Message[];
  onSend: (text: string) => void;
  onTaskConfirm?: (yes: boolean) => void;
  pendingTask?: string | null;
  disableInput?: boolean;
}

export default function ChatPanel({ messages, onSend, onTaskConfirm, pendingTask, disableInput }: ChatPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMsg = messages[messages.length - 1];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remove auto-scroll to prevent page jumping when messages are added
    // messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Remove auto-focus to prevent page scrolling to input
    // inputRef.current?.focus();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`p-3 sm:p-4 rounded-2xl max-w-[85%] text-sm sm:text-base shadow-sm ${msg.role === "user" ? "ml-auto bg-black text-white" : "bg-gray-100 text-gray-900"}`}>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
          </div>
        ))}
        {/* Task confirmation buttons */}
        {onTaskConfirm && pendingTask && lastMsg && lastMsg.role === "ai" && lastMsg.text.includes(pendingTask) && (
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              className="px-6 py-3 min-w-[80px] rounded-xl bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold shadow hover:opacity-90 transition border-0 touch-manipulation min-h-[44px]"
              style={{ display: 'inline-block' }}
              onClick={() => onTaskConfirm(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className="px-6 py-3 min-w-[64px] rounded-xl bg-gray-200 text-black font-semibold hover:bg-gray-300 transition border border-gray-300 touch-manipulation min-h-[44px]"
              style={{ display: 'inline-block' }}
              onClick={() => onTaskConfirm(false)}
            >
              No
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="flex gap-3 mt-4"
        onSubmit={e => {
          e.preventDefault();
          if (disableInput) return;
          if (inputRef.current && inputRef.current.value.trim()) {
            onSend(inputRef.current.value);
            inputRef.current.value = "";
          }
        }}
      >
        <input
          ref={inputRef}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-black text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={disableInput ? "No free chats left" : "Ask anything about your project..."}
          disabled={disableInput}
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-medium text-base touch-manipulation min-h-[44px] hover:opacity-90 transition"
          disabled={disableInput}
        >
          Send
        </button>
      </form>
    </div>
  );
} 