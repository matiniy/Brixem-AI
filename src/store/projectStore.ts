import { create } from "zustand";

export type Milestone = {
  id: string;
  title: string;
  status: "todo" | "doing" | "done";
  dueDate?: string;
  description?: string;
  order: number;
};

export type Task = {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  progress: number;
  milestoneId?: string;
  description?: string;
  assignedUsers: string[];
  comments: number;
  likes: number;
  dueDate?: string;
  estimatedHours?: number;
};

export type Project = {
  id: string;
  name: string;
  percentComplete: number;
  currentMilestoneId?: string;
  type?: string;
  location?: string;
  description?: string;
  status?: string;
  budget?: string;
  created_at?: string;
  updated_at?: string;
};

type State = {
  project?: Project;
  milestones: Milestone[];
  tasks: Task[];
  setAll: (p: Project, ms: Milestone[], ts: Task[]) => void;
  upsertTask: (t: Task) => void;
  setTaskStatus: (id: string, status: Task["status"]) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
  setMilestoneStatus: (id: string, status: Milestone["status"]) => void;
  updateProject: (updates: Partial<Project>) => void;
};

export const useProjectStore = create<State>((set) => ({
  project: undefined,
  milestones: [],
  tasks: [],
  
  setAll: (project, milestones, tasks) => set({ project, milestones, tasks }),
  
  upsertTask: (task) => set((state) => {
    const existingIndex = state.tasks.findIndex(t => t.id === task.id);
    if (existingIndex >= 0) {
      const updatedTasks = [...state.tasks];
      updatedTasks[existingIndex] = task;
      return { tasks: updatedTasks };
    }
    return { tasks: [...state.tasks, task] };
  }),
  
  setTaskStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
  })),
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: `task-${Date.now()}` }]
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
  
  setMilestoneStatus: (id, status) => set((state) => ({
    milestones: state.milestones.map(m => m.id === id ? { ...m, status } : m)
  })),
  
  updateProject: (updates) => set((state) => ({
    project: state.project ? { ...state.project, ...updates } : undefined
  }))
}));
