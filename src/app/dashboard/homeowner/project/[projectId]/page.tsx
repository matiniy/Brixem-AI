"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import ProjectWizard from "@/components/ProjectWizard";
import ChatModal from "@/components/ChatModal";
import OnboardingFlow from "@/components/OnboardingFlow";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import KanbanBoard from "@/components/KanbanBoard";
import ListView from "@/components/ListView";
import CalendarView from "@/components/CalendarView";
import FloatingChat from "@/components/FloatingChat";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: string;
  progress: number;
  contractors: unknown[];
  createdAt: string;
  description: string;
  location: string;
  timeline: string;
}

interface Document {
  id: string;
  name: string;
  type: "sow" | "wbs" | "schedule";
  status: "generating" | "ready" | "downloaded";
  downloadUrl?: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  progress: number;
  assignedUsers: string[];
  comments: number;
  likes: number;
  dueDate?: string;
  estimatedHours?: number;
}

interface Message {
  role: "user" | "ai";
  text: string;
}

// Mock data for each project
const projectData: Record<string, {
  project: Project;
  tasks: Task[];
  documents: Document[];
  messages: Message[];
}> = {
  "1": {
    project: {
      id: "1",
      name: "Kitchen Renovation",
      type: "kitchen",
      status: "in-progress",
      budget: "$25,000 - $50,000",
      progress: 65,
      contractors: [],
      createdAt: "2024-01-15",
      description: "Complete kitchen renovation including new cabinets, countertops, and appliances",
      location: "123 Main St, City",
      timeline: "8-12 weeks"
    },
    tasks: [
      {
        id: "k1",
        title: "Design Consultation",
        description: "Meet with interior designer to finalize kitchen layout and materials",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Designer"],
        comments: 3,
        likes: 2,
        dueDate: "2024-02-01",
        estimatedHours: 4
      },
      {
        id: "k2",
        title: "Demolition & Prep",
        description: "Remove old cabinets, countertops, and prepare space for renovation",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Contractor"],
        comments: 5,
        likes: 1,
        dueDate: "2024-02-15",
        estimatedHours: 16
      },
      {
        id: "k3",
        title: "Electrical Work",
        description: "Update electrical wiring and install new outlets for appliances",
        status: "in-progress",
        priority: "high",
        progress: 75,
        assignedUsers: ["Electrician"],
        comments: 2,
        likes: 0,
        dueDate: "2024-03-01",
        estimatedHours: 12
      },
      {
        id: "k4",
        title: "Plumbing Installation",
        description: "Install new plumbing for sink, dishwasher, and refrigerator",
        status: "in-progress",
        priority: "medium",
        progress: 60,
        assignedUsers: ["Plumber"],
        comments: 1,
        likes: 0,
        dueDate: "2024-03-10",
        estimatedHours: 8
      },
      {
        id: "k5",
        title: "Cabinet Installation",
        description: "Install new kitchen cabinets and hardware",
        status: "todo",
        priority: "high",
        progress: 0,
        assignedUsers: ["Carpenter"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-20",
        estimatedHours: 20
      },
      {
        id: "k6",
        title: "Countertop Installation",
        description: "Install granite countertops and backsplash",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Stone Mason"],
        comments: 0,
        likes: 0,
        dueDate: "2024-04-01",
        estimatedHours: 16
      },
      {
        id: "k7",
        title: "Appliance Installation",
        description: "Install refrigerator, stove, dishwasher, and microwave",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Appliance Tech"],
        comments: 0,
        likes: 0,
        dueDate: "2024-04-10",
        estimatedHours: 8
      },
      {
        id: "k8",
        title: "Final Inspection",
        description: "Complete final walkthrough and quality inspection",
        status: "todo",
        priority: "low",
        progress: 0,
        assignedUsers: ["Inspector"],
        comments: 0,
        likes: 0,
        dueDate: "2024-04-15",
        estimatedHours: 4
      }
    ],
    documents: [
      {
        id: "d1",
        name: "Kitchen Design Plans",
        type: "sow",
        status: "ready",
        createdAt: "2024-01-20"
      },
      {
        id: "d2",
        name: "Kitchen Work Breakdown",
        type: "wbs",
        status: "ready",
        createdAt: "2024-01-25"
      },
      {
        id: "d3",
        name: "Kitchen Project Schedule",
        type: "schedule",
        status: "ready",
        createdAt: "2024-01-30"
      }
    ],
    messages: [
      { role: "ai", text: "Welcome to your Kitchen Renovation project! I can help you manage tasks, track progress, and answer questions about your renovation." },
      { role: "user", text: "What's the next step in my kitchen renovation?" },
      { role: "ai", text: "Based on your current progress, the next step is completing the electrical work (75% done) and then moving to plumbing installation. Would you like me to create a new task or update the timeline?" }
    ]
  },
  "2": {
    project: {
      id: "2",
      name: "Living Room",
      type: "living-room",
      status: "planning",
      budget: "$15,000 - $30,000",
      progress: 35,
      contractors: [],
      createdAt: "2024-01-20",
      description: "Modern living room redesign with new furniture, lighting, and wall treatments",
      location: "123 Main St, City",
      timeline: "4-6 weeks"
    },
    tasks: [
      {
        id: "lr1",
        title: "Design Consultation",
        description: "Meet with interior designer to discuss living room layout and style preferences",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Designer"],
        comments: 2,
        likes: 1,
        dueDate: "2024-02-05",
        estimatedHours: 3
      },
      {
        id: "lr2",
        title: "Furniture Selection",
        description: "Choose and order new sofa, chairs, coffee table, and entertainment center",
        status: "in-progress",
        priority: "high",
        progress: 80,
        assignedUsers: ["Designer"],
        comments: 4,
        likes: 2,
        dueDate: "2024-02-20",
        estimatedHours: 6
      },
      {
        id: "lr3",
        title: "Wall Preparation",
        description: "Repair walls, remove old wallpaper, and prepare for new paint or treatments",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Painter"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-01",
        estimatedHours: 12
      },
      {
        id: "lr4",
        title: "Lighting Installation",
        description: "Install new ceiling lights, wall sconces, and floor lamps",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Electrician"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-10",
        estimatedHours: 8
      },
      {
        id: "lr5",
        title: "Furniture Delivery",
        description: "Receive and arrange new furniture in the living room",
        status: "todo",
        priority: "low",
        progress: 0,
        assignedUsers: ["Delivery Team"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-15",
        estimatedHours: 4
      }
    ],
    documents: [
      {
        id: "d4",
        name: "Living Room Design Plan",
        type: "sow",
        status: "ready",
        createdAt: "2024-01-25"
      },
      {
        id: "d5",
        name: "Living Room Budget Breakdown",
        type: "wbs",
        status: "ready",
        createdAt: "2024-01-30"
      }
    ],
    messages: [
      { role: "ai", text: "Welcome to your Living Room project! I can help you with design decisions, furniture selection, and project management." },
      { role: "user", text: "What furniture should I consider for a modern living room?" },
      { role: "ai", text: "For a modern living room, consider a sectional sofa, accent chairs, a coffee table with clean lines, and a media console. Would you like me to create a shopping list task?" }
    ]
  },
  "3": {
    project: {
      id: "3",
      name: "Bathroom",
      type: "bathroom",
      status: "completed",
      budget: "$10,000 - $20,000",
      progress: 100,
      contractors: [],
      createdAt: "2024-01-25",
      description: "Master bathroom renovation with new fixtures, tile, and lighting",
      location: "123 Main St, City",
      timeline: "6-8 weeks"
    },
    tasks: [
      {
        id: "b1",
        title: "Design Planning",
        description: "Finalize bathroom layout and select fixtures and materials",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Designer"],
        comments: 3,
        likes: 2,
        dueDate: "2024-02-01",
        estimatedHours: 4
      },
      {
        id: "b2",
        title: "Demolition",
        description: "Remove old fixtures, tile, and prepare for renovation",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Contractor"],
        comments: 2,
        likes: 1,
        dueDate: "2024-02-10",
        estimatedHours: 12
      },
      {
        id: "b3",
        title: "Plumbing Work",
        description: "Install new plumbing for shower, sink, and toilet",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Plumber"],
        comments: 4,
        likes: 1,
        dueDate: "2024-02-20",
        estimatedHours: 16
      },
      {
        id: "b4",
        title: "Tile Installation",
        description: "Install floor and wall tiles in shower and bathroom",
        status: "completed",
        priority: "medium",
        progress: 100,
        assignedUsers: ["Tile Setter"],
        comments: 3,
        likes: 2,
        dueDate: "2024-03-05",
        estimatedHours: 24
      },
      {
        id: "b5",
        title: "Fixture Installation",
        description: "Install new toilet, sink, shower, and accessories",
        status: "completed",
        priority: "medium",
        progress: 100,
        assignedUsers: ["Plumber"],
        comments: 2,
        likes: 1,
        dueDate: "2024-03-15",
        estimatedHours: 12
      },
      {
        id: "b6",
        title: "Final Inspection",
        description: "Complete final walkthrough and quality check",
        status: "completed",
        priority: "low",
        progress: 100,
        assignedUsers: ["Inspector"],
        comments: 1,
        likes: 0,
        dueDate: "2024-03-20",
        estimatedHours: 2
      }
    ],
    documents: [
      {
        id: "d6",
        name: "Bathroom Design Plans",
        type: "sow",
        status: "downloaded",
        createdAt: "2024-02-01"
      },
      {
        id: "d7",
        name: "Bathroom Work Breakdown",
        type: "wbs",
        status: "downloaded",
        createdAt: "2024-02-05"
      },
      {
        id: "d8",
        name: "Bathroom Project Schedule",
        type: "schedule",
        status: "downloaded",
        createdAt: "2024-02-10"
      }
    ],
    messages: [
      { role: "ai", text: "Congratulations! Your bathroom renovation is complete. All tasks have been finished and the project is ready for final inspection." },
      { role: "user", text: "What maintenance tips do you have for my new bathroom?" },
      { role: "ai", text: "For your new bathroom, regularly clean grout lines, use gentle cleaners on fixtures, and check for any leaks monthly. Would you like me to create a maintenance schedule?" }
    ]
  },
  "4": {
    project: {
      id: "4",
      name: "Office",
      type: "office",
      status: "planning",
      budget: "$8,000 - $15,000",
      progress: 20,
      contractors: [],
      createdAt: "2024-01-30",
      description: "Home office setup with custom desk, storage, and ergonomic furniture",
      location: "123 Main St, City",
      timeline: "3-4 weeks"
    },
    tasks: [
      {
        id: "o1",
        title: "Space Planning",
        description: "Measure room and plan optimal desk and storage layout",
        status: "completed",
        priority: "high",
        progress: 100,
        assignedUsers: ["Designer"],
        comments: 2,
        likes: 1,
        dueDate: "2024-02-05",
        estimatedHours: 2
      },
      {
        id: "o2",
        title: "Furniture Selection",
        description: "Choose desk, chair, storage units, and accessories",
        status: "in-progress",
        priority: "high",
        progress: 60,
        assignedUsers: ["Designer"],
        comments: 3,
        likes: 1,
        dueDate: "2024-02-15",
        estimatedHours: 4
      },
      {
        id: "o3",
        title: "Electrical Setup",
        description: "Install additional outlets and lighting for office equipment",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Electrician"],
        comments: 0,
        likes: 0,
        dueDate: "2024-02-25",
        estimatedHours: 6
      },
      {
        id: "o4",
        title: "Furniture Assembly",
        description: "Assemble desk, chair, and storage units",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Assembly Team"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-05",
        estimatedHours: 8
      },
      {
        id: "o5",
        title: "Technology Setup",
        description: "Set up computer, monitor, and office equipment",
        status: "todo",
        priority: "low",
        progress: 0,
        assignedUsers: ["IT Tech"],
        comments: 0,
        likes: 0,
        dueDate: "2024-03-10",
        estimatedHours: 4
      }
    ],
    documents: [
      {
        id: "d9",
        name: "Office Layout Plan",
        type: "sow",
        status: "ready",
        createdAt: "2024-02-01"
      },
      {
        id: "d10",
        name: "Office Equipment List",
        type: "wbs",
        status: "generating",
        createdAt: "2024-02-05"
      }
    ],
    messages: [
      { role: "ai", text: "Welcome to your Office project! I can help you design an efficient workspace and manage the setup process." },
      { role: "user", text: "What's the best desk setup for productivity?" },
      { role: "ai", text: "For optimal productivity, position your desk near natural light, ensure proper ergonomics with an adjustable chair, and organize cables. Would you like me to create a setup checklist?" }
    ]
  }
};

export default function ProjectDashboard() {
  const params = useParams();
  const projectId = params.projectId as string;
  const router = useRouter();
  
  const [user, setUser] = useState<unknown>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Documents panel state
  const [documentsPanelOpen, setDocumentsPanelOpen] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Kanban tasks state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentView, setCurrentView] = useState<"kanban" | "list" | "calendar">("kanban");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);

  // Get project data
  const projectDataForId = projectData[projectId];
  const project = projectDataForId?.project;

  // Initialize project data
  useEffect(() => {
    if (projectDataForId) {
      setTasks(projectDataForId.tasks);
      setDocuments(projectDataForId.documents);
      setMessages(projectDataForId.messages);
    }
  }, [projectId, projectDataForId]);

  // Check for user data from onboarding flow
  React.useEffect(() => {
    const userData = localStorage.getItem("brixem_user_data");
    const plan = localStorage.getItem("brixem_plan");
    
    if (userData && plan) {
      const parsedUserData = JSON.parse(userData);
      if (parsedUserData.role === "homeowner" && parsedUserData.onboardingComplete) {
        setUser(parsedUserData);
        // Clear the stored data after loading
        localStorage.removeItem("brixem_user_data");
        localStorage.removeItem("brixem_plan");
      }
    }
  }, []);

  // Projects state for sidebar
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      name: "Kitchen Renovation",
      type: "kitchen",
      status: "in-progress",
      budget: "$25,000 - $50,000",
      progress: 65,
      contractors: [],
      createdAt: "2024-01-15",
      description: "Complete kitchen renovation including new cabinets, countertops, and appliances",
      location: "123 Main St, City",
      timeline: "8-12 weeks"
    },
    {
      id: "2",
      name: "Living Room",
      type: "living-room",
      status: "planning",
      budget: "$15,000 - $30,000",
      progress: 35,
      contractors: [],
      createdAt: "2024-01-20",
      description: "Modern living room redesign with new furniture, lighting, and wall treatments",
      location: "123 Main St, City",
      timeline: "4-6 weeks"
    },
    {
      id: "3",
      name: "Bathroom",
      type: "bathroom",
      status: "completed",
      budget: "$10,000 - $20,000",
      progress: 100,
      contractors: [],
      createdAt: "2024-01-25",
      description: "Master bathroom renovation with new fixtures, tile, and lighting",
      location: "123 Main St, City",
      timeline: "6-8 weeks"
    },
    {
      id: "4",
      name: "Office",
      type: "office",
      status: "planning",
      budget: "$8,000 - $15,000",
      progress: 20,
      contractors: [],
      createdAt: "2024-01-30",
      description: "Home office setup with custom desk, storage, and ergonomic furniture",
      location: "123 Main St, City",
      timeline: "3-4 weeks"
    }
  ]);

  const handleAuthSuccess = (userData: unknown) => {
    setUser(userData);
    setShowAuth(false);
    // Show onboarding for new users
    if (!userData || typeof userData !== 'object' || !('onboardingComplete' in userData) || !userData.onboardingComplete) {
      setShowOnboarding(true);
    }
  };

  const handleProjectCreated = (projectData: unknown) => {
    if (typeof projectData === 'object' && projectData !== null && 'id' in projectData && 'name' in projectData && 'type' in projectData && 'status' in projectData && 'budget' in projectData && 'progress' in projectData && 'contractors' in projectData && 'createdAt' in projectData && 'description' in projectData && 'location' in projectData && 'timeline' in projectData) {
      const newProject: Project = {
        id: Date.now().toString(),
        contractors: [],
        name: String(projectData.name),
        type: String(projectData.type),
        status: String(projectData.status),
        budget: String(projectData.budget),
        progress: Number(projectData.progress),
        createdAt: String(projectData.createdAt),
        description: String(projectData.description),
        location: String(projectData.location),
        timeline: String(projectData.timeline)
      };
      setProjects(prev => [...prev, newProject]);
      // Navigate to the new project
      router.push(`/dashboard/homeowner/project/${newProject.id}`);
    }
    setShowProjectWizard(false);
  };

  const handleProjectCreate = (projectData: unknown) => {
    if (typeof projectData === 'object' && projectData !== null && 'name' in projectData && 'type' in projectData && 'budget' in projectData && 'description' in projectData && 'location' in projectData && 'timeline' in projectData) {
      const newProject: Project = {
        id: Date.now().toString(),
        contractors: [],
        name: String(projectData.name),
        type: String(projectData.type),
        status: "planning", // Default status for new projects
        budget: String(projectData.budget),
        progress: 0, // Default progress for new projects
        createdAt: new Date().toISOString(),
        description: String(projectData.description),
        location: String(projectData.location),
        timeline: String(projectData.timeline)
      };
      setProjects(prev => [...prev, newProject]);
      // Navigate to the new project
      router.push(`/dashboard/homeowner/project/${newProject.id}`);
    }
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    // If we're on the deleted project, navigate to the first available project or dashboard
    if (projectId === projectId) {
      const remainingProjects = projects.filter(project => project.id !== projectId);
      if (remainingProjects.length > 0) {
        router.push(`/dashboard/homeowner/project/${remainingProjects[0].id}`);
      } else {
        router.push("/dashboard/homeowner");
      }
    }
  };

  const handleOnboardingComplete = (userData: unknown) => {
    setUser((prev: unknown) => {
      const prevObj = typeof prev === "object" && prev !== null ? prev : {};
      const userObj = typeof userData === "object" && userData !== null ? userData : {};
      return { ...prevObj, ...userObj };
    });
    setShowOnboarding(false);
  };

  const handleSend = (message: string) => {
    const newMessage: Message = {
      role: "user",
      text: message
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: "ai",
        text: `I understand you&apos;re asking about "${message}". Let me help you with that.`
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      progress: 0,
      assignedUsers: [],
      comments: 0,
      likes: 0,
      dueDate: newTask.dueDate,
      estimatedHours: newTask.estimatedHours
    };
    setTasks(prev => [...prev, task]);
  };

  const handleDocumentDownload = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId ? { ...doc, status: "downloaded" as const } : doc
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.push("/dashboard/homeowner")}
            className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        projects={projects}
        activeProject={projectId}
        onProjectSelect={(projectId) => router.push(`/dashboard/homeowner/project/${projectId}`)}
        onProjectCreate={handleProjectCreate}
        onProjectDelete={handleProjectDelete}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Menu Button */}
                  <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-gray-600 text-sm sm:text-base">{project.description}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-500">
                      <span>Budget: {project.budget}</span>
                      <span>Timeline: {project.timeline}</span>
                      <span>Location: {project.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setCurrentView("kanban")}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        currentView === "kanban"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      Kanban
                    </button>
                                          <button
                        onClick={() => setCurrentView("list")}
                        className={`px-3 py-1 text-sm rounded-md transition ${
                          currentView === "list"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        List
                      </button>
                    <button
                      onClick={() => setCurrentView("calendar")}
                      className={`px-3 py-1 text-sm rounded-md transition ${
                        currentView === "calendar"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-700 hover:text-gray-900"
                      }`}
                    >
                      Calendar
                    </button>
                  </div>
                  <button
                    onClick={() => setDocumentsPanelOpen(!documentsPanelOpen)}
                    className={`px-4 py-2 text-sm rounded-lg transition flex items-center gap-2 ${
                      documentsPanelOpen 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Documents
                  </button>
                  <button
                    onClick={() => router.push("/dashboard/homeowner")}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden">
              {currentView === "kanban" && (
                <KanbanBoard
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}
                              {currentView === "list" && (
                  <ListView
                    tasks={tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onAddTask={handleAddTask}
                  />
                )}
              {currentView === "calendar" && (
                <CalendarView
                  tasks={tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onAddTask={handleAddTask}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Documents Panel Overlay */}
      {documentsPanelOpen && (
        <>
          {/* Backdrop - Only covers the right side */}
          <div 
            className="fixed top-0 right-0 h-full w-80 bg-black bg-opacity-30 z-40"
            onClick={() => setDocumentsPanelOpen(false)}
          />
          
          {/* Documents Panel */}
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    onClick={() => setDocumentsPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {documents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No documents generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{doc.name}</h4>
                          <div className="flex items-center gap-2">
                            {doc.status === "generating" && (
                              <div className="flex items-center gap-1 text-blue-600">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs">Generating...</span>
                              </div>
                            )}
                            {doc.status === "ready" && (
                              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">Ready</span>
                            )}
                            {doc.status === "downloaded" && (
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Downloaded</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-xs text-gray-500">
                            {new Date(doc.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {doc.status === "ready" && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleDocumentDownload(doc.id)}
                              className="px-3 py-1 text-xs bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-md hover:opacity-90 transition"
                            >
                              Download PDF
                            </button>
                            {doc.type === "sow" && (
                              <button
                                onClick={() => handleDocumentDownload(doc.id)}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                              >
                                Download Word
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
      <ProjectWizard open={showProjectWizard} onClose={() => setShowProjectWizard(false)} onComplete={handleProjectCreated} />
      <ChatModal open={showChat} onClose={() => setShowChat(false)} />
      <OnboardingFlow open={showOnboarding} onClose={() => setShowOnboarding(false)} onComplete={handleOnboardingComplete} />

      {/* Floating Chat Widget */}
      <FloatingChat
        onSend={handleSend}
        messages={messages}
        placeholder={`Ask about your ${project.name} project...`}
      />
    </div>
  );
} 