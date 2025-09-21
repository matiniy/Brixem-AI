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
  deliverables?: Array<{
    id: string;
    title: string;
    status: 'pending' | 'completed';
  }>;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
  }>;
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

  // Sample project steps data with sub-tasks and details (Streamlined to 6 steps)
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
          title: 'Site Survey & Design',
          description: 'Complete site survey and develop architectural designs',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Design Team',
          notes: 'Site survey completed and architectural design approved by client.',
          materials: ['Survey equipment', 'Design software', 'Drawing materials'],
          requirements: ['Site access', 'Client approval', 'Planning compliance'],
          deliverables: [
            { id: 'd1', title: 'Site survey report', status: 'completed' as const },
            { id: 'd2', title: 'Architectural drawings', status: 'completed' as const },
            { id: 'd3', title: '3D visualization', status: 'completed' as const }
          ],
          documents: [
            { id: '1', name: 'Site Survey Report', type: 'PDF', url: '/docs/site-survey.pdf' },
            { id: '2', name: 'Architectural Drawings', type: 'PDF', url: '/docs/architectural-drawings.pdf' }
          ]
        },
        {
          id: '1.2',
          title: 'Engineering Design',
          description: 'Complete structural and MEP engineering design',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Engineering Team',
          notes: 'All engineering designs completed and approved.',
          materials: ['Engineering software', 'Calculation tools'],
          requirements: ['Design standards', 'Building regulations'],
          deliverables: [
            { id: 'd4', title: 'Structural calculations', status: 'completed' as const },
            { id: 'd5', title: 'MEP design package', status: 'completed' as const }
          ],
          documents: [
            { id: '3', name: 'Structural Calculations', type: 'PDF', url: '/docs/structural-calculations.pdf' },
            { id: '4', name: 'MEP Drawings', type: 'PDF', url: '/docs/mep-drawings.pdf' }
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
          title: 'Planning Permission',
          description: 'Submit and obtain planning permission',
          status: 'completed' as const,
          estimatedDuration: '4 weeks',
          assignedTo: 'Planning Consultant',
          notes: 'Planning permission obtained with no objections.',
          materials: ['Planning forms', 'Technical drawings', 'Application fees'],
          requirements: ['Planning permission', 'Community consultation'],
          deliverables: [
            { id: 'd6', title: 'Planning permission certificate', status: 'completed' as const },
            { id: 'd7', title: 'Approved drawings', status: 'completed' as const }
          ],
          documents: [
            { id: '5', name: 'Planning Permission', type: 'PDF', url: '/docs/planning-permission.pdf' }
          ]
        },
        {
          id: '2.2',
          title: 'Building Regulations & Utilities',
          description: 'Obtain building regulations approval and utility connections',
          status: 'completed' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Compliance Team',
          notes: 'All approvals and utility connections secured.',
          materials: ['Compliance documentation', 'Utility applications'],
          requirements: ['Building regulations', 'Utility connections'],
          deliverables: [
            { id: 'd8', title: 'Building regulations approval', status: 'completed' as const },
            { id: 'd9', title: 'Utility connection agreements', status: 'completed' as const }
          ],
          documents: [
            { id: '6', name: 'Building Regulations Approval', type: 'PDF', url: '/docs/building-regs.pdf' },
            { id: '7', name: 'Utility Agreements', type: 'PDF', url: '/docs/utility-agreements.pdf' }
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
          title: 'Site Setup & Security',
          description: 'Establish site facilities and install security hoarding',
          status: 'completed' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Site Manager',
          notes: 'Site office and welfare facilities operational. Security hoarding installed.',
          materials: ['Site office', 'Welfare facilities', 'Hoarding panels', 'Security systems'],
          requirements: ['Site access', 'Safety compliance', 'Security certification'],
          deliverables: [
            { id: 'd10', title: 'Site office and facilities', status: 'completed' as const },
            { id: 'd11', title: 'Security hoarding installed', status: 'completed' as const }
          ],
          documents: [
            { id: '8', name: 'Site Setup Checklist', type: 'PDF', url: '/docs/site-setup.pdf' }
          ]
        },
        {
          id: '3.2',
          title: 'Ground Preparation',
          description: 'Clear site and prepare ground for construction',
          status: 'in-progress' as const,
          estimatedDuration: '4 days',
          assignedTo: 'Groundworks Team',
          notes: 'Site clearance in progress. Ground preparation will begin next week.',
          materials: ['Excavation equipment', 'Demolition tools', 'Safety equipment'],
          requirements: ['Clearance permits', 'Safety equipment', 'Environmental compliance'],
          deliverables: [
            { id: 'd12', title: 'Site cleared and leveled', status: 'pending' as const },
            { id: 'd13', title: 'Ground prepared for construction', status: 'pending' as const }
          ],
          documents: [
            { id: '9', name: 'Site Clearance Plan', type: 'PDF', url: '/docs/site-clearance.pdf' }
          ]
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
      title: 'Construction',
      description: 'Foundation, substructure, superstructure, and main building construction',
      status: 'pending' as const,
      stepNumber: 4,
      estimatedDuration: '6-9 weeks',
      dependencies: ['Site Preparation'],
      subTasks: [
        {
          id: '4.1',
          title: 'Foundation Work',
          description: 'Excavate and construct foundations',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Groundworks Team',
          notes: 'Foundation work will begin after ground preparation is complete.',
          materials: ['Excavation equipment', 'Concrete', 'Reinforcement steel'],
          requirements: ['Excavation permits', 'Concrete delivery', 'Quality control'],
          deliverables: [
            { id: 'd14', title: 'Foundation trenches excavated', status: 'pending' as const },
            { id: 'd15', title: 'Concrete foundations poured', status: 'pending' as const }
          ],
          documents: [
            { id: '10', name: 'Foundation Plan', type: 'PDF', url: '/docs/foundation-plan.pdf' }
          ]
        },
        {
          id: '4.2',
          title: 'Structural Frame',
          description: 'Erect main structural frame and floors',
          status: 'pending' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Steel Erection Team',
          notes: 'Steel frame erection requires crane access and careful sequencing.',
          materials: ['Structural steel', 'Crane equipment', 'Concrete'],
          requirements: ['Crane permits', 'Weather protection', 'Quality control'],
          deliverables: [
            { id: 'd16', title: 'Steel frame erected', status: 'pending' as const },
            { id: 'd17', title: 'Floor slabs constructed', status: 'pending' as const }
          ],
          documents: [
            { id: '11', name: 'Steel Erection Plan', type: 'PDF', url: '/docs/steel-erection.pdf' }
          ]
        },
        {
          id: '4.3',
          title: 'External Envelope',
          description: 'Construct external walls and roof',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Envelope Team',
          notes: 'External envelope construction requires weather protection.',
          materials: ['Cladding panels', 'Roofing materials', 'Insulation'],
          requirements: ['Weather conditions', 'Access equipment', 'Quality control'],
          deliverables: [
            { id: 'd18', title: 'External walls constructed', status: 'pending' as const },
            { id: 'd19', title: 'Roof structure completed', status: 'pending' as const }
          ],
          documents: [
            { id: '12', name: 'Envelope Installation Guide', type: 'PDF', url: '/docs/envelope-guide.pdf' }
          ]
        }
      ],
      details: {
        materials: ['Concrete', 'Steel', 'Cladding', 'Roofing materials'],
        requirements: ['Crane access', 'Weather protection', 'Quality control'],
        deliverables: ['Foundation', 'Structural frame', 'External envelope'],
        notes: 'Major construction phase - requires careful coordination and weather protection.'
      }
    },
    {
      id: '5',
      title: 'Finishing Works',
      description: 'Internal works, MEP installation, external works, and landscaping',
      status: 'pending' as const,
      stepNumber: 5,
      estimatedDuration: '4-6 weeks',
      dependencies: ['Construction'],
      subTasks: [
        {
          id: '5.1',
          title: 'MEP Installation',
          description: 'Install electrical, plumbing, and HVAC systems',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'MEP Team',
          notes: 'MEP installation requires coordination between electrical, plumbing, and HVAC trades.',
          materials: ['Electrical cables', 'Water pipes', 'HVAC units', 'Testing equipment'],
          requirements: ['MEP certification', 'Quality control', 'Safety protocols'],
          deliverables: [
            { id: 'd20', title: 'Electrical systems installed', status: 'pending' as const },
            { id: 'd21', title: 'Plumbing systems installed', status: 'pending' as const },
            { id: 'd22', title: 'HVAC systems installed', status: 'pending' as const }
          ],
          documents: [
            { id: '13', name: 'MEP Installation Plan', type: 'PDF', url: '/docs/mep-installation.pdf' }
          ]
        },
        {
          id: '5.2',
          title: 'Internal Finishes',
          description: 'Complete internal partitions, finishes, and decoration',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Finishing Team',
          notes: 'Internal finishing requires clean environment and careful coordination.',
          materials: ['Partition systems', 'Paint', 'Flooring', 'Decorative elements'],
          requirements: ['Clean environment', 'Quality control', 'Color matching'],
          deliverables: [
            { id: 'd23', title: 'Internal partitions installed', status: 'pending' as const },
            { id: 'd24', title: 'Wall finishes completed', status: 'pending' as const },
            { id: 'd25', title: 'Flooring installed', status: 'pending' as const }
          ],
          documents: [
            { id: '14', name: 'Finishing Specifications', type: 'PDF', url: '/docs/finishing-specs.pdf' }
          ]
        },
        {
          id: '5.3',
          title: 'External Works',
          description: 'Complete landscaping and external finishes',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'External Team',
          notes: 'External works require good weather conditions.',
          materials: ['Landscaping materials', 'External finishes', 'Cleaning supplies'],
          requirements: ['Weather conditions', 'Final inspections'],
          deliverables: [
            { id: 'd26', title: 'Landscaping completed', status: 'pending' as const },
            { id: 'd27', title: 'External finishes completed', status: 'pending' as const }
          ],
          documents: [
            { id: '15', name: 'Landscaping Plan', type: 'PDF', url: '/docs/landscaping-plan.pdf' }
          ]
        }
      ],
      details: {
        materials: ['MEP equipment', 'Partition materials', 'Finishing materials', 'Landscaping materials'],
        requirements: ['MEP coordination', 'Quality control', 'Clean environment', 'Weather conditions'],
        deliverables: ['MEP systems', 'Internal finishes', 'External works', 'Landscaping'],
        notes: 'Finishing phase requires coordination between multiple trades and clean environment.'
      }
    },
    {
      id: '6',
      title: 'Testing & Handover',
      description: 'Final testing, commissioning, snagging, and project handover',
      status: 'pending' as const,
      stepNumber: 6,
      estimatedDuration: '1-2 weeks',
      dependencies: ['Finishing Works'],
      subTasks: [
        {
          id: '6.1',
          title: 'Systems Testing & Commissioning',
          description: 'Test and commission all building systems',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Commissioning Team',
          notes: 'All building systems need to be tested and commissioned before handover.',
          materials: ['Testing equipment', 'Commissioning procedures'],
          requirements: ['System testing', 'Quality assurance', 'Safety compliance'],
          deliverables: [
            { id: 'd28', title: 'MEP systems commissioned', status: 'pending' as const },
            { id: 'd29', title: 'Safety systems tested', status: 'pending' as const }
          ],
          documents: [
            { id: '16', name: 'Commissioning Report', type: 'PDF', url: '/docs/commissioning-report.pdf' }
          ]
        },
        {
          id: '6.2',
          title: 'Final Inspections & Handover',
          description: 'Complete final inspections and project handover',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Project Manager',
          notes: 'Final inspections and handover to client with all documentation.',
          materials: ['Inspection checklists', 'Handover documentation', 'Keys'],
          requirements: ['Building control approval', 'Client approval', 'Documentation complete'],
          deliverables: [
            { id: 'd30', title: 'Final inspections passed', status: 'pending' as const },
            { id: 'd31', title: 'Project handover completed', status: 'pending' as const }
          ],
          documents: [
            { id: '17', name: 'Final Inspection Certificate', type: 'PDF', url: '/docs/final-inspection.pdf' },
            { id: '18', name: 'Handover Documentation', type: 'PDF', url: '/docs/handover-docs.pdf' }
          ]
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
    console.log('Updating sub-task:', subTaskId, 'in step:', stepId, 'to status:', status);
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

  const handleDeliverableUpdate = (stepId: string, subTaskId: string, deliverableId: string, status: 'completed' | 'pending') => {
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subTasks: step.subTasks?.map(subTask => 
                subTask.id === subTaskId 
                  ? {
                      ...subTask,
                      deliverables: subTask.deliverables?.map(deliverable => 
                        deliverable.id === deliverableId 
                          ? { ...deliverable, status }
                          : deliverable
                      )
                    }
                  : subTask
              )
            }
          : step
      )
    );
  };

  // Handle step completion
  const handleStepComplete = (stepId: string) => {
    console.log('Completing step:', stepId);
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === stepId 
          ? { ...step, status: 'completed' as const }
          : step
      )
    );
  };

  // Handle step advancement
  const handleStepAdvance = (currentStepId: string, nextStepId: string) => {
    console.log('Advancing from step:', currentStepId, 'to step:', nextStepId);
    setProjectSteps(prevSteps => 
      prevSteps.map(step => 
        step.id === nextStepId 
          ? { ...step, status: 'in-progress' as const }
          : step
      )
    );

    // Update project progress
    const completedSteps = projectSteps.filter(step => step.status === 'completed').length + 1; // +1 for the step we just completed
    const totalSteps = projectSteps.length;
    const newProgress = Math.round((completedSteps / totalSteps) * 100);

    console.log('Updating progress:', completedSteps, 'of', totalSteps, '=', newProgress + '%');

    // Update the project in the projects array
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === activeProject 
          ? { ...project, progress: newProgress }
          : project
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
          <div className="px-3 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
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
                
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {isEditingProjectName ? (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        onKeyDown={handleProjectNameKeyPress}
                        onBlur={handleProjectNameSave}
                        className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none focus:border-blue-600 min-w-0 flex-1"
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
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 truncate">
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
              <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Dashboard with Sections */}
        <main className="flex-1 overflow-hidden bg-gray-50 relative">
          <div className="h-full p-4 sm:p-6 overflow-y-auto">
            {/* Project Overview Section */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Project Overview
                </h2>
                <button
                  onClick={() => window.location.href = '/dashboard/documents'}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="hidden sm:inline">View All Documents</span>
                  <span className="sm:hidden">Documents</span>
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Project Stats Cards */}
                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Total Tasks</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.totalTasks}</p>
                    </div>
                  </div>
                </div>

                       <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                         <div className="flex items-center">
                           <div className="p-1.5 bg-yellow-100 rounded-lg">
                             <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                           </div>
                           <div className="ml-2 sm:ml-3">
                             <p className="text-xs font-medium text-gray-600">To Do</p>
                             <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.toDoTasks}</p>
                           </div>
                         </div>
                       </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Completed Tasks</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">{taskCounts.completedTasks}</p>
                    </div>
                  </div>
            </div>

                <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                  <div className="flex items-center">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs font-medium text-gray-600">Documents</p>
                      <p className="text-lg sm:text-xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>
            </div>
            </div>



            {/* Project Progress Section */}
            <div className="mb-6 sm:mb-8">
              <LinearTaskFlow 
                key={`linear-task-flow-${projectSteps.length}-${Date.now()}`}
                steps={projectSteps}
                currentStep={projectSteps.find(step => step.status === 'in-progress')?.id}
                onStepClick={(stepId) => {
                  console.log('Step clicked:', stepId);
                  // TODO: Handle step click - could show details, update status, etc.
                }}
                onSubTaskUpdate={handleSubTaskUpdate}
                onSubTaskNotesUpdate={handleSubTaskNotesUpdate}
                onDeliverableUpdate={handleDeliverableUpdate}
                onStepComplete={handleStepComplete}
                onStepAdvance={handleStepAdvance}
                onTaskUpdate={(taskId, updates) => {
                  console.log('Task updated:', taskId, updates);
                  // TODO: Handle task updates from calendar view
                }}
                onAddTask={(task) => {
                  console.log('Task added:', task);
                  // TODO: Handle adding new tasks from calendar view
                }}
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
