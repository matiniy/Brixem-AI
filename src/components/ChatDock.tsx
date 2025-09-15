"use client";
import { useState, useEffect, useCallback } from "react";
import KanbanBoard from "./KanbanBoard";
import DashboardChat from "./DashboardChat";
import { useProjectStore } from "@/store/projectStore";

interface Message {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface ChatDockProps {
  onSend: (message: string) => void;
  messages: Message[];
  placeholder?: string;
}

export default function ChatDock({ onSend, messages, placeholder = "Ask about your project tasks..." }: ChatDockProps) {
  const [expanded, setExpanded] = useState(false);
  const { tasks, updateTask, addTask, deleteTask } = useProjectStore();
  
  const toggle = useCallback(() => setExpanded(v => !v), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") { 
        e.preventDefault(); 
        toggle(); 
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const handleTaskUpdate = (taskId: string, updates: any) => {
    updateTask(taskId, updates);
  };

  const handleAddTask = (task: any) => {
    addTask(task);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  return (
    <div className="relative w-full h-[calc(100vh-240px)] rounded-2xl overflow-hidden border bg-white shadow-sm">
      {/* Background Kanban Board */}
      <div className={`absolute inset-0 transition-all duration-300 ${
        expanded 
          ? "pointer-events-auto blur-0" 
          : "pointer-events-none blur-[2px]"
      }`}>
        <KanbanBoard 
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          interactive={expanded}
        />
        {!expanded && <div className="absolute inset-0 bg-white/50" />}
      </div>

      {/* Foreground Chat */}
      <div className={`absolute right-0 top-0 h-full bg-white/90 backdrop-blur-xl border-l transition-all duration-300 shadow-xl
                      w-full md:w-[460px] ${expanded ? "translate-x-full" : "translate-x-0"}`}>
        <div className="h-12 flex items-center justify-between px-3 border-b">
          <div className="text-sm font-medium">Brixem Assistant</div>
          <button 
            onClick={toggle} 
            className="text-xs px-2 py-1 rounded border hover:bg-zinc-50 transition-colors"
          >
            {expanded ? "Return to Chat" : "Expand Board (⌘/Ctrl+B)"}
          </button>
        </div>
        <div className="h-[calc(100%-3rem)]">
          <DashboardChat 
            onSend={onSend}
            messages={messages}
            placeholder={placeholder}
            isExpanded={true}
            onToggleExpanded={() => {}} // Not needed in this context
          />
        </div>
      </div>
    </div>
  );
}
