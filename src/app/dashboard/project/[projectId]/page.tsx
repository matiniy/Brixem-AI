'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '../../actions';
import PrimaryButton from '@/components/PrimaryButton';
import KanbanBoard from '@/components/KanbanBoard';
import FloatingChatOverlay from '@/components/FloatingChatOverlay';
import { CHAT_FIRST } from '@/lib/flags';
// import ChatFirstProjectPage from './chat-first-page'; // Removed unused import
import FloatingChatProjectPage from './floating-chat-page';

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
  workspaces: Array<{
    id: string;
    name: string;
  }>;
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
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed";
  priority: "high" | "medium" | "low";
  progress: number;
  assignedUsers: string[];
  dueDate?: string;
  estimatedHours?: number;
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: "upcoming" | "in-progress" | "completed";
  progress: number;
  duration: string;
  tasks: Task[];
  color: string;
  icon: string;
}


export default function ProjectDetailPage() {
  // Use floating chat layout by default
  if (CHAT_FIRST) {
    return <FloatingChatProjectPage />;
  }

  return <LegacyProjectDetailPage />;
}

function LegacyProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'documents'>('overview'); // Default to overview
  const [expandedPhase, setExpandedPhase] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Comprehensive Project Phases with Tasks and Subtasks
  const [projectPhases] = useState<ProjectPhase[]>([
    {
      id: 'pre-plan',
      name: 'Pre-Plan',
      description: 'Initial planning, design, and preparation phase',
      status: 'completed',
      progress: 100,
      duration: '2-4 weeks',
      color: 'blue',
      icon: '📋',
      tasks: [
        {
          id: 'pre-plan-1',
          title: 'Project Scope Definition',
          description: 'Define project requirements, goals, and constraints',
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignedUsers: ['Project Manager'],
          comments: 3,
          likes: 2,
          dueDate: '2024-01-15',
          estimatedHours: 16,
          subtasks: [
            {
              id: 'pre-plan-1-1',
              title: 'Initial client consultation',
              description: 'Meet with client to understand requirements',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-10',
              estimatedHours: 4
            },
            {
              id: 'pre-plan-1-2',
              title: 'Site survey and measurements',
              description: 'Conduct detailed site survey and take measurements',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Surveyor'],
              dueDate: '2024-01-12',
              estimatedHours: 6
            },
            {
              id: 'pre-plan-1-3',
              title: 'Requirements documentation',
              description: 'Document all project requirements and specifications',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-15',
              estimatedHours: 6
            }
          ]
        },
        {
          id: 'pre-plan-2',
          title: 'Design & Planning',
          description: 'Create detailed designs and project plans',
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignedUsers: ['Architect', 'Designer'],
          comments: 5,
          likes: 4,
          dueDate: '2024-01-25',
          estimatedHours: 32,
          subtasks: [
            {
              id: 'pre-plan-2-1',
              title: 'Conceptual design development',
              description: 'Develop initial design concepts and layouts',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Architect'],
              dueDate: '2024-01-18',
              estimatedHours: 12
            },
            {
              id: 'pre-plan-2-2',
              title: '3D modeling and visualization',
              description: 'Create 3D models and renderings for client approval',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Designer'],
              dueDate: '2024-01-22',
              estimatedHours: 16
            },
            {
              id: 'pre-plan-2-3',
              title: 'Technical drawings and specifications',
              description: 'Prepare detailed technical drawings and specifications',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Architect'],
              dueDate: '2024-01-25',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'pre-plan-3',
          title: 'Permits & Approvals',
          description: 'Obtain necessary permits and regulatory approvals',
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignedUsers: ['Project Manager'],
          comments: 2,
          likes: 1,
          dueDate: '2024-02-05',
          estimatedHours: 24,
          subtasks: [
            {
              id: 'pre-plan-3-1',
              title: 'Building permit application',
              description: 'Submit building permit application to local authority',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-01-28',
              estimatedHours: 8
            },
            {
              id: 'pre-plan-3-2',
              title: 'Planning permission review',
              description: 'Review and address any planning permission requirements',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-02-02',
              estimatedHours: 12
            },
            {
              id: 'pre-plan-3-3',
              title: 'Utility approvals',
              description: 'Obtain approvals for utility connections and modifications',
              status: 'completed',
              priority: 'medium',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-02-05',
              estimatedHours: 4
            }
          ]
        }
      ]
    },
    {
      id: 'pre-construction',
      name: 'Pre-Construction',
      description: 'Site preparation, contractor selection, and material procurement',
      status: 'in-progress',
      progress: 60,
      duration: '2-3 weeks',
      color: 'orange',
      icon: '🚧',
      tasks: [
        {
          id: 'pre-construction-1',
          title: 'Contractor Selection',
          description: 'Select and hire qualified contractors and subcontractors',
          status: 'completed',
          priority: 'high',
          progress: 100,
          assignedUsers: ['Project Manager'],
          comments: 4,
          likes: 3,
          dueDate: '2024-02-10',
          estimatedHours: 20,
          subtasks: [
            {
              id: 'pre-construction-1-1',
              title: 'Contractor bidding process',
              description: 'Send out RFPs and collect contractor bids',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-02-05',
              estimatedHours: 8
            },
            {
              id: 'pre-construction-1-2',
              title: 'Contractor interviews and evaluations',
              description: 'Interview shortlisted contractors and evaluate proposals',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-02-08',
              estimatedHours: 8
            },
            {
              id: 'pre-construction-1-3',
              title: 'Contract negotiation and signing',
              description: 'Negotiate terms and sign contracts with selected contractors',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-02-10',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'pre-construction-2',
          title: 'Site Preparation',
          description: 'Prepare the construction site for work to begin',
          status: 'in-progress',
          priority: 'high',
          progress: 60,
          assignedUsers: ['Site Supervisor'],
          comments: 2,
          likes: 1,
          dueDate: '2024-02-15',
          estimatedHours: 16,
          subtasks: [
            {
              id: 'pre-construction-2-1',
              title: 'Site clearing and demolition',
              description: 'Clear site and remove existing structures as needed',
              status: 'completed',
              priority: 'high',
              progress: 100,
              assignedUsers: ['Demolition Team'],
              dueDate: '2024-02-12',
              estimatedHours: 8
            },
            {
              id: 'pre-construction-2-2',
              title: 'Utility disconnection and protection',
              description: 'Disconnect and protect existing utilities',
              status: 'in-progress',
              priority: 'high',
              progress: 50,
              assignedUsers: ['Utility Specialist'],
              dueDate: '2024-02-14',
              estimatedHours: 4
            },
            {
              id: 'pre-construction-2-3',
              title: 'Site security and fencing',
              description: 'Install security measures and site fencing',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Site Supervisor'],
              dueDate: '2024-02-15',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'pre-construction-3',
          title: 'Material Procurement',
          description: 'Order and schedule delivery of construction materials',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: ['Procurement Manager'],
          comments: 0,
          likes: 0,
          dueDate: '2024-02-20',
          estimatedHours: 12,
          subtasks: [
            {
              id: 'pre-construction-3-1',
              title: 'Material specifications and quantities',
              description: 'Finalize material specifications and calculate quantities',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Procurement Manager'],
              dueDate: '2024-02-18',
              estimatedHours: 6
            },
            {
              id: 'pre-construction-3-2',
              title: 'Supplier selection and ordering',
              description: 'Select suppliers and place material orders',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Procurement Manager'],
              dueDate: '2024-02-19',
              estimatedHours: 4
            },
            {
              id: 'pre-construction-3-3',
              title: 'Delivery scheduling',
              description: 'Schedule material deliveries to align with construction timeline',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Procurement Manager'],
              dueDate: '2024-02-20',
              estimatedHours: 2
            }
          ]
        }
      ]
    },
    {
      id: 'build',
      name: 'Build',
      description: 'Main construction phase with all building work',
      status: 'upcoming',
      progress: 0,
      duration: '8-12 weeks',
      color: 'green',
      icon: '🏗️',
      tasks: [
        {
          id: 'build-1',
          title: 'Foundation & Structure',
          description: 'Build foundation and main structural elements',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['Construction Team'],
          comments: 0,
          likes: 0,
          dueDate: '2024-03-15',
          estimatedHours: 80,
          subtasks: [
            {
              id: 'build-1-1',
              title: 'Foundation excavation and pouring',
              description: 'Excavate foundation area and pour concrete',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Foundation Team'],
              dueDate: '2024-03-05',
              estimatedHours: 32
            },
            {
              id: 'build-1-2',
              title: 'Structural framing',
              description: 'Install structural steel and timber framing',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Framing Team'],
              dueDate: '2024-03-10',
              estimatedHours: 32
            },
            {
              id: 'build-1-3',
              title: 'Roof structure installation',
              description: 'Install roof trusses and structural elements',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Roofing Team'],
              dueDate: '2024-03-15',
              estimatedHours: 16
            }
          ]
        },
        {
          id: 'build-2',
          title: 'MEP Installation',
          description: 'Install mechanical, electrical, and plumbing systems',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['MEP Team'],
          comments: 0,
          likes: 0,
          dueDate: '2024-04-15',
          estimatedHours: 120,
          subtasks: [
            {
              id: 'build-2-1',
              title: 'Electrical rough-in',
              description: 'Install electrical wiring and outlets',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Electrician'],
              dueDate: '2024-04-05',
              estimatedHours: 40
            },
            {
              id: 'build-2-2',
              title: 'Plumbing installation',
              description: 'Install plumbing pipes and fixtures',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Plumber'],
              dueDate: '2024-04-08',
              estimatedHours: 40
            },
            {
              id: 'build-2-3',
              title: 'HVAC system installation',
              description: 'Install heating, ventilation, and air conditioning',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['HVAC Technician'],
              dueDate: '2024-04-12',
              estimatedHours: 40
            }
          ]
        },
        {
          id: 'build-3',
          title: 'Interior Finishing',
          description: 'Complete interior finishes and fixtures',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: ['Finishing Team'],
          comments: 0,
          likes: 0,
          dueDate: '2024-05-15',
          estimatedHours: 100,
          subtasks: [
            {
              id: 'build-3-1',
              title: 'Drywall installation and finishing',
              description: 'Install and finish drywall throughout the space',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Drywall Team'],
              dueDate: '2024-05-05',
              estimatedHours: 40
            },
            {
              id: 'build-3-2',
              title: 'Flooring installation',
              description: 'Install flooring materials (tile, hardwood, carpet)',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Flooring Team'],
              dueDate: '2024-05-10',
              estimatedHours: 40
            },
            {
              id: 'build-3-3',
              title: 'Painting and final touches',
              description: 'Paint walls and complete final interior touches',
              status: 'todo',
              priority: 'low',
              progress: 0,
              assignedUsers: ['Painting Team'],
              dueDate: '2024-05-15',
              estimatedHours: 20
            }
          ]
        }
      ]
    },
    {
      id: 'handover',
      name: 'Handover',
      description: 'Final inspections, testing, and project handover to client',
      status: 'upcoming',
      progress: 0,
      duration: '1-2 weeks',
      color: 'purple',
      icon: '🎉',
      tasks: [
        {
          id: 'handover-1',
          title: 'Final Inspections',
          description: 'Conduct final inspections and quality checks',
          status: 'todo',
          priority: 'high',
          progress: 0,
          assignedUsers: ['Quality Inspector'],
          comments: 0,
          likes: 0,
          dueDate: '2024-05-25',
          estimatedHours: 16,
          subtasks: [
            {
              id: 'handover-1-1',
              title: 'Building code compliance inspection',
              description: 'Ensure all work meets building codes and regulations',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Building Inspector'],
              dueDate: '2024-05-22',
              estimatedHours: 8
            },
            {
              id: 'handover-1-2',
              title: 'Quality control walkthrough',
              description: 'Conduct detailed quality control walkthrough',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Quality Inspector'],
              dueDate: '2024-05-24',
              estimatedHours: 4
            },
            {
              id: 'handover-1-3',
              title: 'Client walkthrough and approval',
              description: 'Conduct final walkthrough with client for approval',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-05-25',
              estimatedHours: 4
            }
          ]
        },
        {
          id: 'handover-2',
          title: 'Documentation & Handover',
          description: 'Prepare final documentation and handover project to client',
          status: 'todo',
          priority: 'medium',
          progress: 0,
          assignedUsers: ['Project Manager'],
          comments: 0,
          likes: 0,
          dueDate: '2024-05-30',
          estimatedHours: 12,
          subtasks: [
            {
              id: 'handover-2-1',
              title: 'Warranty documentation',
              description: 'Prepare warranty documentation for all work and materials',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-05-27',
              estimatedHours: 4
            },
            {
              id: 'handover-2-2',
              title: 'Operation and maintenance manuals',
              description: 'Prepare O&M manuals for all installed systems',
              status: 'todo',
              priority: 'medium',
              progress: 0,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-05-28',
              estimatedHours: 4
            },
            {
              id: 'handover-2-3',
              title: 'Final project handover meeting',
              description: 'Conduct final handover meeting with client',
              status: 'todo',
              priority: 'high',
              progress: 0,
              assignedUsers: ['Project Manager'],
              dueDate: '2024-05-30',
              estimatedHours: 4
            }
          ]
        }
      ]
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    // Sample tasks for new projects
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
  ]);

  // Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string; type?: 'normal' | 'task-confirm' | 'system' }>>([
    {
      role: "ai",
      text: "Welcome back! I'm here to help you manage your project. What would you like to work on today?",
      type: "normal"
    }
  ]);

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true);
      const projectData = await getProject(projectId);
      setProject(projectData);
    } catch (error) {
      console.error('Error loading project:', error);
      // Redirect to dashboard if project not found
      router.push('/dashboard/homeowner');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, router]);

  // Chat handler
  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      role: "user" as const,
      text: message,
      type: "normal" as const
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const aiMessage = {
        role: "ai" as const,
        text: `I understand you're asking about "${message}". I'm here to help you with your ${project?.name || 'project'}. You can ask me about tasks, progress, documents, or any other project-related questions.`,
        type: "normal" as const
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: "ai" as const,
        text: "I apologize, but I encountered an error. Please try again.",
        type: "normal" as const
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const [generatedDocuments, setGeneratedDocuments] = useState<{
    sow?: string;
    estimate?: string;
    wbs?: string;
    schedule?: string;
    costEstimation?: string;
  }>({});

  // Mock vendors data for B2B opportunities
  const mockVendors = [
    {
      id: 1,
      name: "Elite Construction Co.",
      specialty: "General Contracting",
      rating: 4.8,
      projects: 127,
      location: "San Francisco, CA",
      image: "🏗️",
      contact: "+1 (415) 555-0123",
      email: "info@eliteconstruction.com",
      services: ["Residential", "Commercial", "Renovation"],
      availability: "Available in 2 weeks"
    },
    {
      id: 2,
      name: "Precision Electrical",
      specialty: "Electrical Services",
      rating: 4.9,
      projects: 89,
      location: "Oakland, CA",
      image: "⚡",
      contact: "+1 (510) 555-0456",
      email: "service@precisionelectrical.com",
      services: ["Wiring", "Installation", "Maintenance"],
      availability: "Available next week"
    },
    {
      id: 3,
      name: "AquaFlow Plumbing",
      specialty: "Plumbing & HVAC",
      rating: 4.7,
      projects: 156,
      location: "San Jose, CA",
      image: "🔧",
      contact: "+1 (408) 555-0789",
      email: "hello@aquaflow.com",
      services: ["Plumbing", "HVAC", "Repairs"],
      availability: "Available in 3 weeks"
    },
    {
      id: 4,
      name: "Craft Cabinetry",
      specialty: "Custom Woodwork",
      rating: 4.9,
      projects: 73,
      location: "Berkeley, CA",
      image: "🪑",
      contact: "+1 (510) 555-0321",
      email: "craft@cabinetry.com",
      services: ["Cabinets", "Furniture", "Custom Work"],
      availability: "Available in 4 weeks"
    },
    {
      id: 5,
      name: "GreenScape Landscaping",
      specialty: "Landscape Design",
      rating: 4.6,
      projects: 94,
      location: "Palo Alto, CA",
      image: "🌿",
      contact: "+1 (650) 555-0654",
      email: "design@greenscape.com",
      services: ["Design", "Installation", "Maintenance"],
      availability: "Available in 1 week"
    },
    {
      id: 6,
      name: "Modern Paint & Finish",
      specialty: "Painting & Finishing",
      rating: 4.8,
      projects: 112,
      location: "Mountain View, CA",
      image: "🎨",
      contact: "+1 (650) 555-0987",
      email: "paint@modernfinish.com",
      services: ["Interior", "Exterior", "Specialty Finishes"],
      availability: "Available next week"
    }
  ];

  // Chat functionality



  const generateMockSOW = (projectData: Project) => {
    const projectType = projectData.type || 'renovation';
    const size = projectData.size_sqft || 1000;
    
    const sowContent = `# SCOPE OF WORK
## ${projectData.name.toUpperCase()}

**Project Location:** ${projectData.location}
**Project Type:** ${projectType}
**Project Size:** ${size} sq ft
**Date:** ${new Date().toLocaleDateString()}

### 1. PROJECT OVERVIEW
This document outlines the complete scope of work for the ${projectData.name} project located at ${projectData.location}. The project involves ${projectData.description || `a comprehensive ${projectType} project covering ${size} square feet`}.

### 2. SCOPE OF WORK INCLUDES

#### 2.1 Site Preparation
- Site survey and measurements
- Existing condition documentation
- Utility location and marking
- Site protection and safety measures

#### 2.2 Demolition (if applicable)
- Removal of existing materials and structures
- Proper disposal of debris
- Site cleanup and preparation

#### 2.3 Construction Activities
- Foundation and structural work
- Framing and structural modifications
- Electrical and plumbing rough-ins
- HVAC system installation
- Interior and exterior finishes
- Landscaping and site improvements

#### 2.4 Materials and Equipment
- All necessary construction materials
- Tools and equipment required
- Safety equipment and protective gear
- Quality control and testing equipment

### 3. EXCLUSIONS
- Furniture and decorative items
- Appliances not specified in contract
- Landscaping beyond basic site work
- Permits and inspection fees (unless specified)

### 4. QUALITY STANDARDS
- All work to be performed in accordance with local building codes
- Materials to meet or exceed industry standards
- Workmanship to be of professional quality
- Final inspection and punch list completion

### 5. PROJECT TIMELINE
- Estimated start date: ${new Date().toLocaleDateString()}
- Estimated completion: ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}
- Timeline subject to weather conditions and material availability

### 6. CHANGE ORDERS
Any modifications to this scope of work must be documented in writing and approved by both parties before work begins.

---
**Prepared by:** Brixem AI Construction Assistant
**Date:** ${new Date().toLocaleDateString()}`;

    return sowContent;
  };

  const generateWorkBreakdownStructure = (projectData: Project) => {
    const projectType = projectData.type || 'renovation';
    
    const wbsContent = `# WORK BREAKDOWN STRUCTURE
## ${projectData.name.toUpperCase()}

**Project Type:** ${projectType}
**Date:** ${new Date().toLocaleDateString()}

### 1. PROJECT INITIATION (Week 1-2)
- 1.1 Project planning and scope definition
- 1.2 Site survey and assessment
- 1.3 Permit applications and approvals
- 1.4 Contractor selection and contracts

### 2. SITE PREPARATION (Week 3-4)
- 2.1 Site clearing and preparation
- 2.2 Utility marking and protection
- 2.3 Safety barriers and signage
- 2.4 Material staging area setup

### 3. DEMOLITION & EXCAVATION (Week 5-6)
- 3.1 Existing structure removal
- 3.2 Site excavation and grading
- 3.3 Foundation preparation
- 3.4 Debris removal and disposal

### 4. FOUNDATION & STRUCTURE (Week 7-10)
- 4.1 Foundation construction
- 4.2 Structural framing
- 4.3 Roof structure
- 4.4 Exterior walls and sheathing

### 5. MECHANICAL SYSTEMS (Week 11-14)
- 5.1 Electrical rough-in
- 5.2 Plumbing rough-in
- 5.3 HVAC installation
- 5.4 Insulation and vapor barriers

### 6. INTERIOR & EXTERIOR FINISHES (Week 15-20)
- 6.1 Drywall and plastering
- 6.2 Flooring installation
- 6.3 Cabinetry and fixtures
- 6.4 Painting and finishing

### 7. FINAL INSPECTION & PUNCH LIST (Week 21-22)
- 7.1 Quality control inspection
- 7.2 Punch list completion
- 7.3 Final cleanup
- 7.4 Project handover

---
**Prepared by:** Brixem AI Construction Assistant
**Date:** ${new Date().toLocaleDateString()}`;

    return wbsContent;
  };

  const generateProjectSchedule = (projectData: Project) => {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 22 * 7 * 24 * 60 * 60 * 1000); // 22 weeks
    
    const scheduleContent = `# PROJECT SCHEDULE
## ${projectData.name.toUpperCase()}

**Project Start Date:** ${startDate.toLocaleDateString()}
**Project End Date:** ${endDate.toLocaleDateString()}
**Total Duration:** 22 weeks

### PHASE 1: PLANNING & PREPARATION (Weeks 1-4)
- **Week 1-2:** Project planning, permits, contractor selection
- **Week 3-4:** Site preparation, utility marking, safety setup

### PHASE 2: DEMOLITION & EXCAVATION (Weeks 5-6)
- **Week 5:** Site clearing and demolition
- **Week 6:** Excavation and foundation preparation

### PHASE 3: STRUCTURE & FRAMING (Weeks 7-10)
- **Week 7-8:** Foundation construction
- **Week 9-10:** Structural framing and roof

### PHASE 4: MECHANICAL SYSTEMS (Weeks 11-14)
- **Week 11-12:** Electrical and plumbing rough-in
- **Week 13-14:** HVAC installation and insulation

### PHASE 5: FINISHES (Weeks 15-20)
- **Week 15-16:** Drywall and basic finishes
- **Week 17-18:** Flooring and cabinetry
- **Week 19-20:** Final finishes and painting

### PHASE 6: COMPLETION (Weeks 21-22)
- **Week 21:** Final inspection and punch list
- **Week 22:** Cleanup and project handover

### MILESTONES
- **Week 4:** Site ready for construction
- **Week 10:** Structure complete
- **Week 14:** Mechanical systems complete
- **Week 20:** Finishes complete
- **Week 22:** Project complete

---
**Prepared by:** Brixem AI Construction Assistant
**Date:** ${new Date().toLocaleDateString()}`;

    return scheduleContent;
  };

  const generateCostEstimation = (projectData: Project) => {
    const size = projectData.size_sqft || 1000;
    const projectType = projectData.type || 'renovation';
    
    // Detailed cost breakdown
    let typeMultiplier = 1.0;
    switch (projectType.toLowerCase()) {
      case 'kitchen':
        typeMultiplier = 1.3;
        break;
      case 'bathroom':
        typeMultiplier = 1.2;
        break;
      case 'basement':
        typeMultiplier = 0.9;
        break;
      case 'addition':
        typeMultiplier = 1.4;
        break;
      default:
        typeMultiplier = 1.0;
    }
    
    const baseCost = size * 150 * typeMultiplier;
    const materialsCost = baseCost * 0.4;
    const laborCost = baseCost * 0.5;
    const overheadCost = baseCost * 0.1;
    
    const costContent = `# DETAILED COST ESTIMATION
## ${projectData.name.toUpperCase()}

**Project Type:** ${projectType}
**Project Size:** ${size} sq ft
**Date:** ${new Date().toLocaleDateString()}

### MATERIALS BREAKDOWN (40% - $${materialsCost.toLocaleString()})

#### Construction Materials
- Lumber and framing: $${(materialsCost * 0.25).toLocaleString()}
- Concrete and masonry: $${(materialsCost * 0.20).toLocaleString()}
- Roofing materials: $${(materialsCost * 0.15).toLocaleString()}
- Insulation: $${(materialsCost * 0.10).toLocaleString()}
- Drywall and plaster: $${(materialsCost * 0.10).toLocaleString()}
- Paint and finishes: $${(materialsCost * 0.10).toLocaleString()}
- Hardware and fasteners: $${(materialsCost * 0.10).toLocaleString()}

#### Fixtures and Finishes
- Plumbing fixtures: $${(materialsCost * 0.20).toLocaleString()}
- Electrical fixtures: $${(materialsCost * 0.15).toLocaleString()}
- Cabinetry: $${(materialsCost * 0.25).toLocaleString()}
- Flooring: $${(materialsCost * 0.20).toLocaleString()}
- Appliances: $${(materialsCost * 0.20).toLocaleString()}

### LABOR COSTS (50% - $${laborCost.toLocaleString()})

#### Skilled Trades
- General contractor: $${(laborCost * 0.30).toLocaleString()}
- Electricians: $${(laborCost * 0.15).toLocaleString()}
- Plumbers: $${(laborCost * 0.15).toLocaleString()}
- HVAC technicians: $${(laborCost * 0.10).toLocaleString()}
- Carpenters: $${(laborCost * 0.15).toLocaleString()}
- Painters: $${(laborCost * 0.10).toLocaleString()}
- Landscapers: $${(laborCost * 0.05).toLocaleString()}

#### Project Management
- Project manager: $${(laborCost * 0.15).toLocaleString()}
- Site supervisor: $${(laborCost * 0.10).toLocaleString()}
- Quality control: $${(laborCost * 0.05).toLocaleString()}

### OVERHEAD & CONTINGENCY (10% - $${overheadCost.toLocaleString()})

#### Project Overhead
- Equipment rental: $${(overheadCost * 0.25).toLocaleString()}
- Insurance and permits: $${(overheadCost * 0.20).toLocaleString()}
- Utilities and site costs: $${(overheadCost * 0.15).toLocaleString()}
- Safety equipment: $${(overheadCost * 0.10).toLocaleString()}

#### Contingency
- Material price fluctuations: $${(overheadCost * 0.15).toLocaleString()}
- Unforeseen conditions: $${(overheadCost * 0.15).toLocaleString()}

### TOTAL PROJECT COST
**Grand Total:** $${baseCost.toLocaleString()}

### PAYMENT SCHEDULE
- **30%** upon contract signing: $${(baseCost * 0.3).toLocaleString()}
- **30%** at 50% completion: $${(baseCost * 0.3).toLocaleString()}
- **30%** at 90% completion: $${(baseCost * 0.3).toLocaleString()}
- **10%** upon final completion: $${(overheadCost).toLocaleString()}

---
**Prepared by:** Brixem AI Construction Assistant
**Date:** ${new Date().toLocaleDateString()}`;

    return costContent;
  };

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId, loadProject]);

  const handleGenerateDocuments = async () => {
    try {
      setIsGenerating(true);
      
      // Generate mock documents
      const sowContent = generateMockSOW(project!);
      const estimateContent = generateCostEstimation(project!);
      const wbsContent = generateWorkBreakdownStructure(project!);
      const scheduleContent = generateProjectSchedule(project!);
      const costEstimationContent = generateCostEstimation(project!);
      
      // Store generated documents
      setGeneratedDocuments({
        sow: sowContent,
        estimate: estimateContent,
        wbs: wbsContent,
        schedule: scheduleContent,
        costEstimation: costEstimationContent
      });
      
      // Show success message
      alert('Documents generated successfully! You can now view and download your Scope of Work, Estimate, Work Breakdown Structure, Schedule, and Cost Estimation.');
      
    } catch (error) {
      console.error('Error generating documents:', error);
      alert('Failed to generate documents. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const handleAddTask = (task: Omit<Task, "id">) => {
    const newTask = {
      ...task,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <p className="text-gray-600 mb-6">The project you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
          <button
            onClick={() => router.push('/dashboard/homeowner')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <button
                onClick={() => router.push('/dashboard/homeowner')}
                className="p-2 rounded-lg hover:bg-gray-100 transition flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
               
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">B</span>
              </div>
               
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{project.name}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full ${
                project.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {project.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 min-w-max">
            <button
              onClick={() => setActiveTab('kanban')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'kanban'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Kanban Board
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'kanban' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Kanban Board</h2>
            <p className="text-sm sm:text-base text-gray-600">Manage tasks and track progress for {project.name}</p>
          </div>
          
          <div className="overflow-x-auto">
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        </div>
      ) : activeTab === 'documents' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Documents</h2>
            <p className="text-sm sm:text-base text-gray-600">View and manage project documents for {project.name}</p>
              </div>
              <button
                onClick={() => router.push(`/dashboard/documents?projectId=${project.id}`)}
                className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2 justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View All Documents
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Generated Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Scope of Work (SOW)</h4>
                <p className="text-sm text-gray-700 mb-4">A detailed document outlining the scope of work, materials, and labor for the project.</p>
                <div className="mt-4 flex items-center gap-2">
                  <PrimaryButton
                    onClick={handleGenerateDocuments}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Generate SOW</span>
                      </>
                    )}
                  </PrimaryButton>
                  <button 
                    onClick={() => {
                      if (generatedDocuments.sow) {
                        const blob = new Blob([generatedDocuments.sow], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name}-SOW.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!generatedDocuments.sow}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-2 justify-center ${
                      generatedDocuments.sow 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm sm:text-base">Download SOW</span>
                  </button>
                </div>
                {generatedDocuments.sow && (
                  <div className="mt-4 p-3 bg-white rounded border text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-gray-800">{generatedDocuments.sow.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-green-900 mb-2 sm:mb-3">Estimate</h4>
                <p className="text-sm text-gray-700 mb-4">A preliminary cost estimate for the project based on the scope of work.</p>
                <div className="mt-4 flex items-center gap-2">
                  <PrimaryButton
                    onClick={handleGenerateDocuments}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Generate Estimate</span>
                      </>
                    )}
                  </PrimaryButton>
                  <button 
                    onClick={() => {
                      if (generatedDocuments.estimate) {
                        const blob = new Blob([generatedDocuments.estimate], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name}-Estimate.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!generatedDocuments.estimate}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-2 justify-center ${
                      generatedDocuments.estimate 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">Download Estimate</span>
                  </button>
                </div>
                {generatedDocuments.estimate && (
                  <div className="mt-4 p-3 bg-white rounded border text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-gray-800">{generatedDocuments.estimate.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-purple-900 mb-2 sm:mb-3">Work Breakdown Structure (WBS)</h4>
                <p className="text-sm text-gray-700 mb-4">A detailed breakdown of the project tasks and their dependencies.</p>
                <div className="mt-4 flex items-center gap-2">
                  <PrimaryButton
                    onClick={handleGenerateDocuments}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Generate WBS</span>
                      </>
                    )}
                  </PrimaryButton>
                  <button 
                    onClick={() => {
                      if (generatedDocuments.wbs) {
                        const blob = new Blob([generatedDocuments.wbs], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name}-WBS.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!generatedDocuments.wbs}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-2 justify-center ${
                      generatedDocuments.wbs 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">Download WBS</span>
                  </button>
                </div>
                {generatedDocuments.wbs && (
                  <div className="mt-4 p-3 bg-white rounded border text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-gray-800">{generatedDocuments.wbs.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-yellow-900 mb-2 sm:mb-3">Project Schedule</h4>
                <p className="text-sm text-gray-700 mb-4">A detailed timeline for the project, including key milestones and phases.</p>
                <div className="mt-4 flex items-center gap-2">
                  <PrimaryButton
                    onClick={handleGenerateDocuments}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Generate Schedule</span>
                      </>
                    )}
                  </PrimaryButton>
                  <button 
                    onClick={() => {
                      if (generatedDocuments.schedule) {
                        const blob = new Blob([generatedDocuments.schedule], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name}-Schedule.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!generatedDocuments.schedule}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-2 justify-center ${
                      generatedDocuments.schedule 
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">Download Schedule</span>
                  </button>
                </div>
                {generatedDocuments.schedule && (
                  <div className="mt-4 p-3 bg-white rounded border text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-gray-800">{generatedDocuments.schedule.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
                <h4 className="text-base sm:text-lg font-semibold text-red-900 mb-2 sm:mb-3">Cost Estimation</h4>
                <p className="text-sm text-gray-700 mb-4">A detailed breakdown of materials, labor, and overhead costs for the project.</p>
                <div className="mt-4 flex items-center gap-2">
                  <PrimaryButton
                    onClick={handleGenerateDocuments}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm sm:text-base">Generate Cost Estimation</span>
                      </>
                    )}
                  </PrimaryButton>
                  <button 
                    onClick={() => {
                      if (generatedDocuments.costEstimation) {
                        const blob = new Blob([generatedDocuments.costEstimation], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${project.name}-CostEstimation.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }
                    }}
                    disabled={!generatedDocuments.costEstimation}
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition flex items-center gap-2 justify-center ${
                      generatedDocuments.costEstimation 
                        ? 'bg-red-600 text-white hover:bg-red-700' 
                        : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">Download Cost Estimation</span>
                  </button>
                </div>
                {generatedDocuments.costEstimation && (
                  <div className="mt-4 p-3 bg-white rounded border text-xs overflow-auto max-h-32">
                    <pre className="whitespace-pre-wrap text-gray-800">{generatedDocuments.costEstimation.substring(0, 200)}...</pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verified Local Vendors - B2B Opportunities */}
          <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Verified Local Vendors & Contractors</h3>
            <p className="text-sm text-gray-600 mb-4">Connect with pre-vetted local contractors and consultants for your project</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {mockVendors.map((vendor) => (
                <div key={vendor.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-2xl sm:text-3xl">{vendor.image}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{vendor.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">{vendor.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-3 h-3 ${i < Math.floor(vendor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{vendor.rating}</span>
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{vendor.projects}</span> projects completed
                    </div>
                    
                    <div className="text-xs text-gray-600">
                      📍 {vendor.location}
                    </div>
                    
                    <div className="text-xs text-green-600 font-medium">
                      {vendor.availability}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {vendor.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {service}
                        </span>
                      ))}
                      {vendor.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{vendor.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <button className="w-full px-3 py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition">
                      📞 {vendor.contact}
                    </button>
                    <button className="w-full px-3 py-2 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition">
                      ✉️ {vendor.email}
                    </button>
                    <button className="w-full px-3 py-2 bg-purple-600 text-white text-xs sm:text-sm rounded-lg hover:bg-purple-700 transition">
                      💼 Request Quote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Project Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-sm sm:text-base text-gray-600">{project.location} • {project.size_sqft || '200'} sq ft</p>
                      </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/dashboard/documents?projectId=${project.id}`)}
                  className="px-4 py-2 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View All Documents
                </button>
                      </div>
                    </div>
                  </div>

          {/* Project Phases */}
          <div className="space-y-6">
            {projectPhases.map((phase) => (
              <div key={phase.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Phase Header */}
                <div 
                  className={`p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition ${
                    expandedPhase === phase.id ? 'bg-gray-50' : ''
                  }`}
                  onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        phase.status === 'completed' ? 'bg-green-100 text-green-600' :
                        phase.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {phase.status === 'completed' ? '✓' : phase.icon}
                    </div>
                  <div>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{phase.name}</h3>
                        <p className="text-sm text-gray-600">{phase.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            phase.status === 'completed' ? 'bg-green-100 text-green-800' :
                            phase.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {phase.status === 'completed' ? 'Completed' :
                             phase.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                          </span>
                          <span className="text-xs text-gray-500">{phase.duration}</span>
                          <span className="text-xs text-gray-500">{phase.progress}% Complete</span>
                      </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            phase.status === 'completed' ? 'bg-green-500' :
                            phase.status === 'in-progress' ? 'bg-orange-500' :
                            'bg-gray-300'
                          }`}
                          style={{ width: `${phase.progress}%` }}
                        />
                  </div>
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          expandedPhase === phase.id ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                </div>
              </div>
            </div>

                {/* Phase Tasks */}
                {expandedPhase === phase.id && (
                  <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
                    <div className="space-y-4">
                      {phase.tasks.map((task, taskIndex) => (
                        <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4">
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                task.status === 'completed' ? 'bg-green-100 text-green-600' :
                                task.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {task.status === 'completed' ? '✓' : taskIndex + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                <p className="text-sm text-gray-600">{task.description}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {task.priority} priority
                                  </span>
                                  <span className="text-xs text-gray-500">{task.estimatedHours}h estimated</span>
                                  {task.dueDate && (
                                    <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    task.status === 'completed' ? 'bg-green-500' :
                                    task.status === 'in-progress' ? 'bg-orange-500' :
                                    'bg-gray-300'
                                  }`}
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <svg 
                                className={`w-4 h-4 text-gray-400 transition-transform ${
                                  expandedTask === task.id ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                            </div>
                </div>

                          {/* Task Subtasks */}
                          {expandedTask === task.id && task.subtasks && (
                            <div className="mt-4 pl-11 space-y-3">
                              {task.subtasks.map((subtask, subtaskIndex) => (
                                <div key={subtask.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                      subtask.status === 'completed' ? 'bg-green-100 text-green-600' :
                                      subtask.status === 'in-progress' ? 'bg-orange-100 text-orange-600' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {subtask.status === 'completed' ? '✓' : subtaskIndex + 1}
                </div>
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900 text-sm">{subtask.title}</h5>
                                      <p className="text-xs text-gray-600">{subtask.description}</p>
                                      <div className="flex items-center gap-3 mt-1">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          subtask.priority === 'high' ? 'bg-red-100 text-red-800' :
                                          subtask.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                          'bg-green-100 text-green-800'
                                        }`}>
                                          {subtask.priority}
                                        </span>
                                        <span className="text-xs text-gray-500">{subtask.estimatedHours}h</span>
                                        {subtask.dueDate && (
                                          <span className="text-xs text-gray-500">{new Date(subtask.dueDate).toLocaleDateString()}</span>
                                        )}
                                        <span className="text-xs text-gray-500">{subtask.assignedUsers.join(', ')}</span>
              </div>
              </div>
                                    <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className={`h-1.5 rounded-full transition-all duration-300 ${
                                          subtask.status === 'completed' ? 'bg-green-500' :
                                          subtask.status === 'in-progress' ? 'bg-orange-500' :
                                          'bg-gray-300'
                                        }`}
                                        style={{ width: `${subtask.progress}%` }}
                                      />
            </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Chat Overlay */}
      <FloatingChatOverlay
        onSend={handleSendMessage}
        messages={chatMessages}
        placeholder="Ask about your project tasks..."
        isExpanded={isChatExpanded}
        onToggleExpanded={setIsChatExpanded}
      />
    </div>
  );
}
