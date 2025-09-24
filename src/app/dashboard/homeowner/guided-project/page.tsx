'use client';

import { useState, useEffect, useRef } from 'react';
import { projectTemplates } from '@/lib/project-templates';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function GuidedProjectPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Welcome to Brixem! 🎉 I'm your AI construction assistant. I'll guide you through creating a comprehensive project plan with detailed scope, timeline, and cost estimates.\n\nLet's start by gathering some key information about your project:\n\nWhat type of project is this?\n• Extension (rear, side, or wrap-around)\n• Loft conversion\n• New build\n• Renovation/refurbishment\n• Commercial development\n• Other (please specify)\n\nPlease describe your project type and I'll guide you through the next steps!"
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [projectPhase, setProjectPhase] = useState<'initial' | 'scope' | 'wbs' | 'schedule' | 'cost' | 'complete'>('initial');
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectData, setProjectData] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [, setSelectedTemplate] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initialQuestions = [
    {
      question: "What type of project is this?",
      options: ["Extension (rear, side, or wrap-around)", "Loft conversion", "New build", "Renovation/refurbishment", "Commercial development", "Other (please specify)"]
    },
    {
      question: "Where is the project located?",
      options: ["London", "Other UK location", "International"]
    },
    {
      question: "What's the approximate area/size?",
      options: ["Under 20m²", "20-50m²", "50-100m²", "100-200m²", "Over 200m²"]
    },
    {
      question: "What's your budget range?",
      options: ["Under £50k", "£50k-£100k", "£100k-£250k", "£250k-£500k", "Over £500k"]
    },
    {
      question: "What's your preferred finish level?",
      options: ["Basic (cost-effective)", "Standard (good quality)", "Premium (high-end)"]
    }
  ];

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: message };
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      if (projectPhase === 'initial') {
        await handleInitialPhase(message);
      } else if (projectPhase === 'scope') {
        await handleScopePhase(message);
      } else if (projectPhase === 'wbs') {
        await handleWBSPhase(message);
      } else if (projectPhase === 'schedule') {
        await handleSchedulePhase(message);
      } else if (projectPhase === 'cost') {
        await handleCostPhase(message);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage: Message = {
        role: "ai",
        text: "I apologize, but I encountered an error. Please try again or contact support if the issue persists."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialPhase = async (message: string) => {
    const updatedProjectData = { ...projectData };
    
    // Check if user wants to use a template
    if (message.toLowerCase().includes('template') || message.toLowerCase().includes('kitchen') || message.toLowerCase().includes('bathroom') || message.toLowerCase().includes('extension')) {
      const templateMessage: Message = {
        role: "ai",
        text: `Great! I can help you with a template-based project. Here are some popular project templates:\n\n${projectTemplates.map((template, index) => 
          `${index + 1}. **${template.name}**\n   ${template.description}\n   Duration: ${template.estimatedDuration}\n   Budget: ${template.budgetRange}\n`
        ).join('\n')}\n\nWhich template would you like to use? Just type the number (1-${projectTemplates.length}) or the template name.`
      };
      setMessages(prev => [...prev, templateMessage]);
      return;
    }

    // Check if user selected a template by number
    const templateNumber = parseInt(message);
    if (templateNumber >= 1 && templateNumber <= projectTemplates.length) {
      const template = projectTemplates[templateNumber - 1];
      setSelectedTemplate(template.id);
      
      const templateResponse: Message = {
        role: "ai",
        text: `Excellent choice! You've selected the **${template.name}** template.\n\n${template.description}\n\nEstimated Duration: ${template.estimatedDuration}\nBudget Range: ${template.budgetRange}\n\nI'll now create your project using this template. Let me generate the detailed project plan...`
      };
      setMessages(prev => [...prev, templateResponse]);
      
      // Generate project using template
      await generateProjectFromTemplate(template);
      return;
    }
    
    if (currentStep < initialQuestions.length) {
      const currentQ = initialQuestions[currentStep];
      updatedProjectData[currentQ.question] = message;
      setProjectData(updatedProjectData);
      setCurrentStep(currentStep + 1);

      if (currentStep + 1 < initialQuestions.length) {
        const nextQ = initialQuestions[currentStep + 1];
        let nextMessage = `Great! Thanks for that information.\n\n${nextQ.question}`;
        
        if (nextQ.options.length > 0) {
          nextMessage += `\n\nPlease choose from:\n${nextQ.options.map((opt) => `• ${opt}`).join('\n')}`;
        }
        
        const response: Message = { role: "ai", text: nextMessage };
        setMessages(prev => [...prev, response]);
      } else {
        // All questions answered, move to scope generation
        setProjectPhase('scope');
        await generateScopeOfWorks(updatedProjectData);
      }
    }
  };

  const generateScopeOfWorks = async (data: Record<string, string>) => {
    setIsGenerating(true);
    
    const scopeMessage: Message = {
      role: "ai",
      text: `🎯 SCOPE OF WORKS GENERATED\n\nBased on your project details, here's your comprehensive Scope of Works:\n\nProject: ${data.projectType || 'Not specified'}\nLocation: ${data.location || 'Not specified'}\nBudget: ${data.budget || 'Not specified'}\n\nKey Components:\n• Demolition and site preparation\n• Foundation works\n• Structural elements\n• MEP (Mechanical, Electrical, Plumbing)\n• Internal finishes\n• External works\n\nRequired Consultants:\n• Architect\n• Structural Engineer\n• Party Wall Surveyor (if applicable)\n• Planning Consultant\n\nPlanning Requirements:\n• ${data.constraints?.includes('Conservation') ? 'Full planning permission required' : 'Permitted development may apply'}\n• Building regulations approval needed\n• Party wall agreements (if applicable)\n\nRisk Flags:\n• ${data.challenges?.includes('Party wall') ? 'Party wall issues require specialist attention' : 'No major access issues identified'}\n• ${data.constraints?.includes('Listed') ? 'Listed building consent required' : 'Standard planning process'}\n\n✅ Your Scope of Works is ready!\n\nWhat would you like to do next?\n• Proceed to Work Breakdown Structure\n• Revise project details\n• Continue with the next phase\n\nJust let me know what you'd prefer!`
    };
    
    setMessages(prev => [...prev, scopeMessage]);
    setIsGenerating(false);
  };

  const handleScopePhase = async (message: string) => {
    if (message.toLowerCase().includes('proceed') || message.toLowerCase().includes('wbs') || message.toLowerCase().includes('work breakdown') || message.toLowerCase().includes('continue') || message.toLowerCase().includes('next')) {
      setProjectPhase('wbs');
      await generateWorkBreakdownStructure();
    } else if (message.toLowerCase().includes('revise') || message.toLowerCase().includes('change') || message.toLowerCase().includes('edit')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the details. Which aspect would you like to change?\n\n• Project type\n• Location\n• Budget\n• Finish level\n• Start over\n\nJust tell me what you'd like to modify!"
      };
      setMessages(prev => [...prev, response]);
    } else {
      const response: Message = {
        role: "ai",
        text: "I'm ready to help! You can:\n\n• Proceed to Work Breakdown Structure\n• Revise project details\n• Continue with the next phase\n\nWhat would you like to do?"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateWorkBreakdownStructure = async () => {
    setIsGenerating(true);
    
    const wbsMessage: Message = {
      role: "ai",
      text: `🔨 WORK BREAKDOWN STRUCTURE (WBS)\n\nHere's your detailed task breakdown:\n\nLevel 1 - Project Phases:\n1. Pre-Construction (Client)\n2. Design & Planning (Architect)\n3. Construction (Contractor)\n4. Completion (Client)\n\nLevel 2 - Key Tasks:\n\nPre-Construction:\n• Site survey and measurements (Architect)\n• Planning application submission (Architect)\n• Party wall agreements (Party Wall Surveyor)\n• Building regulations approval (Architect)\n\nDesign & Planning:\n• Architectural drawings (Architect)\n• Structural calculations (Structural Engineer)\n• MEP design (MEP Consultant)\n• Tender documentation (Architect)\n\nConstruction:\n• Site setup and demolition (Contractor)\n• Foundation works (Contractor) - *Depends on: Planning approval*\n• Structural works (Contractor) - *Depends on: Foundation completion*\n• MEP installation (Contractor) - *Depends on: Structural completion*\n• Finishes (Contractor) - *Depends on: MEP completion*\n\nCompletion:\n• Snagging and handover (Contractor)\n• Final inspections (Building Control)\n• Project closeout (Client)\n\n✅ Your Work Breakdown Structure is complete!\n\nWhat would you like to do next?\n• Proceed to Project Schedule\n• Revise WBS details\n• Continue with the next phase\n\nJust let me know what you'd prefer!`
    };
    
    setMessages(prev => [...prev, wbsMessage]);
    setIsGenerating(false);
  };

  const handleWBSPhase = async (message: string) => {
    if (message.toLowerCase().includes('proceed') || message.toLowerCase().includes('schedule') || message.toLowerCase().includes('continue') || message.toLowerCase().includes('next')) {
      setProjectPhase('schedule');
      await generateProjectSchedule();
    } else if (message.toLowerCase().includes('revise') || message.toLowerCase().includes('change') || message.toLowerCase().includes('edit')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the WBS. Which phase would you like to modify?\n\n• Pre-Construction\n• Design & Planning\n• Construction\n• Completion\n• Start over\n\nJust tell me what you'd like to change!"
      };
      setMessages(prev => [...prev, response]);
    } else {
      const response: Message = {
        role: "ai",
        text: "I'm ready to help! You can:\n\n• Proceed to Project Schedule\n• Revise WBS details\n• Continue with the next phase\n\nWhat would you like to do?"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateProjectSchedule = async () => {
    setIsGenerating(true);
    
    const startDate = new Date();
    const scheduleMessage: Message = {
      role: "ai",
      text: `📅 PROJECT SCHEDULE GENERATED\n\nProject Timeline: ${startDate.toLocaleDateString()} - ${new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\nKey Milestones:\n\nPhase 1 - Pre-Construction (4 weeks):\n• Week 1-2: Site survey and planning application\n• Week 3-4: Party wall agreements and building regulations\n\nPhase 2 - Design & Planning (6 weeks):\n• Week 5-8: Architectural and structural design\n• Week 9-10: MEP design and tender documentation\n\nPhase 3 - Construction (20 weeks):\n• Week 11-12: Site setup and demolition\n• Week 13-16: Foundation works\n• Week 17-20: Structural works\n• Week 21-24: MEP installation\n• Week 25-30: Finishes and completion\n\nPhase 4 - Completion (2 weeks):\n• Week 31-32: Snagging and handover\n\nCritical Path: Planning approval → Foundation works → Structural works → MEP → Finishes\n\n✅ Your project schedule is ready!\n\nWhat would you like to do next?\n• Proceed to Cost Estimation\n• Revise schedule details\n• Continue with the next phase\n\nJust let me know what you'd prefer!`
    };
    
    setMessages(prev => [...prev, scheduleMessage]);
    setIsGenerating(false);
  };

  const handleSchedulePhase = async (message: string) => {
    if (message.toLowerCase().includes('proceed') || message.toLowerCase().includes('cost') || message.toLowerCase().includes('estimation') || message.toLowerCase().includes('continue') || message.toLowerCase().includes('next')) {
      setProjectPhase('cost');
      await generateCostEstimation();
    } else if (message.toLowerCase().includes('revise') || message.toLowerCase().includes('change') || message.toLowerCase().includes('edit')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the schedule. Which phase would you like to modify?\n\n• Pre-Construction timeline\n• Design & Planning timeline\n• Construction timeline\n• Completion timeline\n• Start over\n\nJust tell me what you'd like to change!"
      };
      setMessages(prev => [...prev, response]);
    } else {
      const response: Message = {
        role: "ai",
        text: "I'm ready to help! You can:\n\n• Proceed to Cost Estimation\n• Revise schedule details\n• Continue with the next phase\n\nWhat would you like to do?"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const generateCostEstimation = async () => {
    setIsGenerating(true);
    
    const costMessage: Message = {
      role: "ai",
      text: `💰 COST ESTIMATION GENERATED\n\nProject: ${projectData.projectType || 'Extension'}\nLocation: ${projectData.location || 'UK'}\nEstimated Total: £${getCostEstimate(projectData.budget).toLocaleString()}\n\nItemized Breakdown:\n\nConstruction Costs:\n• Demolition & site prep: £8,000 - £12,000\n• Foundation works: £15,000 - £25,000\n• Structural works: £25,000 - £40,000\n• MEP installation: £12,000 - £18,000\n• Internal finishes: £20,000 - £35,000\n• External works: £5,000 - £10,000\n\nProfessional Fees:\n• Architect: £8,000 - £15,000\n• Structural Engineer: £3,000 - £6,000\n• Party Wall Surveyor: £1,500 - £3,000\n• Planning Consultant: £2,000 - £4,000\n\nAdditional Costs:\n• Building regulations: £1,500 - £3,000\n• Planning fees: £500 - £1,000\n• Party wall agreements: £1,000 - £2,000\n• Contingency (10%): £${Math.round(getCostEstimate(projectData.budget) * 0.1).toLocaleString()}\n\nFinish Tiers:\n• Basic: -20% from estimate\n• Standard: Current estimate\n• Premium: +30% from estimate\n\n✅ Your cost estimation is complete!\n\nWhat would you like to do next?\n• Create project and finish setup\n• Revise cost assumptions\n• Continue with project creation\n\nJust let me know what you'd prefer!`
    };
    
    setMessages(prev => [...prev, costMessage]);
    setIsGenerating(false);
  };

  const handleCostPhase = async (message: string) => {
    if (message.toLowerCase().includes('create') || message.toLowerCase().includes('finish') || message.toLowerCase().includes('setup') || message.toLowerCase().includes('complete') || message.toLowerCase().includes('yes')) {
      setProjectPhase('complete');
      await completeProjectSetup();
    } else if (message.toLowerCase().includes('revise') || message.toLowerCase().includes('change') || message.toLowerCase().includes('edit')) {
      const response: Message = {
        role: "ai",
        text: "Let's revise the cost assumptions. Which aspect would you like to modify?\n\n• Budget range\n• Finish level\n• Project scope\n• Location factors\n• Start over\n\nJust tell me what you'd like to change!"
      };
      setMessages(prev => [...prev, response]);
    } else {
      const response: Message = {
        role: "ai",
        text: "I'm ready to help! You can:\n\n• Create project and finish setup\n• Revise cost assumptions\n• Continue with project creation\n\nWhat would you like to do?"
      };
      setMessages(prev => [...prev, response]);
    }
  };

  const completeProjectSetup = async () => {
    // Extract structured project data from AI responses
    const projectData = extractProjectDataFromAI();
    
    const completionMessage: Message = {
      role: "ai",
      text: `🎉 PROJECT CREATION COMPLETE!\n\nYour comprehensive project plan has been generated and saved:\n\n✅ Scope of Works\n✅ Work Breakdown Structure\n✅ Project Schedule\n✅ Cost Estimation\n\nCreating your project dashboard with all tasks and subtasks...\n\nRedirecting you to your dashboard in 3 seconds...`
    };

    setMessages(prev => [...prev, completionMessage]);
    
    // Create the project in the database with AI-generated data
    try {
      const result = await createProjectFromAIData(projectData);
      console.log('Project creation result:', result);
      
      // Show success message
      const successMessage: Message = {
        role: "ai",
        text: `✅ Project "${projectData.name}" created successfully!\n\nYour project is now ready with all phases, tasks, and subtasks. You can start tracking your progress immediately.`
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error creating project from AI data:', error);
      
      // Try fallback project creation using regular API
      try {
        console.log('Attempting fallback project creation...');
        const fallbackResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: projectData.name,
            type: projectData.projectType,
            location: projectData.location,
            description: projectData.description,
            workspace_id: 'default-workspace' // Fallback workspace
          }),
        });

        if (fallbackResponse.ok) {
          const fallbackResult = await fallbackResponse.json();
          console.log('Fallback project created:', fallbackResult);
          
          const fallbackMessage: Message = {
            role: "ai",
            text: `✅ Project "${projectData.name}" created successfully using fallback method!\n\nYour project is ready, though some advanced features may not be available.`
          };
          setMessages(prev => [...prev, fallbackMessage]);
        } else {
          throw new Error('Fallback creation also failed');
        }
      } catch (fallbackError) {
        console.error('Fallback project creation also failed:', fallbackError);
        
        // Show error message to user
        const errorMessage: Message = {
          role: "ai",
          text: `❌ There was an error creating your project: ${error instanceof Error ? error.message : 'Unknown error'}\n\nDon't worry, your project data is saved. Please try refreshing the page or contact support if the issue persists.`
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = '/dashboard/homeowner';
    }, 3000);
  };

  const extractProjectDataFromAI = () => {
    // Extract project details from the conversation
    const projectType = projectData['What type of project is this?'] || 'Extension';
    const location = projectData['Where is the project located?'] || 'UK';
    const area = projectData['What\'s the approximate area/size?'] || '50-100m²';
    const budget = projectData['What\'s your budget range?'] || '£100k-£250k';
    const finishLevel = projectData['What\'s your preferred finish level?'] || 'Standard (good quality)';
    
    // Generate project name based on type and location
    const projectName = `${projectType} - ${location}`;
    
    // Calculate estimated cost
    const estimatedCost = getCostEstimate(budget);
    
    // Generate AI-driven project phases and tasks
    const phases = generateProjectPhases(projectType);
    
    return {
      name: projectName,
      description: `AI-generated ${projectType.toLowerCase()} project in ${location}`,
      projectType,
      location,
      area,
      budget,
      finishLevel,
      estimatedCost,
      phases,
      status: 'planning' as const,
      progress: 0
    };
  };

  const generateProjectFromTemplate = async (template: {
    id: string;
    name: string;
    description: string;
    category: string;
    estimatedDuration: string;
    budgetRange: string;
    phases: Array<{
      id: string;
      name: string;
      description: string;
      estimatedDuration: string;
      tasks: Array<{
        id: string;
        name: string;
        description: string;
        assignee: string;
        estimatedDuration: string;
        subtasks: Array<{
          id: string;
          name: string;
          description: string;
        }>;
      }>;
    }>;
  }) => {
    setIsGenerating(true);
    
    // Convert template to project data format
    const templateProjectData = {
      name: template.name,
      description: template.description,
      projectType: template.category,
      location: 'UK', // Default location
      area: 'Standard',
      budget: template.budgetRange,
      finishLevel: 'Standard (good quality)',
      estimatedCost: getCostEstimateFromRange(template.budgetRange),
      phases: template.phases.map((phase) => ({
        id: phase.id,
        name: phase.name,
        status: 'pending',
        tasks: phase.tasks.map((task) => ({
          id: task.id,
          name: task.name,
          status: 'pending',
          assignee: task.assignee,
          subtasks: task.subtasks.map((subtask) => ({
            id: subtask.id,
            name: subtask.name,
            status: 'pending'
          }))
        }))
      })),
      status: 'planning',
      progress: 0
    };

    const templateMessage: Message = {
      role: "ai",
      text: `🎯 **${template.name.toUpperCase()} PROJECT GENERATED**\n\nBased on the ${template.name} template, here's your comprehensive project plan:\n\n**Project Overview:**\n• Duration: ${template.estimatedDuration}\n• Budget: ${template.budgetRange}\n• Category: ${template.category.charAt(0).toUpperCase() + template.category.slice(1)}\n\n**Project Phases:**\n${template.phases.map((phase, index: number) => 
        `${index + 1}. **${phase.name}** (${phase.estimatedDuration})\n   ${phase.description}\n   Tasks: ${phase.tasks.length}`
      ).join('\n\n')}\n\n✅ Your project is ready with all phases, tasks, and subtasks!\n\nCreating your project dashboard...`
    };
    
    setMessages(prev => [...prev, templateMessage]);
    setIsGenerating(false);
    
    // Create the project in the database
    try {
      const result = await createProjectFromAIData(templateProjectData);
      console.log('Template project created successfully:', result);
      
      const successMessage: Message = {
        role: "ai",
        text: `✅ Project "${template.name}" created successfully!\n\nYour project is now ready with all phases, tasks, and subtasks. You can start tracking your progress immediately.\n\nRedirecting you to your dashboard in 3 seconds...`
      };
      setMessages(prev => [...prev, successMessage]);
      
    } catch (error) {
      console.error('Error creating template project:', error);
      
      const errorMessage: Message = {
        role: "ai",
        text: `❌ There was an error creating your project: ${error instanceof Error ? error.message : 'Unknown error'}\n\nDon't worry, your project data is saved. Please try refreshing the page or contact support if the issue persists.`
      };
      setMessages(prev => [...prev, errorMessage]);
    }
    
    // Redirect to dashboard after 3 seconds
    setTimeout(() => {
      window.location.href = '/dashboard/homeowner';
    }, 3000);
  };

  const getCostEstimateFromRange = (budgetRange: string): number => {
    const ranges: Record<string, number> = {
      '£8,000 - £20,000': 14000,
      '£15,000 - £35,000': 25000,
      '£50,000 - £150,000': 100000
    };
    return ranges[budgetRange] || 50000;
  };

  const generateProjectPhases = (projectType: string) => {
    const basePhases = [
      {
        id: 'pre-construction',
        name: 'Pre-Construction',
        status: 'pending' as const,
        tasks: [
          {
            id: 'site-survey',
            name: 'Site Survey and Measurements',
            status: 'pending' as const,
            assignee: 'Architect',
            subtasks: [
              { id: 'measure-site', name: 'Measure existing structure', status: 'pending' as const },
              { id: 'assess-conditions', name: 'Assess site conditions', status: 'pending' as const },
              { id: 'document-findings', name: 'Document findings', status: 'pending' as const }
            ]
          },
          {
            id: 'planning-application',
            name: 'Planning Application Submission',
            status: 'pending' as const,
            assignee: 'Architect',
            subtasks: [
              { id: 'prepare-drawings', name: 'Prepare planning drawings', status: 'pending' as const },
              { id: 'submit-application', name: 'Submit planning application', status: 'pending' as const },
              { id: 'monitor-progress', name: 'Monitor application progress', status: 'pending' as const }
            ]
          }
        ]
      },
      {
        id: 'design-planning',
        name: 'Design & Planning',
        status: 'pending' as const,
        tasks: [
          {
            id: 'architectural-design',
            name: 'Architectural Design',
            status: 'pending' as const,
            assignee: 'Architect',
            subtasks: [
              { id: 'concept-design', name: 'Develop concept design', status: 'pending' as const },
              { id: 'detailed-drawings', name: 'Create detailed drawings', status: 'pending' as const },
              { id: '3d-visualization', name: 'Create 3D visualization', status: 'pending' as const }
            ]
          },
          {
            id: 'structural-design',
            name: 'Structural Design',
            status: 'pending' as const,
            assignee: 'Structural Engineer',
            subtasks: [
              { id: 'structural-calculations', name: 'Perform structural calculations', status: 'pending' as const },
              { id: 'foundation-design', name: 'Design foundation system', status: 'pending' as const },
              { id: 'structural-drawings', name: 'Prepare structural drawings', status: 'pending' as const }
            ]
          }
        ]
      },
      {
        id: 'construction',
        name: 'Construction',
        status: 'pending' as const,
        tasks: [
          {
            id: 'site-setup',
            name: 'Site Setup and Demolition',
            status: 'pending' as const,
            assignee: 'Contractor',
            subtasks: [
              { id: 'site-preparation', name: 'Prepare site for construction', status: 'pending' as const },
              { id: 'demolition-work', name: 'Perform demolition work', status: 'pending' as const },
              { id: 'waste-removal', name: 'Remove construction waste', status: 'pending' as const }
            ]
          },
          {
            id: 'foundation-works',
            name: 'Foundation Works',
            status: 'pending' as const,
            assignee: 'Contractor',
            subtasks: [
              { id: 'excavation', name: 'Excavate foundation area', status: 'pending' as const },
              { id: 'concrete-pour', name: 'Pour foundation concrete', status: 'pending' as const },
              { id: 'curing', name: 'Allow concrete to cure', status: 'pending' as const }
            ]
          }
        ]
      },
      {
        id: 'completion',
        name: 'Completion',
        status: 'pending' as const,
        tasks: [
          {
            id: 'snagging',
            name: 'Snagging and Handover',
            status: 'pending' as const,
            assignee: 'Contractor',
            subtasks: [
              { id: 'final-inspection', name: 'Conduct final inspection', status: 'pending' as const },
              { id: 'snag-list', name: 'Create snag list', status: 'pending' as const },
              { id: 'handover', name: 'Handover to client', status: 'pending' as const }
            ]
          }
        ]
      }
    ];

    // Customize phases based on project type
    if (projectType.toLowerCase().includes('loft')) {
      basePhases[1].tasks.push({
        id: 'loft-conversion',
        name: 'Loft Conversion Design',
        status: 'pending' as const,
        assignee: 'Architect',
        subtasks: [
          { id: 'structural-assessment', name: 'Assess structural capacity', status: 'pending' as const },
          { id: 'staircase-design', name: 'Design staircase access', status: 'pending' as const },
          { id: 'fire-safety', name: 'Design fire safety measures', status: 'pending' as const }
        ]
      });
    }

    return basePhases;
  };

  const createProjectFromAIData = async (projectData: {
    name: string;
    description: string;
    projectType: string;
    location: string;
    area: string;
    budget: string;
    finishLevel: string;
    estimatedCost: number;
    phases: Array<{
      id: string;
      name: string;
      status: string;
      tasks: Array<{
        id: string;
        name: string;
        status: string;
        assignee: string;
        subtasks: Array<{
          id: string;
          name: string;
          status: string;
        }>;
      }>;
    }>;
    status: string;
    progress: number;
  }) => {
    try {
      console.log('Creating AI project with data:', projectData);
      
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectData.name,
          description: projectData.description,
          projectType: projectData.projectType,
          location: projectData.location,
          area: projectData.area,
          budget: projectData.budget,
          finishLevel: projectData.finishLevel,
          estimatedCost: projectData.estimatedCost,
          phases: projectData.phases,
          status: projectData.status,
          progress: projectData.progress
        }),
      });

      console.log('API response status:', response.status);
      console.log('API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Failed to create project: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Project created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const getCostEstimate = (budget: string) => {
    const budgetRanges: Record<string, number> = {
      'Under £50k': 45000,
      '£50k-£100k': 75000,
      '£100k-£250k': 175000,
      '£250k-£500k': 375000,
      'Over £500k': 600000
    };
    return budgetRanges[budget] || 100000;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(currentInput);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Guided Project Creation</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Phase: {projectPhase.charAt(0).toUpperCase() + projectPhase.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">AI Construction Assistant</h2>
                <p className="text-sm text-gray-500">
                  Guiding you through comprehensive project creation
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(((currentStep + 1) / initialQuestions.length) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    <span className="text-sm">Generating...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <input
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response here..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend(currentInput)}
                disabled={!currentInput.trim() || isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}