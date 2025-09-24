export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'renovation' | 'new-build';
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
}

export const projectTemplates: ProjectTemplate[] = [
  {
    id: 'kitchen-renovation',
    name: 'Kitchen Renovation',
    description: 'Complete kitchen renovation including cabinets, countertops, and appliances',
    category: 'renovation',
    estimatedDuration: '8-12 weeks',
    budgetRange: '£15,000 - £35,000',
    phases: [
      {
        id: 'planning-design',
        name: 'Planning & Design',
        description: 'Initial planning, design, and permit acquisition',
        estimatedDuration: '2-3 weeks',
        tasks: [
          {
            id: 'design-consultation',
            name: 'Design Consultation',
            description: 'Meet with designer to plan layout and select materials',
            assignee: 'Interior Designer',
            estimatedDuration: '1 week',
            subtasks: [
              { id: 'measure-space', name: 'Measure existing kitchen space', description: 'Take accurate measurements' },
              { id: 'create-layout', name: 'Create new layout design', description: 'Design optimal kitchen layout' },
              { id: 'select-materials', name: 'Select materials and finishes', description: 'Choose cabinets, countertops, etc.' }
            ]
          },
          {
            id: 'permits-approvals',
            name: 'Permits & Approvals',
            description: 'Obtain necessary permits and approvals',
            assignee: 'Architect',
            estimatedDuration: '1-2 weeks',
            subtasks: [
              { id: 'submit-permits', name: 'Submit permit applications', description: 'File necessary permits' },
              { id: 'schedule-inspections', name: 'Schedule inspections', description: 'Arrange required inspections' }
            ]
          }
        ]
      },
      {
        id: 'demolition-prep',
        name: 'Demolition & Preparation',
        description: 'Remove existing kitchen and prepare space',
        estimatedDuration: '1-2 weeks',
        tasks: [
          {
            id: 'demolition',
            name: 'Demolition Work',
            description: 'Remove existing cabinets, countertops, and fixtures',
            assignee: 'Contractor',
            estimatedDuration: '3-5 days',
            subtasks: [
              { id: 'remove-cabinets', name: 'Remove existing cabinets', description: 'Carefully remove old cabinets' },
              { id: 'remove-countertops', name: 'Remove countertops', description: 'Remove old countertops' },
              { id: 'disconnect-utilities', name: 'Disconnect utilities', description: 'Turn off water, gas, electricity' }
            ]
          }
        ]
      },
      {
        id: 'construction',
        name: 'Construction & Installation',
        description: 'Install new kitchen components',
        estimatedDuration: '4-6 weeks',
        tasks: [
          {
            id: 'electrical-plumbing',
            name: 'Electrical & Plumbing',
            description: 'Update electrical and plumbing systems',
            assignee: 'Electrician/Plumber',
            estimatedDuration: '1-2 weeks',
            subtasks: [
              { id: 'update-wiring', name: 'Update electrical wiring', description: 'Install new outlets and lighting' },
              { id: 'update-plumbing', name: 'Update plumbing', description: 'Install new water lines' }
            ]
          },
          {
            id: 'install-cabinets',
            name: 'Install Cabinets',
            description: 'Install new kitchen cabinets',
            assignee: 'Cabinet Installer',
            estimatedDuration: '1-2 weeks',
            subtasks: [
              { id: 'level-cabinets', name: 'Level and secure cabinets', description: 'Ensure proper installation' },
              { id: 'install-hardware', name: 'Install cabinet hardware', description: 'Add handles and hinges' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'bathroom-renovation',
    name: 'Bathroom Renovation',
    description: 'Complete bathroom renovation with modern fixtures and finishes',
    category: 'renovation',
    estimatedDuration: '6-10 weeks',
    budgetRange: '£8,000 - £20,000',
    phases: [
      {
        id: 'planning-design',
        name: 'Planning & Design',
        description: 'Design new bathroom layout and select fixtures',
        estimatedDuration: '2-3 weeks',
        tasks: [
          {
            id: 'bathroom-design',
            name: 'Bathroom Design',
            description: 'Create new bathroom layout and select fixtures',
            assignee: 'Interior Designer',
            estimatedDuration: '1-2 weeks',
            subtasks: [
              { id: 'measure-bathroom', name: 'Measure bathroom space', description: 'Take accurate measurements' },
              { id: 'select-fixtures', name: 'Select fixtures and finishes', description: 'Choose toilet, sink, shower, etc.' }
            ]
          }
        ]
      },
      {
        id: 'demolition-prep',
        name: 'Demolition & Preparation',
        description: 'Remove existing bathroom fixtures',
        estimatedDuration: '1 week',
        tasks: [
          {
            id: 'bathroom-demolition',
            name: 'Bathroom Demolition',
            description: 'Remove existing fixtures and tiles',
            assignee: 'Contractor',
            estimatedDuration: '2-3 days',
            subtasks: [
              { id: 'remove-fixtures', name: 'Remove old fixtures', description: 'Remove toilet, sink, shower' },
              { id: 'remove-tiles', name: 'Remove old tiles', description: 'Remove wall and floor tiles' }
            ]
          }
        ]
      },
      {
        id: 'construction',
        name: 'Construction & Installation',
        description: 'Install new bathroom fixtures and finishes',
        estimatedDuration: '3-6 weeks',
        tasks: [
          {
            id: 'plumbing-work',
            name: 'Plumbing Work',
            description: 'Update plumbing for new fixtures',
            assignee: 'Plumber',
            estimatedDuration: '1-2 weeks',
            subtasks: [
              { id: 'install-pipes', name: 'Install new pipes', description: 'Install water and waste lines' },
              { id: 'install-fixtures', name: 'Install new fixtures', description: 'Install toilet, sink, shower' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'home-extension',
    name: 'Home Extension',
    description: 'Single-story or two-story home extension',
    category: 'new-build',
    estimatedDuration: '16-24 weeks',
    budgetRange: '£50,000 - £150,000',
    phases: [
      {
        id: 'planning-design',
        name: 'Planning & Design',
        description: 'Architectural design and planning permission',
        estimatedDuration: '8-12 weeks',
        tasks: [
          {
            id: 'architectural-design',
            name: 'Architectural Design',
            description: 'Create detailed architectural plans',
            assignee: 'Architect',
            estimatedDuration: '4-6 weeks',
            subtasks: [
              { id: 'site-survey', name: 'Site survey', description: 'Survey existing property' },
              { id: 'create-plans', name: 'Create architectural plans', description: 'Design extension layout' },
              { id: 'planning-application', name: 'Submit planning application', description: 'Apply for planning permission' }
            ]
          }
        ]
      },
      {
        id: 'foundation-work',
        name: 'Foundation Work',
        description: 'Excavation and foundation construction',
        estimatedDuration: '2-3 weeks',
        tasks: [
          {
            id: 'excavation',
            name: 'Excavation',
            description: 'Excavate foundation area',
            assignee: 'Groundworker',
            estimatedDuration: '1 week',
            subtasks: [
              { id: 'mark-foundation', name: 'Mark foundation area', description: 'Mark out foundation boundaries' },
              { id: 'excavate-ground', name: 'Excavate ground', description: 'Dig foundation trenches' }
            ]
          }
        ]
      },
      {
        id: 'construction',
        name: 'Construction',
        description: 'Build extension structure',
        estimatedDuration: '8-12 weeks',
        tasks: [
          {
            id: 'structural-work',
            name: 'Structural Work',
            description: 'Build walls, roof, and structure',
            assignee: 'Builder',
            estimatedDuration: '6-8 weeks',
            subtasks: [
              { id: 'build-walls', name: 'Build walls', description: 'Construct extension walls' },
              { id: 'install-roof', name: 'Install roof', description: 'Build and install roof structure' },
              { id: 'install-windows', name: 'Install windows', description: 'Fit windows and doors' }
            ]
          }
        ]
      }
    ]
  }
];

export function getTemplateById(id: string): ProjectTemplate | undefined {
  return projectTemplates.find(template => template.id === id);
}

export function getTemplatesByCategory(category: string): ProjectTemplate[] {
  return projectTemplates.filter(template => template.category === category);
}

export function getAllTemplates(): ProjectTemplate[] {
  return projectTemplates;
}
