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
          title: 'Site Survey & Geotechnical Investigation',
          description: 'Comprehensive site survey including topographical mapping, soil testing, and utility mapping',
          status: 'completed' as const,
          estimatedDuration: '5 days',
          assignedTo: 'Survey & Geotechnical Team',
          notes: 'Site survey and geotechnical investigation completed. Soil bearing capacity confirmed at 200 kN/m². No contamination detected.',
          materials: ['Total station', 'GPS equipment', 'Soil sampling tools', 'Utility detection equipment', 'Safety gear'],
          requirements: ['Site access permits', 'Geotechnical engineer certification', 'Utility company coordination'],
          deliverables: [
            { id: 'd1', title: 'Topographical survey report (1:500 scale)', status: 'completed' as const },
            { id: 'd2', title: 'Geotechnical investigation report', status: 'completed' as const },
            { id: 'd3', title: 'Utility mapping and conflict analysis', status: 'completed' as const },
            { id: 'd4', title: 'Site constraints and opportunities plan', status: 'completed' as const }
          ],
          documents: [
            { id: '1', name: 'Topographical Survey Report', type: 'PDF', url: '/docs/topographical-survey.pdf' },
            { id: '2', name: 'Geotechnical Investigation Report', type: 'PDF', url: '/docs/geotechnical-report.pdf' },
            { id: '3', name: 'Utility Mapping Report', type: 'PDF', url: '/docs/utility-mapping.pdf' },
            { id: '4', name: 'Site Analysis CAD Files', type: 'DWG', url: '/docs/site-analysis.dwg' }
          ]
        },
        {
          id: '1.2',
          title: 'Architectural Design Development',
          description: 'Develop detailed architectural designs including floor plans, elevations, and 3D models',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Architectural Team',
          notes: 'Architectural design approved by client and planning authority. All drawings comply with building regulations.',
          materials: ['CAD software licenses', '3D modeling software', 'Drawing materials', 'Client brief documentation'],
          requirements: ['Client requirements brief', 'Site survey data', 'Planning policy compliance', 'Building regulations'],
          deliverables: [
            { id: 'd5', title: 'Architectural drawings package (1:100 scale)', status: 'completed' as const },
            { id: 'd6', title: '3D architectural visualization', status: 'completed' as const },
            { id: 'd7', title: 'Material and finish specifications', status: 'completed' as const },
            { id: 'd8', title: 'Design and access statement', status: 'completed' as const }
          ],
          documents: [
            { id: '5', name: 'Architectural Drawings Package', type: 'PDF', url: '/docs/architectural-drawings.pdf' },
            { id: '6', name: '3D Visualization Renderings', type: 'PDF', url: '/docs/3d-renderings.pdf' },
            { id: '7', name: 'Material Specifications', type: 'PDF', url: '/docs/material-specs.pdf' },
            { id: '8', name: 'Design and Access Statement', type: 'PDF', url: '/docs/design-access-statement.pdf' }
          ]
        },
        {
          id: '1.3',
          title: 'Structural Engineering Design',
          description: 'Develop structural calculations, foundation design, and structural drawings',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Structural Engineer',
          notes: 'Structural design completed. Foundation design optimized for site conditions. All calculations approved.',
          materials: ['Structural analysis software', 'Calculation tools', 'Design codes and standards', 'Load testing equipment'],
          requirements: ['Architectural drawings', 'Geotechnical report', 'Building regulations compliance', 'Structural engineer certification'],
          deliverables: [
            { id: 'd9', title: 'Structural calculations report', status: 'completed' as const },
            { id: 'd10', title: 'Foundation design drawings', status: 'completed' as const },
            { id: 'd11', title: 'Structural steelwork drawings', status: 'completed' as const },
            { id: 'd12', title: 'Load path analysis', status: 'completed' as const }
          ],
          documents: [
            { id: '9', name: 'Structural Calculations', type: 'PDF', url: '/docs/structural-calculations.pdf' },
            { id: '10', name: 'Foundation Design Drawings', type: 'PDF', url: '/docs/foundation-design.pdf' },
            { id: '11', name: 'Steelwork Drawings', type: 'PDF', url: '/docs/steelwork-drawings.pdf' },
            { id: '12', name: 'Structural Analysis Report', type: 'PDF', url: '/docs/structural-analysis.pdf' }
          ]
        },
        {
          id: '1.4',
          title: 'MEP Design & Coordination',
          description: 'Design mechanical, electrical, and plumbing systems with full coordination',
          status: 'completed' as const,
          estimatedDuration: '1 week',
          assignedTo: 'MEP Engineers',
          notes: 'MEP design completed with full coordination. All systems designed for optimal efficiency and maintainability.',
          materials: ['MEP design software', 'Load calculation tools', 'Equipment specifications', 'Coordination software'],
          requirements: ['Architectural drawings', 'Client requirements', 'Building regulations', 'Energy efficiency standards'],
          deliverables: [
            { id: 'd13', title: 'MEP drawings package', status: 'completed' as const },
            { id: 'd14', title: 'Load calculations and sizing', status: 'completed' as const },
            { id: 'd15', title: 'Equipment schedules and specifications', status: 'completed' as const },
            { id: 'd16', title: 'MEP coordination drawings', status: 'completed' as const }
          ],
          documents: [
            { id: '13', name: 'MEP Drawings Package', type: 'PDF', url: '/docs/mep-drawings.pdf' },
            { id: '14', name: 'Load Calculations', type: 'PDF', url: '/docs/load-calculations.pdf' },
            { id: '15', name: 'Equipment Schedules', type: 'PDF', url: '/docs/equipment-schedules.pdf' },
            { id: '16', name: 'MEP Coordination Drawings', type: 'PDF', url: '/docs/mep-coordination.pdf' }
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
          title: 'Planning Permission Application',
          description: 'Submit comprehensive planning application with all required documentation and community consultation',
          status: 'completed' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Planning Consultant',
          notes: 'Planning application submitted with full documentation. Public consultation completed. No objections received.',
          materials: ['Planning application forms', 'Technical drawings package', 'Design and access statement', 'Community consultation materials', 'Application fees'],
          requirements: ['Full planning permission', 'Approved architectural drawings', 'Community consultation report', 'Environmental impact assessment'],
          deliverables: [
            { id: 'd17', title: 'Planning permission certificate', status: 'completed' as const },
            { id: 'd18', title: 'Approved planning drawings', status: 'completed' as const },
            { id: 'd19', title: 'Planning conditions compliance schedule', status: 'completed' as const },
            { id: 'd20', title: 'Community consultation report', status: 'completed' as const }
          ],
          documents: [
            { id: '17', name: 'Planning Application Package', type: 'PDF', url: '/docs/planning-application.pdf' },
            { id: '18', name: 'Planning Permission Certificate', type: 'PDF', url: '/docs/planning-permission.pdf' },
            { id: '19', name: 'Design and Access Statement', type: 'PDF', url: '/docs/design-access-statement.pdf' },
            { id: '20', name: 'Community Consultation Report', type: 'PDF', url: '/docs/community-consultation.pdf' }
          ]
        },
        {
          id: '2.2',
          title: 'Building Regulations Approval',
          description: 'Submit building regulations application with full compliance documentation and structural certification',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Building Control Officer',
          notes: 'Building regulations approval obtained. All structural, fire safety, and accessibility requirements met.',
          materials: ['Building regulations application forms', 'Structural calculations', 'Fire safety strategy', 'Accessibility compliance report', 'Energy performance certificate'],
          requirements: ['Full building regulations approval', 'Structural engineer certification', 'Fire safety assessment', 'Accessibility compliance', 'Energy efficiency compliance'],
          deliverables: [
            { id: 'd21', title: 'Building regulations approval certificate', status: 'completed' as const },
            { id: 'd22', title: 'Structural compliance certificate', status: 'completed' as const },
            { id: 'd23', title: 'Fire safety compliance certificate', status: 'completed' as const },
            { id: 'd24', title: 'Building control inspection schedule', status: 'completed' as const }
          ],
          documents: [
            { id: '21', name: 'Building Regulations Application', type: 'PDF', url: '/docs/building-regs-application.pdf' },
            { id: '22', name: 'Building Regulations Approval', type: 'PDF', url: '/docs/building-regs-approval.pdf' },
            { id: '23', name: 'Structural Compliance Certificate', type: 'PDF', url: '/docs/structural-compliance.pdf' },
            { id: '24', name: 'Fire Safety Strategy', type: 'PDF', url: '/docs/fire-safety-strategy.pdf' }
          ]
        },
        {
          id: '2.3',
          title: 'Utility Connections & NOCs',
          description: 'Obtain all necessary utility connections, NOCs, and service agreements',
          status: 'completed' as const,
          estimatedDuration: '4 weeks',
          assignedTo: 'Utility Coordinator',
          notes: 'All utility connections approved and NOCs received. Service agreements signed with all utility providers.',
          materials: ['Utility application forms', 'Site connection drawings', 'Service specifications', 'Connection fees', 'Meter installation agreements'],
          requirements: ['Electricity connection agreement', 'Gas connection agreement', 'Water connection agreement', 'Telecommunications NOC', 'Sewer connection agreement'],
          deliverables: [
            { id: 'd25', title: 'Electricity connection agreement', status: 'completed' as const },
            { id: 'd26', title: 'Gas connection agreement', status: 'completed' as const },
            { id: 'd27', title: 'Water connection agreement', status: 'completed' as const },
            { id: 'd28', title: 'Telecommunications NOC', status: 'completed' as const },
            { id: 'd29', title: 'Utility connection schedule', status: 'completed' as const }
          ],
          documents: [
            { id: '25', name: 'Electricity Connection Agreement', type: 'PDF', url: '/docs/electricity-connection.pdf' },
            { id: '26', name: 'Gas Connection Agreement', type: 'PDF', url: '/docs/gas-connection.pdf' },
            { id: '27', name: 'Water Connection Agreement', type: 'PDF', url: '/docs/water-connection.pdf' },
            { id: '28', name: 'Telecommunications NOC', type: 'PDF', url: '/docs/telecom-noc.pdf' },
            { id: '29', name: 'Utility Connection Schedule', type: 'PDF', url: '/docs/utility-schedule.pdf' }
          ]
        },
        {
          id: '2.4',
          title: 'Environmental & Safety Permits',
          description: 'Obtain environmental permits, health and safety approvals, and construction phase plan approval',
          status: 'completed' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Environmental & Safety Consultant',
          notes: 'All environmental and safety permits obtained. Construction phase plan approved by HSE.',
          materials: ['Environmental permit applications', 'Health and safety documentation', 'Construction phase plan', 'Risk assessments', 'Method statements'],
          requirements: ['Environmental permit', 'Health and safety approval', 'Construction phase plan approval', 'CDM compliance', 'Noise and dust control permits'],
          deliverables: [
            { id: 'd30', title: 'Environmental permit', status: 'completed' as const },
            { id: 'd31', title: 'Health and safety approval', status: 'completed' as const },
            { id: 'd32', title: 'Construction phase plan approval', status: 'completed' as const },
            { id: 'd33', title: 'CDM compliance certificate', status: 'completed' as const }
          ],
          documents: [
            { id: '30', name: 'Environmental Permit', type: 'PDF', url: '/docs/environmental-permit.pdf' },
            { id: '31', name: 'Health and Safety Approval', type: 'PDF', url: '/docs/hse-approval.pdf' },
            { id: '32', name: 'Construction Phase Plan', type: 'PDF', url: '/docs/construction-phase-plan.pdf' },
            { id: '33', name: 'CDM Compliance Certificate', type: 'PDF', url: '/docs/cdm-compliance.pdf' }
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
          title: 'Site Mobilization & Setup',
          description: 'Establish site office, welfare facilities, and construction infrastructure',
          status: 'completed' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Site Manager',
          notes: 'Site mobilization completed successfully. All facilities operational and safety systems in place.',
          materials: ['Portable office units', 'Welfare facilities', 'Computer equipment', 'Safety equipment', 'Communication systems'],
          requirements: ['Site access permits', 'Utility connections', 'Safety certifications', 'Insurance coverage'],
          deliverables: [
            { id: 'd34', title: 'Fully operational site office', status: 'completed' as const },
            { id: 'd35', title: 'Welfare facilities (toilets, canteen, first aid)', status: 'completed' as const },
            { id: 'd36', title: 'Site safety management system', status: 'completed' as const },
            { id: 'd37', title: 'Communication and IT infrastructure', status: 'completed' as const }
          ],
          documents: [
            { id: '34', name: 'Site Setup Checklist', type: 'PDF', url: '/docs/site-setup-checklist.pdf' },
            { id: '35', name: 'Welfare Facilities Plan', type: 'PDF', url: '/docs/welfare-facilities.pdf' },
            { id: '36', name: 'Site Safety Management Plan', type: 'PDF', url: '/docs/site-safety-plan.pdf' }
          ]
        },
        {
          id: '3.2',
          title: 'Site Security & Hoarding',
          description: 'Install comprehensive site security, hoarding, and access control systems',
          status: 'in-progress' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Security Installation Team',
          notes: 'Hoarding installation 80% complete. Security cameras and access control systems being installed.',
          materials: ['Hoarding panels', 'Steel posts', 'Security cameras', 'Access control systems', 'Warning signs', 'Lighting'],
          requirements: ['Planning permission compliance', 'Security system certification', 'Safety equipment', 'Installation team certification'],
          deliverables: [
            { id: 'd38', title: 'Secured site perimeter with hoarding', status: 'completed' as const },
            { id: 'd39', title: '24/7 security monitoring system', status: 'pending' as const },
            { id: 'd40', title: 'Access control and visitor management', status: 'pending' as const },
            { id: 'd41', title: 'Site lighting and safety signage', status: 'completed' as const }
          ],
          documents: [
            { id: '37', name: 'Security System Specifications', type: 'PDF', url: '/docs/security-specs.pdf' },
            { id: '38', name: 'Access Control Procedures', type: 'PDF', url: '/docs/access-control.pdf' },
            { id: '39', name: 'Hoarding Installation Plan', type: 'PDF', url: '/docs/hoarding-plan.pdf' }
          ]
        },
        {
          id: '3.3',
          title: 'Temporary Utilities Installation',
          description: 'Install temporary power, water, and telecommunications connections for construction',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Utility Installation Team',
          notes: 'Temporary utility connections scheduled for next week. All permits and agreements in place.',
          materials: ['Temporary power distribution', 'Water supply connections', 'Telecommunications equipment', 'Safety equipment', 'Metering systems'],
          requirements: ['Utility connection agreements', 'Safety certificates', 'Electrical certification', 'Water quality testing'],
          deliverables: [
            { id: 'd42', title: 'Temporary electrical distribution system', status: 'pending' as const },
            { id: 'd43', title: 'Temporary water supply and storage', status: 'pending' as const },
            { id: 'd44', title: 'Site telecommunications network', status: 'pending' as const },
            { id: 'd45', title: 'Utility safety and monitoring systems', status: 'pending' as const }
          ],
          documents: [
            { id: '40', name: 'Temporary Utilities Plan', type: 'PDF', url: '/docs/temp-utilities-plan.pdf' },
            { id: '41', name: 'Electrical Installation Certificate', type: 'PDF', url: '/docs/electrical-cert.pdf' },
            { id: '42', name: 'Water Quality Test Results', type: 'PDF', url: '/docs/water-quality.pdf' }
          ]
        },
        {
          id: '3.4',
          title: 'Site Clearance & Ground Preparation',
          description: 'Clear site, remove existing structures, and prepare ground for construction',
          status: 'pending' as const,
          estimatedDuration: '4 days',
          assignedTo: 'Groundworks Team',
          notes: 'Site clearance will begin after hoarding installation is complete. All existing structures identified for removal.',
          materials: ['Excavation equipment', 'Demolition tools', 'Safety barriers', 'Ground protection', 'Waste management equipment'],
          requirements: ['Site clearance permits', 'Demolition licenses', 'Waste disposal permits', 'Safety equipment', 'Environmental compliance'],
          deliverables: [
            { id: 'd46', title: 'Site cleared of existing structures', status: 'pending' as const },
            { id: 'd47', title: 'Ground leveled and prepared', status: 'pending' as const },
            { id: 'd48', title: 'Temporary access roads established', status: 'pending' as const },
            { id: 'd49', title: 'Environmental protection measures', status: 'pending' as const }
          ],
          documents: [
            { id: '43', name: 'Site Clearance Plan', type: 'PDF', url: '/docs/site-clearance-plan.pdf' },
            { id: '44', name: 'Demolition Method Statement', type: 'PDF', url: '/docs/demolition-method.pdf' },
            { id: '45', name: 'Waste Management Plan', type: 'PDF', url: '/docs/waste-management.pdf' }
          ]
        },
        {
          id: '3.5',
          title: 'Site Survey & Setting Out',
          description: 'Conduct detailed site survey and set out building positions and levels',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Survey Team',
          notes: 'Site survey and setting out will be conducted after ground preparation. All survey equipment calibrated and ready.',
          materials: ['Total station', 'GPS equipment', 'Leveling equipment', 'Survey markers', 'Measuring equipment'],
          requirements: ['Surveyor certification', 'Equipment calibration', 'Site access', 'Safety equipment'],
          deliverables: [
            { id: 'd50', title: 'Detailed site survey and levels', status: 'pending' as const },
            { id: 'd51', title: 'Building position setting out', status: 'pending' as const },
            { id: 'd52', title: 'Survey control points established', status: 'pending' as const },
            { id: 'd53', title: 'As-built survey documentation', status: 'pending' as const }
          ],
          documents: [
            { id: '46', name: 'Site Survey Report', type: 'PDF', url: '/docs/site-survey-report.pdf' },
            { id: '47', name: 'Setting Out Drawings', type: 'PDF', url: '/docs/setting-out-drawings.pdf' },
            { id: '48', name: 'Survey Control Points', type: 'PDF', url: '/docs/survey-control.pdf' }
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
          title: 'Foundation Excavation & Preparation',
          description: 'Excavate foundation trenches, install drainage, and prepare foundation beds',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Groundworks Team',
          notes: 'Foundation excavation will begin after site survey and setting out is complete.',
          materials: ['Excavation equipment', 'Drainage pipes', 'Geotextile membranes', 'Compaction equipment', 'Survey equipment'],
          requirements: ['Excavation permits', 'Ground conditions assessment', 'Drainage design approval', 'Safety equipment'],
          deliverables: [
            { id: 'd54', title: 'Foundation trenches excavated to design levels', status: 'pending' as const },
            { id: 'd55', title: 'Foundation drainage system installed', status: 'pending' as const },
            { id: 'd56', title: 'Foundation beds prepared and compacted', status: 'pending' as const },
            { id: 'd57', title: 'Foundation survey and level check', status: 'pending' as const }
          ],
          documents: [
            { id: '49', name: 'Foundation Excavation Plan', type: 'PDF', url: '/docs/foundation-excavation.pdf' },
            { id: '50', name: 'Drainage Installation Drawings', type: 'PDF', url: '/docs/drainage-installation.pdf' },
            { id: '51', name: 'Foundation Survey Report', type: 'PDF', url: '/docs/foundation-survey.pdf' }
          ]
        },
        {
          id: '4.2',
          title: 'Foundation Construction',
          description: 'Install reinforcement, pour concrete foundations, and construct substructure',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Concrete Team',
          notes: 'Foundation construction requires careful coordination with concrete delivery and weather conditions.',
          materials: ['Reinforcement steel', 'Concrete', 'Formwork', 'Vibrating equipment', 'Curing materials'],
          requirements: ['Concrete delivery schedule', 'Weather protection', 'Quality control', 'Structural engineer inspection'],
          deliverables: [
            { id: 'd58', title: 'Reinforcement steel installed and inspected', status: 'pending' as const },
            { id: 'd59', title: 'Concrete foundations poured and cured', status: 'pending' as const },
            { id: 'd60', title: 'Foundation quality control tests completed', status: 'pending' as const },
            { id: 'd61', title: 'Substructure walls constructed', status: 'pending' as const }
          ],
          documents: [
            { id: '52', name: 'Concrete Pour Schedule', type: 'PDF', url: '/docs/concrete-pour-schedule.pdf' },
            { id: '53', name: 'Reinforcement Inspection Report', type: 'PDF', url: '/docs/reinforcement-inspection.pdf' },
            { id: '54', name: 'Concrete Test Results', type: 'PDF', url: '/docs/concrete-test-results.pdf' }
          ]
        },
        {
          id: '4.3',
          title: 'Structural Steel Frame Erection',
          description: 'Erect main structural steel frame with all connections and bracing',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Steel Erection Team',
          notes: 'Steel frame erection requires crane access, weather protection, and careful sequencing.',
          materials: ['Structural steel sections', 'Bolts and connections', 'Crane equipment', 'Welding equipment', 'Safety equipment'],
          requirements: ['Crane access permits', 'Weather protection', 'Steel erection certification', 'Quality control'],
          deliverables: [
            { id: 'd62', title: 'Main structural steel frame erected', status: 'pending' as const },
            { id: 'd63', title: 'All steel connections completed and inspected', status: 'pending' as const },
            { id: 'd64', title: 'Structural bracing installed', status: 'pending' as const },
            { id: 'd65', title: 'Steel frame survey and alignment check', status: 'pending' as const }
          ],
          documents: [
            { id: '55', name: 'Steel Erection Method Statement', type: 'PDF', url: '/docs/steel-erection-method.pdf' },
            { id: '56', name: 'Steel Connection Inspection Report', type: 'PDF', url: '/docs/steel-connection-inspection.pdf' },
            { id: '57', name: 'Steel Frame Survey Report', type: 'PDF', url: '/docs/steel-frame-survey.pdf' }
          ]
        },
        {
          id: '4.4',
          title: 'Floor Slab Construction',
          description: 'Construct concrete floor slabs and structural elements',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Concrete Team',
          notes: 'Floor slab construction requires careful coordination with MEP installations and access routes.',
          materials: ['Concrete', 'Reinforcement mesh', 'Formwork', 'Insulation', 'Vapor barriers'],
          requirements: ['MEP coordination', 'Weather protection', 'Quality control', 'Access planning'],
          deliverables: [
            { id: 'd66', title: 'Ground floor slab constructed', status: 'pending' as const },
            { id: 'd67', title: 'Upper floor slabs constructed', status: 'pending' as const },
            { id: 'd68', title: 'Floor slab quality control tests', status: 'pending' as const },
            { id: 'd69', title: 'MEP penetrations completed', status: 'pending' as const }
          ],
          documents: [
            { id: '58', name: 'Floor Slab Construction Plan', type: 'PDF', url: '/docs/floor-slab-plan.pdf' },
            { id: '59', name: 'MEP Coordination Drawings', type: 'PDF', url: '/docs/mep-coordination-drawings.pdf' },
            { id: '60', name: 'Floor Slab Test Results', type: 'PDF', url: '/docs/floor-slab-tests.pdf' }
          ]
        },
        {
          id: '4.5',
          title: 'External Envelope Construction',
          description: 'Construct external walls, cladding, and roof structure',
          status: 'pending' as const,
          estimatedDuration: '3 weeks',
          assignedTo: 'Envelope Team',
          notes: 'External envelope construction requires coordination between multiple trades and weather protection.',
          materials: ['Cladding panels', 'Roofing materials', 'Insulation', 'Waterproofing', 'Access equipment'],
          requirements: ['Weather conditions', 'Access equipment', 'Quality control', 'Coordination between trades'],
          deliverables: [
            { id: 'd70', title: 'External wall construction completed', status: 'pending' as const },
            { id: 'd71', title: 'Cladding system installed', status: 'pending' as const },
            { id: 'd72', title: 'Roof structure and covering completed', status: 'pending' as const },
            { id: 'd73', title: 'Weatherproof envelope sealed', status: 'pending' as const }
          ],
          documents: [
            { id: '61', name: 'Cladding Installation Guide', type: 'PDF', url: '/docs/cladding-installation.pdf' },
            { id: '62', name: 'Roofing Installation Details', type: 'PDF', url: '/docs/roofing-installation.pdf' },
            { id: '63', name: 'Waterproofing Test Results', type: 'PDF', url: '/docs/waterproofing-tests.pdf' }
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
          title: 'Electrical Systems Installation',
          description: 'Install complete electrical distribution, lighting, and power systems',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Electrical Team',
          notes: 'Electrical installation requires coordination with other MEP trades and careful cable management.',
          materials: ['Electrical cables', 'Distribution boards', 'Lighting fixtures', 'Power outlets', 'Testing equipment'],
          requirements: ['Electrical certification', 'Coordination with other trades', 'Quality control', 'Safety protocols'],
          deliverables: [
            { id: 'd74', title: 'Main electrical distribution system installed', status: 'pending' as const },
            { id: 'd75', title: 'Lighting systems installed and tested', status: 'pending' as const },
            { id: 'd76', title: 'Power outlets and switches installed', status: 'pending' as const },
            { id: 'd77', title: 'Electrical safety testing completed', status: 'pending' as const }
          ],
          documents: [
            { id: '64', name: 'Electrical Installation Plan', type: 'PDF', url: '/docs/electrical-installation.pdf' },
            { id: '65', name: 'Electrical Test Certificates', type: 'PDF', url: '/docs/electrical-tests.pdf' },
            { id: '66', name: 'Lighting Design Drawings', type: 'PDF', url: '/docs/lighting-design.pdf' }
          ]
        },
        {
          id: '5.2',
          title: 'Plumbing & Drainage Systems',
          description: 'Install complete plumbing, drainage, and water systems',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Plumbing Team',
          notes: 'Plumbing installation requires careful coordination with structural elements and other MEP systems.',
          materials: ['Water pipes', 'Drainage pipes', 'Fittings and valves', 'Water heaters', 'Sanitary fixtures'],
          requirements: ['Plumbing certification', 'Water pressure testing', 'Drainage testing', 'Quality control'],
          deliverables: [
            { id: 'd78', title: 'Cold and hot water systems installed', status: 'pending' as const },
            { id: 'd79', title: 'Drainage and waste systems installed', status: 'pending' as const },
            { id: 'd80', title: 'Sanitary fixtures installed and tested', status: 'pending' as const },
            { id: 'd81', title: 'Water pressure and flow testing completed', status: 'pending' as const }
          ],
          documents: [
            { id: '67', name: 'Plumbing Installation Drawings', type: 'PDF', url: '/docs/plumbing-installation.pdf' },
            { id: '68', name: 'Water System Test Results', type: 'PDF', url: '/docs/water-system-tests.pdf' },
            { id: '69', name: 'Drainage Test Certificates', type: 'PDF', url: '/docs/drainage-tests.pdf' }
          ]
        },
        {
          id: '5.3',
          title: 'HVAC Systems Installation',
          description: 'Install heating, ventilation, and air conditioning systems',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'HVAC Team',
          notes: 'HVAC installation requires careful coordination with electrical and plumbing systems.',
          materials: ['HVAC units', 'Ductwork', 'Vents and grilles', 'Control systems', 'Insulation'],
          requirements: ['HVAC certification', 'System balancing', 'Quality control', 'Energy efficiency compliance'],
          deliverables: [
            { id: 'd82', title: 'HVAC equipment installed and commissioned', status: 'pending' as const },
            { id: 'd83', title: 'Ductwork system installed and balanced', status: 'pending' as const },
            { id: 'd84', title: 'Control systems installed and programmed', status: 'pending' as const },
            { id: 'd85', title: 'HVAC performance testing completed', status: 'pending' as const }
          ],
          documents: [
            { id: '70', name: 'HVAC Installation Plan', type: 'PDF', url: '/docs/hvac-installation.pdf' },
            { id: '71', name: 'HVAC Commissioning Report', type: 'PDF', url: '/docs/hvac-commissioning.pdf' },
            { id: '72', name: 'Energy Performance Certificate', type: 'PDF', url: '/docs/energy-performance.pdf' }
          ]
        },
        {
          id: '5.4',
          title: 'Internal Partitions & Ceilings',
          description: 'Install internal partitions, suspended ceilings, and acoustic treatments',
      status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'Partition Team',
          notes: 'Internal partitions require careful coordination with MEP installations and fire safety requirements.',
          materials: ['Partition systems', 'Ceiling tiles', 'Acoustic insulation', 'Fire barriers', 'Finishing materials'],
          requirements: ['Fire safety compliance', 'Acoustic performance', 'Quality control', 'MEP coordination'],
          deliverables: [
            { id: 'd86', title: 'Internal partition walls installed', status: 'pending' as const },
            { id: 'd87', title: 'Suspended ceiling systems installed', status: 'pending' as const },
            { id: 'd88', title: 'Acoustic treatments installed', status: 'pending' as const },
            { id: 'd89', title: 'Fire barriers and seals completed', status: 'pending' as const }
          ],
          documents: [
            { id: '73', name: 'Partition Installation Guide', type: 'PDF', url: '/docs/partition-installation.pdf' },
            { id: '74', name: 'Acoustic Performance Report', type: 'PDF', url: '/docs/acoustic-performance.pdf' },
            { id: '75', name: 'Fire Safety Compliance Certificate', type: 'PDF', url: '/docs/fire-safety-compliance.pdf' }
          ]
        },
        {
          id: '5.5',
          title: 'Internal Finishes & Decoration',
          description: 'Complete internal wall finishes, flooring, and decorative elements',
          status: 'pending' as const,
          estimatedDuration: '2 weeks',
          assignedTo: 'Finishing Team',
          notes: 'Internal finishing requires clean environment, quality control, and careful coordination with other trades.',
          materials: ['Paint and primers', 'Wall coverings', 'Flooring materials', 'Decorative elements', 'Protective coatings'],
          requirements: ['Clean environment', 'Quality control', 'Color matching', 'Access equipment'],
          deliverables: [
            { id: 'd90', title: 'Wall finishes and painting completed', status: 'pending' as const },
            { id: 'd91', title: 'Flooring systems installed', status: 'pending' as const },
            { id: 'd92', title: 'Decorative elements installed', status: 'pending' as const },
            { id: 'd93', title: 'Final cleaning and protection applied', status: 'pending' as const }
          ],
          documents: [
            { id: '76', name: 'Finishing Specifications', type: 'PDF', url: '/docs/finishing-specifications.pdf' },
            { id: '77', name: 'Color Schedule and Samples', type: 'PDF', url: '/docs/color-schedule.pdf' },
            { id: '78', name: 'Quality Control Checklist', type: 'PDF', url: '/docs/finishing-quality.pdf' }
          ]
        },
        {
          id: '5.6',
          title: 'External Works & Landscaping',
          description: 'Complete external finishes, landscaping, and site cleanup',
          status: 'pending' as const,
          estimatedDuration: '1 week',
          assignedTo: 'External Team',
          notes: 'External works and landscaping require good weather conditions and careful coordination with final inspections.',
          materials: ['Landscaping materials', 'External finishes', 'Cleaning supplies', 'Planting materials', 'Hardscaping'],
          requirements: ['Weather conditions', 'Access routes', 'Final inspections', 'Environmental compliance'],
          deliverables: [
            { id: 'd94', title: 'Landscaping and planting completed', status: 'pending' as const },
            { id: 'd95', title: 'External finishes and cleaning completed', status: 'pending' as const },
            { id: 'd96', title: 'Site cleanup and waste removal', status: 'pending' as const },
            { id: 'd97', title: 'Final site inspection completed', status: 'pending' as const }
          ],
          documents: [
            { id: '79', name: 'Landscaping Plan', type: 'PDF', url: '/docs/landscaping-plan.pdf' },
            { id: '80', name: 'External Finishes Guide', type: 'PDF', url: '/docs/external-finishes.pdf' },
            { id: '81', name: 'Site Cleanup Checklist', type: 'PDF', url: '/docs/site-cleanup.pdf' }
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
          title: 'MEP Systems Commissioning',
          description: 'Commission and test all mechanical, electrical, and plumbing systems',
          status: 'pending' as const,
          estimatedDuration: '3 days',
          assignedTo: 'Commissioning Team',
          notes: 'MEP commissioning ensures all building services are functioning correctly and efficiently.',
          materials: ['Testing equipment', 'Commissioning procedures', 'Safety equipment', 'Calibration tools'],
          requirements: ['System commissioning', 'Quality assurance', 'Safety protocols', 'Performance standards'],
          deliverables: [
            { id: 'd98', title: 'Electrical systems commissioned and tested', status: 'pending' as const },
            { id: 'd99', title: 'Plumbing systems commissioned and tested', status: 'pending' as const },
            { id: 'd100', title: 'HVAC systems commissioned and balanced', status: 'pending' as const },
            { id: 'd101', title: 'MEP commissioning reports completed', status: 'pending' as const }
          ],
          documents: [
            { id: '82', name: 'MEP Commissioning Procedures', type: 'PDF', url: '/docs/mep-commissioning-procedures.pdf' },
            { id: '83', name: 'System Test Results', type: 'PDF', url: '/docs/system-test-results.pdf' },
            { id: '84', name: 'Performance Certificates', type: 'PDF', url: '/docs/performance-certificates.pdf' }
          ]
        },
        {
          id: '6.2',
          title: 'Building Safety & Compliance Testing',
          description: 'Conduct comprehensive safety testing and compliance verification',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Safety Testing Team',
          notes: 'Safety testing ensures all building systems meet regulatory requirements and safety standards.',
          materials: ['Safety testing equipment', 'Compliance checklists', 'Testing procedures', 'Safety equipment'],
          requirements: ['Safety compliance', 'Regulatory standards', 'Fire safety testing', 'Accessibility compliance'],
          deliverables: [
            { id: 'd102', title: 'Fire safety systems tested and certified', status: 'pending' as const },
            { id: 'd103', title: 'Emergency systems tested and verified', status: 'pending' as const },
            { id: 'd104', title: 'Accessibility compliance verified', status: 'pending' as const },
            { id: 'd105', title: 'Safety compliance certificates issued', status: 'pending' as const }
          ],
          documents: [
            { id: '85', name: 'Fire Safety Test Report', type: 'PDF', url: '/docs/fire-safety-test.pdf' },
            { id: '86', name: 'Emergency Systems Test', type: 'PDF', url: '/docs/emergency-systems-test.pdf' },
            { id: '87', name: 'Accessibility Compliance Certificate', type: 'PDF', url: '/docs/accessibility-compliance.pdf' }
          ]
        },
        {
          id: '6.3',
          title: 'Quality Control & Snagging',
          description: 'Conduct comprehensive quality control inspection and snagging process',
          status: 'pending' as const,
          estimatedDuration: '2 days',
          assignedTo: 'Quality Control Team',
          notes: 'Quality control and snagging ensures all work meets the highest standards before handover.',
          materials: ['Snagging lists', 'Quality checklists', 'Repair materials', 'Inspection tools'],
          requirements: ['Quality standards', 'Client approval', 'Final inspections', 'Defect rectification'],
          deliverables: [
            { id: 'd106', title: 'Comprehensive snagging list completed', status: 'pending' as const },
            { id: 'd107', title: 'All defects identified and rectified', status: 'pending' as const },
            { id: 'd108', title: 'Quality control inspection passed', status: 'pending' as const },
            { id: 'd109', title: 'Client approval obtained', status: 'pending' as const }
          ],
          documents: [
            { id: '88', name: 'Snagging List and Defects', type: 'PDF', url: '/docs/snagging-list.pdf' },
            { id: '89', name: 'Quality Control Report', type: 'PDF', url: '/docs/quality-control-report.pdf' },
            { id: '90', name: 'Defect Rectification Record', type: 'PDF', url: '/docs/defect-rectification.pdf' }
          ]
        },
        {
          id: '6.4',
          title: 'Final Inspections & Approvals',
          description: 'Conduct final building inspections and obtain all necessary approvals',
      status: 'pending' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Building Control Officer',
          notes: 'Final inspections ensure all building regulations and planning conditions are met.',
          materials: ['Inspection checklists', 'Compliance documentation', 'Approval certificates'],
          requirements: ['Building control approval', 'Planning compliance', 'Final inspections', 'Occupancy certificate'],
          deliverables: [
            { id: 'd110', title: 'Building control final inspection passed', status: 'pending' as const },
            { id: 'd111', title: 'Planning conditions compliance verified', status: 'pending' as const },
            { id: 'd112', title: 'Occupancy certificate obtained', status: 'pending' as const },
            { id: 'd113', title: 'All regulatory approvals completed', status: 'pending' as const }
          ],
          documents: [
            { id: '91', name: 'Building Control Final Certificate', type: 'PDF', url: '/docs/building-control-final.pdf' },
            { id: '92', name: 'Planning Compliance Certificate', type: 'PDF', url: '/docs/planning-compliance.pdf' },
            { id: '93', name: 'Occupancy Certificate', type: 'PDF', url: '/docs/occupancy-certificate.pdf' }
          ]
        },
        {
          id: '6.5',
          title: 'Project Handover & Documentation',
          description: 'Complete comprehensive project handover with all documentation and client training',
          status: 'pending' as const,
          estimatedDuration: '1 day',
          assignedTo: 'Project Manager',
          notes: 'Final handover includes comprehensive documentation, client training, and project completion.',
          materials: ['Handover documentation', 'Keys and access cards', 'Warranties', 'Operation manuals', 'Training materials'],
          requirements: ['Client approval', 'Documentation complete', 'Training completed', 'Project completion'],
          deliverables: [
            { id: 'd114', title: 'Comprehensive handover documentation package', status: 'pending' as const },
            { id: 'd115', title: 'Client training completed', status: 'pending' as const },
            { id: 'd116', title: 'Keys and access control handed over', status: 'pending' as const },
            { id: 'd117', title: 'Project completion certificate issued', status: 'pending' as const }
          ],
          documents: [
            { id: '94', name: 'Project Handover Manual', type: 'PDF', url: '/docs/project-handover-manual.pdf' },
            { id: '95', name: 'Warranty and Maintenance Documents', type: 'PDF', url: '/docs/warranty-maintenance.pdf' },
            { id: '96', name: 'Operation and Maintenance Manuals', type: 'PDF', url: '/docs/operation-manuals.pdf' },
            { id: '97', name: 'Project Completion Certificate', type: 'PDF', url: '/docs/project-completion.pdf' }
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
