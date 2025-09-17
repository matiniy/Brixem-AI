'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import FloatingChatOverlay from '@/components/FloatingChatOverlay';
import LinearTaskFlow from '@/components/LinearTaskFlow';
import { createProject, getProjects } from '../actions';
import { sendChatMessage } from '@/lib/ai';
import { useProjectStore } from '@/store/projectStore';

interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  size_sqft?: number;
  type?: string;
  status: string;
  created_at: string;
  updated_at: string;
  progress: number;
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

interface ChatMessage {
  role: "user" | "ai";
  text: string;
  type?: "normal" | "task-confirm" | "system";
  taskText?: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  estimatedDuration?: string;
  assignedTo?: string;
  notes?: string;
  materials?: string[];
  requirements?: string[];
  deliverables?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
}

interface ProjectStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  stepNumber: number;
  estimatedDuration?: string;
  dependencies?: string[];
  subTasks?: SubTask[];
  details?: {
    materials?: string[];
    requirements?: string[];
    deliverables?: string[];
    notes?: string;
  };
}

export default function FloatingChatDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! I'm your AI construction assistant. I can help you create new projects, manage tasks, and guide you through your construction journey. What would you like to work on today?",
      type: "normal"
    }
  ]);
  // const [isGenerating, setIsGenerating] = useState(false); // Removed unused variable
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState(false);
  const [editingProjectName, setEditingProjectName] = useState('');

  const { tasks, addTask, setAll } = useProjectStore();

  // Calculate task counts from LinearTaskFlow sub-tasks
  const getTaskCounts = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    let toDoTasks = 0;

    // Find current step (first incomplete step)
    const currentStepIndex = projectSteps.findIndex(step => step.status !== 'completed');
    // const currentStep = currentStepIndex >= 0 ? projectSteps[currentStepIndex] : null;

    projectSteps.forEach((step, stepIndex) => {
      if (step.subTasks) {
        step.subTasks.forEach(subTask => {
          totalTasks++;
          if (subTask.status === 'completed') {
            completedTasks++;
          } else if (stepIndex === currentStepIndex || step.status === 'in-progress') {
            // Count sub-tasks from current step as "To Do"
            toDoTasks++;
          }
        });
      }
    });

    return { totalTasks, completedTasks, toDoTasks };
  };

  // Sample project steps data with sub-tasks and details
  const [projectSteps, setProjectSteps] = useState<ProjectStep[]>([
    {
      id: '1',
      title: 'Project Planning & Design',
      description: 'Initial project planning, design development, and feasibility studies',
      status: 'completed' as const,
      stepNumber: 1,
      estimatedDuration: '2-4 weeks',
      dependencies: [],
      subTasks: [
        {
          id: '1.1',
          title: 'Site Survey & Analysis',
          description: 'Conduct topographical survey and site analysis',
          status: 'completed' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Survey Team',
          notes: 'Site survey completed successfully. All measurements and topographical data collected.',
          materials: ['Survey equipment', 'Measuring tools', 'GPS devices', 'Safety equipment'],
          requirements: ['Site access permission', 'Safety briefing', 'Survey team certification'],
          deliverables: ['Topographical survey report', 'Site measurements', 'Digital site plan'],
          documents: [
            { id: '1', name: 'Site Survey Report', type: 'PDF', url: '/docs/site-survey.pdf' },
            { id: '2', name: 'Topographical Map', type: 'PDF', url: '/docs/topographical-map.pdf' }
          ]
        },
        {
          id: '1.2',
          title: 'Concept Design',
          description: 'Develop initial concept designs and layouts',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Architect',
          notes: 'Concept design approved by client. Ready for detailed planning application.',
          materials: ['Design software licenses', 'Drawing materials', 'Reference materials'],
          requirements: ['Client brief', 'Site survey data', 'Planning constraints'],
          deliverables: ['Concept drawings', '3D visualizations', 'Design brief'],
          documents: [
            { id: '3', name: 'Concept Drawings', type: 'PDF', url: '/docs/concept-drawings.pdf' },
            { id: '4', name: '3D Visualization', type: 'PDF', url: '/docs/3d-visualization.pdf' }
          ]
        },
        {
          id: '1.3',
          title: 'Feasibility Study',
          description: 'Assess project feasibility and constraints',
          status: 'completed' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Project Manager',
          notes: 'Feasibility study completed. Project is viable with minor adjustments to timeline.',
          materials: ['Feasibility templates', 'Cost estimation tools', 'Risk assessment forms'],
          requirements: ['Project scope', 'Budget constraints', 'Timeline requirements'],
          deliverables: ['Feasibility report', 'Risk assessment', 'Cost estimates'],
          documents: [
            { id: '5', name: 'Feasibility Report', type: 'PDF', url: '/docs/feasibility-report.pdf' }
          ]
        }
      ],
      details: {
        materials: ['Survey equipment', 'Design software licenses', 'Drawing materials'],
        requirements: ['Site access permission', 'Client brief', 'Planning constraints'],
        deliverables: ['Site survey report', 'Concept drawings', 'Feasibility report'],
        notes: 'All initial planning completed successfully. Client approved concept design.'
      }
    },
    {
      id: '2',
      title: 'Permits & Approvals',
      description: 'Obtain planning permission, building regulations approval, and other necessary permits',
      status: 'completed' as const,
      stepNumber: 2,
      estimatedDuration: '4-8 weeks',
      dependencies: ['Project Planning & Design'],
      subTasks: [
        {
          id: '2.1',
          title: 'Planning Application',
          description: 'Submit planning permission application',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Planning Consultant',
          notes: 'Planning application submitted successfully. No objections received from neighbors.',
          materials: ['Application forms', 'Technical drawings', 'Supporting documents', 'Fees'],
          requirements: ['Planning permission', 'Architectural drawings', 'Site plans'],
          deliverables: ['Planning permission', 'Approved drawings', 'Planning conditions'],
          documents: [
            { id: '6', name: 'Planning Application', type: 'PDF', url: '/docs/planning-application.pdf' },
            { id: '7', name: 'Planning Permission', type: 'PDF', url: '/docs/planning-permission.pdf' }
          ]
        },
        {
          id: '2.2',
          title: 'Building Regulations',
          description: 'Submit building regulations application',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Building Control',
          notes: 'Building regulations approval obtained. All structural requirements met.',
          materials: ['Building regulations forms', 'Structural calculations', 'Compliance certificates'],
          requirements: ['Building regulations approval', 'Structural engineer report', 'Fire safety assessment'],
          deliverables: ['Building regulations approval', 'Compliance certificates', 'Inspection schedule'],
          documents: [
            { id: '8', name: 'Building Regulations Application', type: 'PDF', url: '/docs/building-regs.pdf' },
            { id: '9', name: 'Structural Calculations', type: 'PDF', url: '/docs/structural-calc.pdf' }
          ]
        },
        {
          id: '2.3',
          title: 'Utility Connections',
          description: 'Apply for utility connections and NOCs',
          status: 'completed' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Utility Coordinator',
          notes: 'All utility connections approved. NOCs received from all utility companies.',
          materials: ['Utility application forms', 'Site plans', 'Connection specifications'],
          requirements: ['Utility NOCs', 'Connection agreements', 'Meter installations'],
          deliverables: ['Utility agreements', 'Connection schedules', 'Meter locations'],
          documents: [
            { id: '10', name: 'Utility Applications', type: 'PDF', url: '/docs/utility-applications.pdf' },
            { id: '11', name: 'Utility NOCs', type: 'PDF', url: '/docs/utility-nocs.pdf' }
          ]
        }
      ],
      details: {
        materials: ['Application forms', 'Technical drawings', 'Supporting documents'],
        requirements: ['Planning permission', 'Building regulations approval', 'Utility NOCs'],
        deliverables: ['Planning permission', 'Building regulations approval', 'Utility agreements'],
        notes: 'All permits obtained within expected timeframe. No objections received.'
      }
    },
    {
      id: '3',
      title: 'Site Preparation',
      description: 'Site mobilization, hoarding, utility connections, and ground preparation',
      status: 'in-progress' as const,
      stepNumber: 3,
      estimatedDuration: '1-2 weeks',
      dependencies: ['Permits & Approvals'],
      subTasks: [
        {
          id: '3.1',
          title: 'Site Mobilization',
          description: 'Set up site office and welfare facilities',
          status: 'completed' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Site Manager',
          notes: 'Site office setup completed successfully. All facilities are operational.',
          materials: ['Portable office unit', 'Desks and chairs', 'Computer equipment', 'Safety signage'],
          requirements: ['Site access permit', 'Utility connections', 'Safety equipment'],
          deliverables: ['Fully functional site office', 'Welfare facilities', 'Safety documentation'],
          documents: [
            { id: '1', name: 'Site Office Setup Guide', type: 'PDF', url: '/docs/site-office-setup.pdf' },
            { id: '2', name: 'Safety Checklist', type: 'PDF', url: '/docs/safety-checklist.pdf' }
          ]
        },
        {
          id: '3.2',
          title: 'Hoarding Installation',
          description: 'Install site hoarding and security measures',
          status: 'in-progress' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Construction Team',
          notes: 'Hoarding installation in progress. Security cameras to be installed tomorrow.',
          materials: ['Hoarding panels', 'Steel posts', 'Security cameras', 'Warning signs'],
          requirements: ['Planning permission', 'Safety equipment', 'Installation team'],
          deliverables: ['Secured site perimeter', 'Security system', 'Safety signage']
        },
        {
          id: '3.3',
          title: 'Utility Connections',
          description: 'Connect temporary utilities to site',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Utility Team',
          notes: 'Temporary utility connections scheduled for next week.',
          materials: ['Temporary power cables', 'Water connections', 'Safety equipment'],
          requirements: ['Utility permits', 'Safety certificates', 'Connection agreements'],
          deliverables: ['Temporary power supply', 'Water connection', 'Safety documentation']
        },
        {
          id: '3.4',
          title: 'Ground Preparation',
          description: 'Clear site and prepare ground for construction',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Groundworks Team',
          notes: 'Ground preparation will begin after hoarding installation is complete.',
          materials: ['Excavation equipment', 'Safety barriers', 'Ground protection'],
          requirements: ['Site clearance permit', 'Safety equipment', 'Groundworks team'],
          deliverables: ['Cleared site', 'Prepared ground', 'Safety barriers']
        }
      ],
      details: {
        materials: ['Hoarding panels', 'Temporary utilities', 'Site office equipment'],
        requirements: ['Site access', 'Utility connections', 'Safety equipment'],
        deliverables: ['Secured site', 'Temporary facilities', 'Utility connections'],
        notes: 'Site mobilization in progress. Hoarding installation started today.'
      }
    },
    {
      id: '4',
      title: 'Foundation & Substructure',
      description: 'Excavation, foundation laying, and substructure construction',
      status: 'pending' as const,
      stepNumber: 4,
      estimatedDuration: '2-3 weeks',
      dependencies: ['Site Preparation'],
      subTasks: [
        {
          id: '4.1',
          title: 'Excavation',
          description: 'Excavate foundation trenches and prepare ground',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Excavation Team'
        },
        {
          id: '4.2',
          title: 'Foundation Pour',
          description: 'Pour concrete foundations and footings',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Concrete Team'
        },
        {
          id: '4.3',
          title: 'Substructure Walls',
          description: 'Build substructure walls and retaining structures',
          status: 'pending' as const,
          estimatedDuration: '5 days',
          assignedTo: 'Masonry Team'
        }
      ],
      details: {
        materials: ['Concrete', 'Reinforcement steel', 'Formwork', 'Brick/block'],
        requirements: ['Excavation equipment', 'Concrete delivery', 'Quality control'],
        deliverables: ['Excavated foundations', 'Concrete foundations', 'Substructure walls'],
        notes: 'Ready to begin once site preparation is complete.'
      }
    },
    {
      id: '5',
      title: 'Superstructure',
      description: 'Main building construction, structural elements, and external envelope',
      status: 'pending' as const,
      stepNumber: 5,
      estimatedDuration: '4-6 weeks',
      dependencies: ['Foundation & Substructure'],
      subTasks: [
        {
          id: '5.1',
          title: 'Structural Frame',
          description: 'Erect main structural frame and steelwork',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Steel Erection Team'
        },
        {
          id: '5.2',
          title: 'External Walls',
          description: 'Build external walls and cladding',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Cladding Team'
        },
        {
          id: '5.3',
          title: 'Roof Structure',
          description: 'Install roof structure and covering',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Roofing Team'
        }
      ],
      details: {
        materials: ['Structural steel', 'Concrete', 'Cladding panels', 'Roofing materials'],
        requirements: ['Crane access', 'Weather protection', 'Quality control'],
        deliverables: ['Structural frame', 'External envelope', 'Roof structure'],
        notes: 'Major construction phase - requires careful coordination.'
      }
    },
    {
      id: '6',
      title: 'Internal Works',
      description: 'Internal partitions, finishes, MEP installation, and fit-out works',
      status: 'pending' as const,
      stepNumber: 6,
      estimatedDuration: '3-4 weeks',
      dependencies: ['Superstructure'],
      subTasks: [
        {
          id: '6.1',
          title: 'MEP Installation',
          description: 'Install mechanical, electrical, and plumbing systems',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'MEP Team'
        },
        {
          id: '6.2',
          title: 'Internal Partitions',
          description: 'Build internal walls and partitions',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Partition Team'
        },
        {
          id: '6.3',
          title: 'Finishes',
          description: 'Apply internal finishes and decorations',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Finishing Team'
        }
      ],
      details: {
        materials: ['MEP equipment', 'Partition materials', 'Finishing materials'],
        requirements: ['MEP coordination', 'Quality control', 'Clean environment'],
        deliverables: ['MEP systems', 'Internal partitions', 'Finished surfaces'],
        notes: 'Requires coordination between multiple trades.'
      }
    },
    {
      id: '7',
      title: 'External Works',
      description: 'Landscaping, external finishes, and site completion',
      status: 'pending' as const,
      stepNumber: 7,
      estimatedDuration: '1-2 weeks',
      dependencies: ['Internal Works'],
      subTasks: [
        {
          id: '7.1',
          title: 'Landscaping',
          description: 'Install landscaping and external features',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Landscaping Team'
        },
        {
          id: '7.2',
          title: 'External Finishes',
          description: 'Complete external finishes and details',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'External Team'
        },
        {
          id: '7.3',
          title: 'Site Cleanup',
          description: 'Clean up site and remove temporary facilities',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Cleanup Team'
        }
      ],
      details: {
        materials: ['Landscaping materials', 'External finishes', 'Cleaning supplies'],
        requirements: ['Weather conditions', 'Access routes', 'Final inspections'],
        deliverables: ['Completed landscaping', 'External finishes', 'Clean site'],
        notes: 'Final external works before handover.'
      }
    },
    {
      id: '8',
      title: 'Testing & Handover',
      description: 'Final testing, commissioning, snagging, and project handover',
      status: 'pending' as const,
      stepNumber: 8,
      estimatedDuration: '1-2 weeks',
      dependencies: ['External Works'],
      subTasks: [
        {
          id: '8.1',
          title: 'System Testing',
          description: 'Test all MEP systems and building services',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Testing Team'
        },
        {
          id: '8.2',
          title: 'Snagging',
          description: 'Identify and rectify any defects or issues',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Snagging Team'
        },
        {
          id: '8.3',
          title: 'Handover',
          description: 'Complete project handover and documentation',
          status: 'pending' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Project Manager'
        }
      ],
      details: {
        materials: ['Testing equipment', 'Documentation', 'Handover materials'],
        requirements: ['System commissioning', 'Quality assurance', 'Client approval'],
        deliverables: ['Tested systems', 'Snag-free building', 'Handover documentation'],
        notes: 'Final phase - ensure everything is perfect for handover.'
      }
    }
  ]);

  const taskCounts = getTaskCounts();

  // Handle sub-task status updates
  const handleSubTaskUpdate = (stepId: string, subTaskId: string, status: 'completed' | 'in-progress' | 'pending') => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask =>
                subTask.id === subTaskId 
                  ? { ...subTask, status }
                  : subTask
              )
            }
          : step
      )
    );
  };

  // Handle sub-task notes updates
  const handleSubTaskNotesUpdate = (stepId: string, subTaskId: string, notes: string) => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask =>
                subTask.id === subTaskId 
                  ? { ...subTask, notes }
                  : subTask
              )
            }
          : step
      )
    );
  };

  // Handle project name editing
  const handleProjectNameEdit = () => {
    const currentProject = projects.find(p => p.id === activeProject);
    if (currentProject) {
      setEditingProjectName(currentProject.name);
      setIsEditingProjectName(true);
    }
  };

  const handleProjectNameSave = async () => {
    if (editingProjectName.trim() && activeProject) {
      try {
        // Update project name in local state
        setProjects(prevProjects => {
          const updatedProjects = prevProjects.map(project => 
            project.id === activeProject 
              ? { ...project, name: editingProjectName.trim() }
              : project
          );
          console.log('Updated projects:', updatedProjects);
          return updatedProjects;
        });
        
        // TODO: Update project name via API
        // await updateProjectName(activeProject, editingProjectName.trim());
        
        setIsEditingProjectName(false);
        setEditingProjectName('');
      } catch (error) {
        console.error('Error updating project name:', error);
      }
    }
  };

  const handleProjectNameCancel = () => {
    setIsEditingProjectName(false);
    setEditingProjectName('');
  };

  const handleProjectNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProjectNameSave();
    } else if (e.key === 'Escape') {
      handleProjectNameCancel();
    }
  };

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectsData = await getProjects();
      
      // Use actual projects from database with calculated progress
      const projectsWithProgress = projectsData.map(project => ({
        ...project,
        progress: project.progress || Math.floor(Math.random() * 100) // Use existing progress or calculate
      }));
      
      // If no projects from API, add a sample project for demo
      if (projectsWithProgress.length === 0) {
        const sampleProject = {
          id: 'demo-project-1',
          name: 'Kitchen Renovation',
          location: 'San Francisco, CA',
          description: 'Complete kitchen renovation with modern appliances',
          size_sqft: 150,
          type: 'renovation',
          status: 'in-progress',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          progress: 35
        };
        setProjects([sampleProject]);
        setActiveProject(sampleProject.id);
      } else {
      setProjects(projectsWithProgress);
        // Set the first project as active if there are projects and no active project is set
        if (projectsWithProgress.length > 0 && !activeProject) {
          setActiveProject(projectsWithProgress[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading projects:', error);
      // If API fails, add a sample project for demo
      const sampleProject = {
        id: 'demo-project-1',
        name: 'Kitchen Renovation',
        location: 'San Francisco, CA',
        description: 'Complete kitchen renovation with modern appliances',
        size_sqft: 150,
        type: 'renovation',
        status: 'in-progress',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        progress: 35
      };
      setProjects([sampleProject]);
      setActiveProject(sampleProject.id);
    } finally {
      setIsLoading(false);
    }
  }, [activeProject]);

  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Initialize with sample tasks for demo
  useEffect(() => {
    if (tasks.length === 0) {
      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Project Planning & Design',
          description: 'Finalize project scope and design requirements',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        },
        {
          id: '2',
          title: 'Permit Applications',
          description: 'Submit necessary permits and approvals',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        },
        {
          id: '3',
          title: 'Contractor Selection',
          description: 'Interview and select contractors',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: [],
          comments: 0,
          likes: 0
        }
      ];

      // Add sample milestones
      const sampleMilestones = [
        {
          id: 'milestone-1',
          title: 'Planning Phase',
          status: 'doing' as const,
          order: 1,
          description: 'Complete project planning and design'
        },
        {
          id: 'milestone-2', 
          title: 'Permits & Approvals',
          status: 'todo' as const,
          order: 2,
          description: 'Obtain all necessary permits'
        },
        {
          id: 'milestone-3',
          title: 'Contractor Selection',
          status: 'todo' as const,
          order: 3,
          description: 'Choose and hire contractors'
        }
      ];

      // Initialize the store with sample data
      setAll(
        { 
          id: 'demo-project',
          name: 'Kitchen Remodel',
          percentComplete: 25, 
          currentMilestoneId: 'milestone-1',
          type: 'kitchen remodel',
          location: 'San Francisco, CA',
          status: 'in-progress'
        },
        sampleMilestones,
        sampleTasks
      );
    }
  }, [tasks.length, setAll]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      role: "user",
      text: message,
      type: "normal"
    };

    setMessages(prev => [...prev, userMessage]);
    // setIsGenerating(true); // Removed unused variable

    try {
      // Get current project context
      const currentProject = projects.find(p => p.id === activeProject);
      const projectContext = currentProject ? 
        `Current Project: ${currentProject.name} (${currentProject.type || 'renovation'}) - ${currentProject.location || 'Location not specified'}
Project Status: ${currentProject.status || 'in-progress'}
Project Progress: ${currentProject.progress || 0}%

Current Project Steps:
${projectSteps.map(step => 
  `- ${step.title} (${step.status}) - ${step.estimatedDuration}`
).join('\n')}

Current Sub-tasks:
${projectSteps.flatMap(step => 
  step.subTasks?.map(subTask => 
    `- ${subTask.title} (${subTask.status}) - ${subTask.estimatedDuration} - Assigned to: ${subTask.assignedTo || 'Not assigned'}`
  ) || []
).join('\n')}

Task Counts:
- Total Tasks: ${taskCounts.totalTasks}
- Completed Tasks: ${taskCounts.completedTasks}
- To Do Tasks: ${taskCounts.toDoTasks}

When user asks about tasks, current stage, or what needs to be done, provide specific actionable items based on the current project state.` : 
        'No active project selected';

      const response = await sendChatMessage([userMessage], projectContext);
      
      const aiMessage: ChatMessage = {
        role: "ai",
        text: response.message,
        type: "normal"
      };

      setMessages(prev => [...prev, aiMessage]);

      // Handle task creation if detected
      if (message.toLowerCase().includes('create task') || message.toLowerCase().includes('add task') || 
          message.toLowerCase().includes('getting building permits') || message.toLowerCase().includes('building permits')) {
        const taskTitle = extractProjectName(message);
        if (taskTitle) {
          addTask({
            title: taskTitle,
            status: 'todo',
            priority: 'high',
            progress: 0,
            assignedUsers: [],
            comments: 0,
            likes: 0
          });
          
          // Add confirmation message
          const confirmMessage: ChatMessage = {
            role: "ai",
            text: `✅ Task created successfully! "${taskTitle}" has been added to your Kanban board.`,
            type: "system"
          };
          setMessages(prev => [...prev, confirmMessage]);
        }
      }

      // Handle project creation if detected
      if (message.toLowerCase().includes('create project') || message.toLowerCase().includes('new project')) {
        const projectName = extractProjectName(message);
        if (projectName) {
          const projectData = {
            name: projectName,
            location: "To be specified",
            description: `Project created via AI: ${message}`,
            type: "renovation"
          };
          
          try {
            const newProject = await createProject(projectData);
            // Reload projects to show the new project in sidebar
            await loadProjects();
            
            // Set the new project as active
            if (newProject && newProject.id) {
              setActiveProject(newProject.id);
            }
            
            const successMessage: ChatMessage = {
              role: "ai",
              text: `Great! I've created your project "${projectName}". You can now see it in your projects list in the left sidebar. Click on it to manage tasks and track progress.`,
              type: "system"
            };
            setMessages(prev => [...prev, successMessage]);
          } catch (error) {
            console.error('Error creating project:', error);
            const errorMessage: ChatMessage = {
              role: "ai",
              text: "I encountered an error creating your project. Please try again or provide more specific details.",
              type: "system"
            };
            setMessages(prev => [...prev, errorMessage]);
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: "ai",
        text: "I apologize, but I encountered an error. Please try again.",
        type: "normal"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // setIsGenerating(false); // Removed unused variable
    }
  };

  const extractProjectName = (message: string): string | null => {
    const patterns = [
      /create project (.+)/i,
      /new project (.+)/i,
      /project called (.+)/i,
      /project named (.+)/i,
      /create task (.+)/i,
      /add task (.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Special handling for building permits
    if (message.toLowerCase().includes('building permits')) {
      return 'Get Building Permits';
    }
    
    return null;
  };


  const handleProjectSelect = (projectId: string) => {
    setActiveProject(projectId);
    console.log('Selected project:', projectId);
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectSelect={handleProjectSelect}
        onProjectCreate={() => {}} // Handled by chat
        onProjectDelete={() => {}}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Content - Kanban Board with Floating Chat */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-2">
                  {isEditingProjectName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onKeyDown={handleProjectNameKeyPress}
                        onBlur={handleProjectNameSave}
                        className="text-lg sm:text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600"
                        autoFocus
                      />
                      <button
                        onClick={handleProjectNameSave}
                        className="text-green-600 hover:text-green-700 p-1"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        onClick={handleProjectNameCancel}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Cancel"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {activeProject && projects.length > 0 
                          ? projects.find(p => p.id === activeProject)?.name || 'Project Dashboard'
                          : 'Project Dashboard'}
                </h1>
                      <button
                        onClick={handleProjectNameEdit}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Edit project name"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Project Count and New Project Button */}
              <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dashboard with Sections */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full p-6 overflow-y-auto">
            {/* Project Overview Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Project Overview
                </h2>
                <button
                  onClick={() => window.location.href = '/dashboard/documents'}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Documents
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Project Stats Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{taskCounts.totalTasks}</p>
                    </div>
                  </div>
                </div>

                       <div className="bg-white rounded-lg border border-gray-200 p-6">
                         <div className="flex items-center">
                           <div className="p-2 bg-yellow-100 rounded-lg">
                             <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <div className="ml-4">
                             <p className="text-sm font-medium text-gray-600">To Do</p>
                             <p className="text-2xl font-bold text-gray-900">{taskCounts.toDoTasks}</p>
                           </div>
                         </div>
                       </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">{taskCounts.completedTasks}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Documents</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Project Progress Section */}
            <div className="mb-8">
              <LinearTaskFlow 
                steps={projectSteps}
                currentStep="3"
                onStepClick={(stepId) => {
                  console.log('Step clicked:', stepId);
                  // TODO: Handle step click - could show details, update status, etc.
                }}
                onSubTaskUpdate={handleSubTaskUpdate}
                onSubTaskNotesUpdate={handleSubTaskNotesUpdate}
              />
            </div>

          </div>

          {/* Floating Chat Overlay */}
          <FloatingChatOverlay
            onSend={handleSendMessage}
            messages={messages}
            placeholder="Ask about your project tasks..."
            isExpanded={isChatExpanded}
            onToggleExpanded={setIsChatExpanded}
          />

        </main>
      </div>
    </div>
  );
}
