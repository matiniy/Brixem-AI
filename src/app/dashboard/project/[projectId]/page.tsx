'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProject } from '../../actions';
import PrimaryButton from '@/components/PrimaryButton';
import KanbanBoard from '@/components/KanbanBoard';

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
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'kanban' | 'chat' | 'documents'>('kanban'); // Default to kanban
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

  const [isGenerating, setIsGenerating] = useState(false);
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
              onClick={() => setActiveTab('chat')}
              className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chat
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
      ) : activeTab === 'chat' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Chat</h2>
            <p className="text-sm sm:text-base text-gray-600">Chat with AI about {project.name} - ask questions, get updates, and manage your project</p>
          </div>
          
          {/* Chat Interface */}
          <div className="bg-white rounded-lg border border-gray-200 h-[500px] sm:h-[600px] flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Brixem AI Assistant</h3>
              <p className="text-xs sm:text-sm text-gray-600">How can I help you with {project.name} today?</p>
            </div>
            
            {/* Chat Messages Area */}
            <div className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-y-auto min-h-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">B</span>
                  </div>
                  <div className="bg-white text-gray-900 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 max-w-[calc(100%-3rem)] sm:max-w-2xl">
                    <p className="text-xs sm:text-sm leading-relaxed">Hi! I&apos;m here to help you with {project.name}. I can answer questions about your project, help you track progress, generate documents, and more. What would you like to know?</p>
                    <p className="text-xs mt-1 sm:mt-2 text-gray-400">Just now</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3 justify-end">
                  <div className="bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl max-w-[calc(100%-3rem)] sm:max-w-2xl">
                    <p className="text-xs sm:text-sm leading-relaxed">Can you show me the current project status?</p>
                    <p className="text-xs mt-1 sm:mt-2 text-blue-100">Just now</p>
                  </div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-medium text-xs">U</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#23c6e6] to-[#4b1fa7] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xs">B</span>
                  </div>
                  <div className="bg-white text-gray-900 px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 max-w-[calc(100%-3rem)] sm:max-w-2xl">
                    <p className="text-xs sm:text-sm leading-relaxed">Of course! {project.name} is currently in <strong>{project.status}</strong> status. Here&apos;s what I can tell you:</p>
                    <ul className="text-xs sm:text-sm mt-2 space-y-1 text-gray-700">
                      <li>• Location: {project.location}</li>
                      {project.size_sqft && <li>• Size: {project.size_sqft} sq ft</li>}
                      {project.description && <li>• Description: {project.description}</li>}
                    </ul>
                    <p className="text-xs mt-1 sm:mt-2 text-gray-400">Just now</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chat Input */}
            <div className="p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex space-x-2 sm:space-x-3">
                <input
                  type="text"
                  placeholder="Ask me about your project..."
                  className="flex-1 border border-gray-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#23c6e6] to-[#4b1fa7] text-white rounded-lg sm:rounded-xl text-sm font-medium hover:opacity-90 transition flex-shrink-0">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'documents' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Project Documents</h2>
            <p className="text-sm sm:text-base text-gray-600">View and manage project documents for {project.name}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Project Details */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Project Overview</h2>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Basic Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Project Name</label>
                        <p className="text-sm sm:text-base text-gray-900">{project.name}</p>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-sm sm:text-base text-gray-900">{project.location}</p>
                      </div>
                      {project.size_sqft && (
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Size</label>
                          <p className="text-sm sm:text-base text-gray-900">{project.size_sqft} sq ft</p>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Status</label>
                        <p className="text-sm sm:text-base text-gray-900 capitalize">{project.status}</p>
                      </div>
                    </div>
                  </div>

                  {project.description && (
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Description</h3>
                      <p className="text-sm sm:text-base text-gray-700">{project.description}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Timeline</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Created</label>
                        <p className="text-sm sm:text-base text-gray-900">{new Date(project.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <p className="text-sm sm:text-base text-gray-900">{new Date(project.updated_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h3>
                
                <div className="space-y-3 sm:space-y-4">
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
                        <span className="text-sm sm:text-base">Generate Scope & Estimate</span>
                      </>
                    )}
                  </PrimaryButton>

                  <button
                    onClick={() => setActiveTab('kanban')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2" />
                    </svg>
                    <span className="text-sm sm:text-base">View Kanban Board</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm sm:text-base">View Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('documents')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">View Documents</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/homeowner')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm sm:text-base">Edit Project</span>
                  </button>

                  <button
                    onClick={() => router.push('/dashboard/homeowner')}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm sm:text-base">View Timeline</span>
                  </button>
                </div>

                {/* Workspace Info */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Workspace</h4>
                  <p className="text-xs sm:text-sm text-gray-900">{project.workspaces[0]?.name || 'Unknown'}</p>
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-4 sm:mt-6 bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2 sm:mb-3">Next Steps</h3>
                <ol className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">1</span>
                    <span>Generate your Scope of Work and Estimate</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">2</span>
                    <span>Review and customize the generated documents</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">3</span>
                    <span>Download PDFs and share with contractors</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
