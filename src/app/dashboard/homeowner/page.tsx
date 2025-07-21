"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ChatModal from "@/components/ChatModal";
import OnboardingFlow from "@/components/OnboardingFlow";
import ListView from "@/components/ListView";
import CalendarView from "@/components/CalendarView";

interface Project {
  id: string;
  name: string;
  type: string;
  status: string;
  budget: string;
  progress: number;
  contractors: any[];
  createdAt: string;
}

interface Contractor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  availability: string;
  estimatedCost: string;
  avatar: string;
}

// Add Message type
interface Message {
  role: "user" | "ai";
  text: string;
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

export default function HomeownerDashboard() {
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
  const [showKanban, setShowKanban] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentView, setCurrentView] = useState<"kanban" | "list" | "calendar">("kanban");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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
      status: "planning",
      budget: "$25,000 - $50,000",
      progress: 65,
      contractors: [],
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Living Room",
      type: "living-room",
      status: "planning",
      budget: "$15,000 - $30,000",
      progress: 35,
      contractors: [],
      createdAt: "2024-01-20"
    },
    {
      id: "3",
      name: "Bathroom",
      type: "bathroom",
      status: "planning",
      budget: "$10,000 - $20,000",
      progress: 80,
      contractors: [],
      createdAt: "2024-01-25"
    },
    {
      id: "4",
      name: "Office",
      type: "office",
      status: "planning",
      budget: "$8,000 - $15,000",
      progress: 20,
      contractors: [],
      createdAt: "2024-01-30"
    }
  ]);

  const [activeProject, setActiveProject] = useState("1");

  const handleProjectSelect = (projectId: string) => {
    router.push(`/dashboard/homeowner/project/${projectId}`);
  };

  const handleProjectCreate = (projectData: any) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      contractors: []
    };
    setProjects(prev => [...prev, newProject]);
    // Navigate to the new project
    router.push(`/dashboard/homeowner/project/${newProject.id}`);
  };

  const handleProjectDelete = (projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    // If we're on the deleted project, navigate to the first available project or dashboard
    if (activeProject === projectId) {
      const remainingProjects = projects.filter(project => project.id !== projectId);
      if (remainingProjects.length > 0) {
        router.push(`/dashboard/homeowner/project/${remainingProjects[0].id}`);
      } else {
        router.push("/dashboard/homeowner");
      }
    }
  };

  const [recommendedContractors] = useState<Contractor[]>([
    {
      id: "1",
      name: "Mike Johnson",
      specialty: "Kitchen & Bath",
      rating: 4.8,
      reviews: 127,
      availability: "Available in 2 weeks",
      estimatedCost: "$28,000 - $35,000",
      avatar: "MJ"
    },
    {
      id: "2",
      name: "Sarah Chen",
      specialty: "Interior Design",
      rating: 4.9,
      reviews: 89,
      availability: "Available next week",
      estimatedCost: "$32,000 - $40,000",
      avatar: "SC"
    },
    {
      id: "3",
      name: "David Rodriguez",
      specialty: "General Contractor",
      rating: 4.7,
      reviews: 203,
      availability: "Available in 3 weeks",
      estimatedCost: "$25,000 - $30,000",
      avatar: "DR"
    }
  ]);

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    // Show onboarding for new users
    if (!userData.onboardingComplete) {
      setShowOnboarding(true);
    }
  };

  const handleProjectCreated = (projectData: any) => {
    setProjects(prev => [...prev, projectData]);
    setShowProjectWizard(false);
  };

  const handleOnboardingComplete = (userData: unknown) => {
    setUser((prev: unknown) => ({ ...(prev as object), ...(userData as object) }));
    setShowOnboarding(false);
    // Redirect to scope summary after onboarding
    router.push("/dashboard/homeowner/ScopeSummaryPage");
  };

  // Homepage-style chat state
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isChatActive, setIsChatActive] = React.useState(false);
  const preQuestions = [
    "I'm a homeowner planning a renovation",
    "I'm a contractor looking for projects",
    "I need help with project estimation",
    "I want to learn about Brixem's features",
    "I'm a consultant seeking tools"
  ];

  // Track if user has started the chat
  const [hasStartedChat, setHasStartedChat] = useState(false);

  // Unified handleSend for both guided and open chat
  const handleSend = (message: string) => {
    if (messages.length === 0 && !hasStartedChat) {
      setIsChatActive(true);
      setHasStartedChat(true);
    }
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    
    // If in guided flow, handle setup answers
    if (!openChat) {
      if (!sowReady) {
        handleSetupAnswer(message);
        return;
      }
      // ... (handle other guided steps as before)
    }
    
    // If in Kanban mode, handle task creation and AI responses
    if (showKanban) {
      setTimeout(() => {
        // Check if user wants to add a task
        const taskKeywords = ['add task', 'create task', 'new task', 'add card', 'create card'];
        const isTaskRequest = taskKeywords.some(keyword => 
          message.toLowerCase().includes(keyword)
        );
        
        if (isTaskRequest) {
          // Generate a new task based on the message
          const newTask: Omit<Task, "id"> = {
            title: message.replace(/add task|create task|new task|add card|create card/gi, '').trim() || "New Task",
            description: `Task created via AI chat: ${message}`,
            status: "todo",
            priority: "medium",
            progress: 0,
            assignedUsers: [],
            comments: 0,
            likes: 0,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
          
          handleAddTask(newTask);
          setMessages((prev) => [...prev, { 
            role: "ai", 
            text: `I've created a new task: "${newTask.title}". You can find it in your Kanban board!` 
          }]);
        } else {
          // Regular AI responses for Kanban mode
          const aiResponses = [
            "I can help you manage your project tasks. Try saying 'add task' followed by what you need to do.",
            "You can drag and drop tasks between columns to update their status.",
            "Need to add a new task? Just tell me what you need to do and I'll create it for you.",
            "The calendar view shows your tasks scheduled over time. Perfect for planning!",
            "You can switch between Kanban, Grid, and Calendar views to manage tasks your way."
          ];
          const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          setMessages((prev) => [...prev, { role: "ai", text: randomResponse }]);
        }
      }, 1000);
    } else {
      // Default AI responses for setup phase
      setTimeout(() => {
        const aiResponses = [
          "To start a renovation project, begin by defining your goals, setting a budget, and consulting with professionals.",
          "Key factors include clear planning, realistic budgeting, choosing the right contractor, and regular progress tracking.",
          "AI can analyze your project scope and local market data to provide accurate cost estimates quickly.",
          "Brixem streamlines project management with AI-driven insights, real-time collaboration, and automated scheduling.",
          "Unlike traditional tools, Brixem leverages AI to optimize every stage of your construction project for efficiency and clarity."
        ];
        const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
        setMessages((prev) => [...prev, { role: "ai", text: randomResponse }]);
      }, 1000);
    }
  };

  // Homeowner-specific pre-existing questions
  const homeownerQuestions = [
    "How do I start a renovation project?",
    "What is the average cost of a kitchen remodel?",
    "How do I find a reliable contractor?",
    "What permits do I need for home renovation?",
    "How can I track my renovation progress?",
    "What are common renovation mistakes to avoid?"
  ];

  // Guided chat flow state
  const [setupStep, setSetupStep] = React.useState(0);
  const [projectAnswers, setProjectAnswers] = React.useState({
    projectType: "",
    intendedUse: "",
    location: (user as any)?.location || "",
    description: "",
    dates: ""
  });
  const [sowReady, setSowReady] = React.useState(false);
  const [wbsReady, setWbsReady] = React.useState(false);
  const [scheduleReady, setScheduleReady] = React.useState(false);
  const [costReady, setCostReady] = React.useState(false);
  const [openChat, setOpenChat] = React.useState(false);

  // Add controlled input for guided setup
  const [setupInput, setSetupInput] = React.useState("");

  // Guided prompts
  const setupPrompts: { key: keyof typeof projectAnswers; prompt: string }[] = [
    {
      key: "projectType",
      prompt: "What type of project is this? (e.g., extension, loft conversion, new build)"
    },
    {
      key: "intendedUse",
      prompt: "What is the intended use? (e.g., residential, rental, commercial)"
    },
    {
      key: "location",
      prompt: projectAnswers.location ? "Please confirm or update the project location (city and country):" : "Where is the project located? (city and country)"
    },
    {
      key: "description",
      prompt: "Please describe the project in your own words (e.g., size, goals, known issues)"
    },
    {
      key: "dates",
      prompt: "Do you have preferred start or completion dates?"
    }
  ];

  // Handle guided answer (now only on submit)
  const handleSetupAnswer = (answer: string) => {
    const key = setupPrompts[setupStep].key;
    setProjectAnswers(prev => ({ ...prev, [key]: answer }));
    // Add prompt and answer to chat history
    setMessages(prev => [
      ...prev,
      { role: "ai", text: setupPrompts[setupStep].prompt },
      { role: "user", text: answer }
    ]);
    setSetupInput("");
    if (setupStep < setupPrompts.length - 1) {
      setSetupStep(setupStep + 1);
    } else {
      // All questions answered - generate documents
      generateDocuments();
      setSowReady(true);
    }
  };

  // Generate documents function
  const generateDocuments = () => {
    // Open documents panel
    setDocumentsPanelOpen(true);
    
    // Add documents to the list
    const newDocuments: Document[] = [
      {
        id: "sow-1",
        name: "Scope of Works",
        type: "sow",
        status: "generating",
        createdAt: new Date().toISOString()
      }
    ];
    setDocuments(newDocuments);

    // Simulate document generation
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => 
        doc.id === "sow-1" 
          ? { ...doc, status: "ready" as const }
          : doc
      ));
      
      // Show transition state
      setIsTransitioning(true);
      
      // After a brief delay, show Kanban board and generate tasks
      setTimeout(() => {
        setShowKanban(true);
        generateKanbanTasks();
        setIsTransitioning(false);
      }, 1000);
    }, 2000);
  };

  // Handle document generation steps
  const handleDocumentStep = (step: string) => {
    if (step === "sow") {
      // Add WBS document
      setDocuments(prev => [...prev, {
        id: "wbs-1",
        name: "Work Breakdown Structure",
        type: "wbs",
        status: "generating",
        createdAt: new Date().toISOString()
      }]);
      
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === "wbs-1" 
            ? { ...doc, status: "ready" as const }
            : doc
        ));
      }, 2000);
      
      setWbsReady(true);
    } else if (step === "wbs") {
      // Add Schedule document
      setDocuments(prev => [...prev, {
        id: "schedule-1",
        name: "Schedule of Works",
        type: "schedule",
        status: "generating",
        createdAt: new Date().toISOString()
      }]);
      
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === "schedule-1" 
            ? { ...doc, status: "ready" as const }
            : doc
        ));
      }, 2000);
      
      setScheduleReady(true);
    } else if (step === "schedule") {
      // Generate Kanban tasks from Schedule of Works
      generateKanbanTasks();
      setCostReady(true);
      setOpenChat(true);
    }
  };

  // Generate Kanban tasks from Schedule of Works
  const generateKanbanTasks = () => {
    const scheduleTasks: Task[] = [
      {
        id: "task-1",
        title: "Site Survey & Measurements",
        description: "Conduct detailed site survey and take all necessary measurements",
        status: "todo",
        priority: "high",
        progress: 0,
        assignedUsers: ["John", "Sarah"],
        comments: 5,
        likes: 12,
        estimatedHours: 4,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      },
      {
        id: "task-2",
        title: "Obtain Building Permits",
        description: "Submit permit applications and coordinate with local authorities",
        status: "todo",
        priority: "high",
        progress: 0,
        assignedUsers: ["Mike"],
        comments: 8,
        likes: 3,
        estimatedHours: 16,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 14 days from now
      },
      {
        id: "task-3",
        title: "Demolition & Site Preparation",
        description: "Remove existing fixtures and prepare site for new construction",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["David", "Alex"],
        comments: 15,
        likes: 7,
        estimatedHours: 24,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 21 days from now
      },
      {
        id: "task-4",
        title: "Electrical & Plumbing Rough-in",
        description: "Install electrical wiring and plumbing infrastructure",
        status: "todo",
        priority: "high",
        progress: 0,
        assignedUsers: ["Tom", "Lisa"],
        comments: 22,
        likes: 18,
        estimatedHours: 32,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 28 days from now
      },
      {
        id: "task-5",
        title: "Cabinetry Installation",
        description: "Install kitchen cabinets and hardware",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Sarah", "John"],
        comments: 11,
        likes: 9,
        estimatedHours: 20,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 35 days from now
      },
      {
        id: "task-6",
        title: "Countertop Installation",
        description: "Install and seal countertops",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["Mike"],
        comments: 6,
        likes: 4,
        estimatedHours: 12,
        dueDate: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 42 days from now
      },
      {
        id: "task-7",
        title: "Appliance Installation",
        description: "Install and test all kitchen appliances",
        status: "todo",
        priority: "medium",
        progress: 0,
        assignedUsers: ["David"],
        comments: 9,
        likes: 6,
        estimatedHours: 8,
        dueDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 49 days from now
      },
      {
        id: "task-8",
        title: "Final Inspection & Punch List",
        description: "Conduct final walkthrough and address any remaining items",
        status: "todo",
        priority: "high",
        progress: 0,
        assignedUsers: ["John", "Sarah", "Mike"],
        comments: 3,
        likes: 2,
        estimatedHours: 4,
        dueDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 56 days from now
      }
    ];

    setTasks(scheduleTasks);
    setShowKanban(true);
  };

  // Handle task updates
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  // Handle adding new tasks
  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
      assignedUsers: [],
      comments: 0,
      likes: 0
    };
    setTasks(prev => [...prev, task]);
  };

  // Handle deleting tasks
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  // Handle document download
  const handleDocumentDownload = (documentId: string) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: "downloaded" as const }
        : doc
    ));
    
    // Simulate download
    alert("Document downloaded successfully!");
  };

  // Render guided chat or open chat
  let chatContent;
  if (!openChat) {
    if (!sowReady) {
      // Show conversation so far, then current prompt and input
      chatContent = (
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="w-full max-w-xl mx-auto flex flex-col gap-2">
            {messages.map((msg, i) => (
              <div key={i} className={`p-2 rounded-lg max-w-[80%] text-black ${msg.role === "user" ? "ml-auto bg-white border border-gray-300" : "bg-gray-100"}`}>{msg.text}</div>
            ))}
          </div>
          <div className="text-lg font-semibold text-black mb-2 w-full max-w-xl text-left">{setupPrompts[setupStep].prompt}</div>
          <form className="w-full max-w-xl flex gap-2" onSubmit={e => { e.preventDefault(); if (setupInput.trim()) handleSetupAnswer(setupInput.trim()); }}>
            <input
              className="flex-1 px-4 py-2 rounded-xl border border-brixem-gray-200 text-black bg-white"
              value={setupInput}
              onChange={e => setSetupInput(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-brixem-primary text-white font-medium">Send</button>
          </form>
        </div>
      );
    } else if (!wbsReady) {
      chatContent = (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg font-semibold text-gray-800 mb-2">Your Scope of Works is ready! Check the documents panel to download it.</div>
          <button className="px-4 py-2 rounded-lg bg-brixem-primary text-white font-semibold" onClick={() => handleDocumentStep("sow")}>Continue to WBS</button>
        </div>
      );
    } else if (!scheduleReady) {
      chatContent = (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg font-semibold text-gray-800 mb-2">Your Work Breakdown Structure is ready! Check the documents panel to download it.</div>
          <button className="px-4 py-2 rounded-lg bg-brixem-primary text-white font-semibold" onClick={() => handleDocumentStep("wbs")}>Continue to Schedule</button>
        </div>
      );
    } else if (!costReady) {
      chatContent = (
        <div className="flex flex-col items-center gap-4">
          <div className="text-lg font-semibold text-gray-800 mb-2">Your Schedule of Works is ready! Check the documents panel to download it.</div>
          <button className="px-4 py-2 rounded-lg bg-brixem-primary text-white font-semibold" onClick={() => handleDocumentStep("schedule")}>Start AI Chat</button>
        </div>
      );
    } else {
      setOpenChat(true);
    }
  }

  // Ref for auto-scrolling chat to bottom
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, setupStep]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      {/* Removed Sidebar component */}
      
            {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
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
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {(user as any) ? `Welcome, ${(user as any).name.split(' ')[0]}!` : 'Welcome!'}
                </h1>
              </div>
              {(user as any) && (
                <div className="flex items-center gap-4">
                  {/* Documents Panel Toggle */}
                  <button
                    onClick={() => setDocumentsPanelOpen(!documentsPanelOpen)}
                    className={`p-2 rounded-lg transition ${
                      documentsPanelOpen 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                    }`}
                    title="Documents"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setShowChat(true)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center">
                      <span className="text-white font-medium text-sm">{(user as any).name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{(user as any).name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main dashboard content */}
        <main className="flex-1 relative overflow-hidden bg-gray-50">
          {isTransitioning ? (
            // Transition screen
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your project board...</h2>
                <p className="text-gray-600">Generating tasks and preparing your workspace</p>
              </div>
            </div>
          ) : !showKanban ? (
            // Initial chat interface for project setup
            <div className="absolute bottom-0 left-0 right-0 h-full flex flex-col" style={{ background: 'linear-gradient(90deg, #d1d1d1 0%, #c9c9c9 100%)' }}>
              <div className="flex-1 flex flex-col justify-end p-3 sm:p-4 lg:p-6">
                <div className="max-w-3xl mx-auto w-full">
                  {/* Chat messages */}
                  <div className="flex flex-col gap-3 mb-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                      >
                        <div
                          className={`px-3 sm:px-4 py-2 rounded-2xl text-sm sm:text-base max-w-[85%] sm:max-w-[70%] break-words shadow-sm transition-all ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white'
                              : 'bg-gray-100 text-black'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {/* Guided flow prompt */}
                    {!openChat && !sowReady && (
                      <div className="text-base sm:text-lg font-semibold text-black mb-2 w-full text-left">
                        {setupPrompts[setupStep].prompt}
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Input area - fixed at bottom */}
                  <form
                    className="flex items-center gap-2 sm:gap-3 w-full"
                    onSubmit={e => {
                      e.preventDefault();
                      if (!openChat && !sowReady) {
                        if (setupInput.trim()) handleSetupAnswer(setupInput.trim());
                      } else if (setupInput.trim()) {
                        handleSend(setupInput.trim());
                      }
                      setSetupInput("");
                    }}
                  >
                    <input
                      className="flex-1 px-3 sm:px-5 py-2 sm:py-3 rounded-full border border-gray-300 text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#23c6e6]/30 text-sm sm:text-base"
                      value={setupInput}
                      onChange={e => setSetupInput(e.target.value)}
                      placeholder="Send message to Brixem..."
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white font-semibold text-sm sm:text-base shadow hover:opacity-90 transition touch-manipulation"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            // Task management view
            <div className="h-full flex flex-col">
              <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Project Tasks</h2>
                    <p className="text-sm sm:text-base text-gray-600">Manage your renovation project tasks</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* View Toggle */}
                    <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-1">
                      <button
                        onClick={() => setCurrentView("kanban")}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition touch-manipulation ${
                          currentView === "kanban"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <span className="hidden sm:inline">Kanban</span>
                        <span className="sm:hidden">K</span>
                      </button>
                      <button
                        onClick={() => setCurrentView("list")}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition touch-manipulation ${
                          currentView === "list"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <span className="hidden sm:inline">List</span>
                        <span className="sm:hidden">L</span>
                      </button>
                      <button
                        onClick={() => setCurrentView("calendar")}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md transition touch-manipulation ${
                          currentView === "calendar"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-700 hover:text-gray-900"
                        }`}
                      >
                        <span className="hidden sm:inline">Calendar</span>
                        <span className="sm:hidden">C</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setDocumentsPanelOpen(!documentsPanelOpen)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition flex items-center gap-2 touch-manipulation ${
                        documentsPanelOpen 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="hidden sm:inline">Documents</span>
                      <span className="sm:hidden">Docs</span>
                    </button>
                    <button
                      onClick={() => setShowKanban(false)}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition touch-manipulation"
                    >
                      <span className="hidden sm:inline">Back to Setup</span>
                      <span className="sm:hidden">Back</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {currentView === "kanban" && (
                  <ListView
                    tasks={tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onAddTask={handleAddTask}
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
          )}
        </main>
      </div>

      {/* Documents Panel Overlay */}
      {documentsPanelOpen && (
        <>
          {/* Backdrop - Only covers the right side */}
          <div 
            className="fixed top-0 right-0 h-full w-full sm:w-80 bg-black bg-opacity-30 z-40"
            onClick={() => setDocumentsPanelOpen(false)}
          />
          
          {/* Documents Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              <div className="p-3 sm:p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    onClick={() => setDocumentsPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors touch-manipulation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                {documents.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm sm:text-base">No documents generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm sm:text-base">{doc.name}</h4>
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
                          <div className="mt-3 flex flex-col sm:flex-row gap-2">
                            <button
                              onClick={() => handleDocumentDownload(doc.id)}
                              className="px-3 py-1 text-xs bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-md hover:opacity-90 transition touch-manipulation"
                            >
                              Download PDF
                            </button>
                            {doc.type === "sow" && (
                              <button
                                onClick={() => handleDocumentDownload(doc.id)}
                                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition touch-manipulation"
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
      {/* Removed AuthModal, ProjectWizard, and FloatingChat if they are not imported or used */}
      {/* Floating Chat Widget - Only show when Kanban board is active */}
      {showKanban && (
        <ChatModal
          onSend={handleSend}
          messages={messages}
          placeholder="Ask about your project tasks or add new tasks..."
        />
      )}
    </div>
  );
} 