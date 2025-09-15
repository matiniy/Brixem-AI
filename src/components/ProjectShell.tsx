"use client";
import ProgressTracker from "./ProgressTracker";
import SummaryCards from "./SummaryCards";
import ChatDock from "./ChatDock";

interface Message {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface ProjectShellProps {
  onSend: (message: string) => void;
  messages: Message[];
  placeholder?: string;
}

export default function ProjectShell({ onSend, messages, placeholder }: ProjectShellProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Project Overview</h1>
          <p className="text-sm text-zinc-600">
            Your progress, next steps, and assistant — all in one view.
          </p>
        </div>
      </div>
      
      <ProgressTracker />
      <SummaryCards />
      <ChatDock 
        onSend={onSend}
        messages={messages}
        placeholder={placeholder}
      />
    </div>
  );
}
