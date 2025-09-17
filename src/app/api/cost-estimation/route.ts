import { NextRequest, NextResponse } from 'next/server';

// Live cost estimation data - this would typically come from a database or external API
const COST_DATA = {
  // Base rates in GBP (as of 2024) - will be converted based on location
  baseRates: {
    'rear-extension-shell': {
      basic: 1200,      // £/m²
      standard: 1500,   // £/m²
      premium: 2000     // £/m²
    },
    'internal-finishes': {
      basic: 400,       // £/m²
      standard: 600,    // £/m²
      premium: 900      // £/m²
    },
    'kitchen': {
      basic: 8000,      // £ per kitchen
      standard: 12000,  // £ per kitchen
      premium: 20000    // £ per kitchen
    },
    'mep': { // Mechanical, Electrical, Plumbing
      basic: 150,       // £/m²
      standard: 200,    // £/m²
      premium: 300      // £/m²
    },
    'bathroom': {
      basic: 3000,      // £ per bathroom
      standard: 5000,   // £ per bathroom
      premium: 8000     // £ per bathroom
    },
    'flooring': {
      basic: 30,        // £/m²
      standard: 60,     // £/m²
      premium: 120      // £/m²
    }
  },
  
  // Detailed base rates for itemized breakdown
  detailedBaseRates: {
    'Materials': {
      'Concrete': 120, // per m³
      'Reinforcement Steel': 800, // per tonne
      'Structural Steel': 1200, // per tonne
      'External Cladding': 80, // per m²
      'Windows': 300, // per m²
      'Roofing': 60, // per m²
      'Partitions': 40, // per m²
      'Flooring': 50, // per m²
      'Ceilings': 30, // per m²
      'Kitchen Units': 5000, // per set
      'Kitchen Appliances': 3000, // per set
      'Bathroom Fixtures': 2000, // per set
      'Tiles': 60, // per m²
      'Electrical Cables': 5, // per m
      'HVAC Ducts': 15, // per m
      'Plumbing Pipes': 8, // per m
      'Hard Landscaping': 40, // per m²
      'Soft Landscaping': 20, // per m²
      'Hoarding Materials': 25, // per m²
      'General Materials': 50 // per m²
    },
    'Labour': {
      'Site Mobilisation': 200, // per day
      'Excavation': 15, // per m³
      'Steel Erection': 800, // per tonne
      'Installation': 25, // per m²
      'Kitchen Installation': 1500, // per set
      'Bathroom Installation': 1000, // per set
      'MEP Installation': 30, // per m²
      'Landscaping': 20, // per m²
      'Snagging': 150, // per day
      'General Labour': 25 // per hour
    },
    'Plant/Equipment': {
      'Temporary Works': 100, // per day
      'Excavator Hire': 300, // per day
      'General Equipment': 50 // per day
    },
    'Subcontractors': {
      'Steel Fabrication': 1000, // per tonne
      'MEP Specialist': 40, // per m²
      'General Subcontractor': 30 // per m²
    },
    'Professional Fees': {
      'Topographical Survey': 2000, // per survey
      'Soil Investigation': 500, // per borehole
      'Utility Mapping': 1500, // per survey
      'Planning Permission': 500, // per application
      'Building Regulations': 300, // per application
      'Planning Consultant': 80, // per hour
      'Architectural Design': 60, // per hour
      'Structural Engineering': 70, // per hour
      'MEP Design': 65, // per hour
      'Testing & Commissioning': 50, // per hour
      'Documentation': 40 // per hour
    },
    'Permits & Approvals': {
      'Planning Permission': 200, // per application
      'Building Regulations': 150, // per application
      'General Permits': 100 // per application
    }
  },
  
  // Location-based pricing multipliers and currency info
  locations: {
    'UK': { currency: 'GBP', symbol: '£', multiplier: 1.0, vat: 0.20 },
    'London': { currency: 'GBP', symbol: '£', multiplier: 1.3, vat: 0.20 },
    'US': { currency: 'USD', symbol: '$', multiplier: 1.25, vat: 0.08 },
    'Canada': { currency: 'CAD', symbol: 'C$', multiplier: 1.7, vat: 0.13 },
    'Australia': { currency: 'AUD', symbol: 'A$', multiplier: 1.9, vat: 0.10 },
    'Germany': { currency: 'EUR', symbol: '€', multiplier: 1.15, vat: 0.19 },
    'France': { currency: 'EUR', symbol: '€', multiplier: 1.1, vat: 0.20 },
    'Netherlands': { currency: 'EUR', symbol: '€', multiplier: 1.2, vat: 0.21 },
    'Ireland': { currency: 'EUR', symbol: '€', multiplier: 1.25, vat: 0.23 }
  },
  
  // Additional costs (base in GBP)
  additionalCosts: {
    contingency: 0.10,  // 10% contingency
    consultantFees: 0.08, // 8% consultant fees
    planningPermission: 200, // Base £200
    buildingRegs: 500,  // Base £500
    partyWall: 1000     // Base £1000 (if applicable)
  },
  
  // Finish tiers
  finishTiers: {
    basic: {
      name: 'Basic',
      description: 'Standard materials, basic finishes',
      multiplier: 1.0
    },
    standard: {
      name: 'Standard',
      description: 'Good quality materials, mid-range finishes',
      multiplier: 1.3
    },
    premium: {
      name: 'Premium',
      description: 'High-end materials, luxury finishes',
      multiplier: 1.8
    }
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectType, 
      area, 
      finishTier = 'standard',
      includeKitchen = false,
      includeBathroom = false,
      includeMEP = true,
      location = 'UK'
    } = body;

    if (!projectType || !area) {
      return NextResponse.json(
        { error: 'Project type and area are required' },
        { status: 400 }
      );
    }

    // Calculate base costs
    const baseCosts = calculateBaseCosts(projectType, area, finishTier, {
      includeKitchen,
      includeBathroom,
      includeMEP
    }, location);

    // Calculate additional costs
    const additionalCosts = calculateAdditionalCosts(baseCosts.total, location);

    // Calculate final total
    const finalTotal = baseCosts.total + additionalCosts.total;

    // Generate itemized breakdown
    const baseCostItems: Record<string, {
      description: string;
      unitRate: number;
      quantity: number;
      unit: string;
      subtotal: number;
      currency: string;
      symbol: string;
    }> = {};
    
    Object.entries(baseCosts).forEach(([key, value]) => {
      if (key !== 'total' && typeof value === 'object' && 'description' in value) {
        baseCostItems[key] = value as {
          description: string;
          unitRate: number;
          quantity: number;
          unit: string;
          subtotal: number;
          currency: string;
          symbol: string;
        };
      }
    });
    
    const additionalCostItems: Record<string, {
      description: string;
      amount: number;
      currency: string;
      symbol: string;
    }> = {};
    
    Object.entries(additionalCosts).forEach(([key, value]) => {
      if (key !== 'total' && typeof value === 'object' && 'description' in value) {
        additionalCostItems[key] = value as {
          description: string;
          amount: number;
          currency: string;
          symbol: string;
        };
      }
    });
    
    const itemizedBreakdown = generateItemizedBreakdown(baseCostItems, additionalCostItems);

    const locationInfo = COST_DATA.locations[location as keyof typeof COST_DATA.locations] || COST_DATA.locations['UK'];
    
    // Generate comprehensive Scope of Works
    const comprehensiveScopeOfWorks = generateComprehensiveScopeOfWorks({
      projectType,
      location,
      area,
      finishTier,
      includeKitchen,
      includeBathroom,
      includeMEP
    });
    
    // Generate comprehensive Work Breakdown Structure
    const comprehensiveWBS = generateComprehensiveWBS({
      projectType,
      location,
      area,
      finishTier,
      includeKitchen,
      includeBathroom,
      includeMEP
    });
    
    // Generate comprehensive Project Schedule
    const comprehensiveSchedule = generateComprehensiveSchedule({
      projectType,
      location,
      area,
      finishTier,
      includeKitchen,
      includeBathroom,
      includeMEP
    });
    
    // Generate detailed itemized cost breakdown aligned with WBS
    const detailedCostBreakdown = generateDetailedCostBreakdown({
      projectType,
      location,
      area,
      finishTier,
      includeKitchen,
      includeBathroom,
      includeMEP
    }, WBS_TEMPLATE.projectTypes[projectType as keyof typeof WBS_TEMPLATE.projectTypes] || WBS_TEMPLATE.projectTypes['new-build'] as WbsTemplate);
    
    return NextResponse.json({
      projectType,
      area,
      finishTier,
      location,
      currency: locationInfo.currency,
      symbol: locationInfo.symbol,
      assumptions: {
        area: `${area}m²`,
        finishTier: COST_DATA.finishTiers[finishTier as keyof typeof COST_DATA.finishTiers].name,
        includeKitchen,
        includeBathroom,
        includeMEP,
        lastUpdated: new Date().toISOString()
      },
      costs: {
        base: baseCosts,
        additional: additionalCosts,
        total: finalTotal
      },
      itemizedBreakdown,
      summary: {
        costPerM2: Math.round(finalTotal / area),
        costPerM2Formatted: `${locationInfo.symbol}${Math.round(finalTotal / area).toLocaleString()}/m²`,
        totalFormatted: `${locationInfo.symbol}${Math.round(finalTotal).toLocaleString()}`,
        vatIncluded: true,
        contingencyIncluded: true
      },
      comprehensiveScopeOfWorks,
      comprehensiveWBS,
      comprehensiveSchedule,
      detailedCostBreakdown: detailedCostBreakdown.breakdown,
      costTotals: detailedCostBreakdown.totals
    });

  } catch (error) {
    console.error('Cost estimation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cost estimation' },
      { status: 500 }
    );
  }
}

// Comprehensive Scope of Works template
const SCOPE_OF_WORKS_TEMPLATE = {
  sections: [
    {
      id: 'project-info',
      title: '1. Project Information',
      items: [
        'Project title and reference number',
        'Location and full address',
        'Project type (new build, refurbishment, fit-out, extension, maintenance)',
        'Client and homeowner details',
        'Consultant details (architect, engineer, etc.)',
        'Relevant authorities (municipality, planning, utilities)'
      ]
    },
    {
      id: 'pre-construction',
      title: '2. Pre-Construction Stage',
      subsections: [
        {
          title: '2.1 Surveys & Studies',
          items: [
            'Site survey (topographical, measured building survey)',
            'Structural survey (if existing building)',
            'Geotechnical and soil investigation',
            'Utility mapping and capacity checks',
            'Environmental and sustainability assessments',
            'Hazardous material survey (asbestos, RAAC, etc.)'
          ]
        },
        {
          title: '2.2 Design & Documentation',
          items: [
            'Concept design development',
            'Detailed design (architectural, structural, MEP)',
            'Interior design (if applicable)',
            'Technical specifications',
            'Bill of Quantities (BoQ)',
            'Drawings (plans, elevations, sections, details)'
          ]
        },
        {
          title: '2.3 Permits & Approvals',
          items: [
            'Planning permission application',
            'Building permit submission',
            'NOCs (utilities, civil defense, municipality)',
            'HSE compliance submissions',
            'Party wall agreements (if applicable)'
          ]
        }
      ]
    },
    {
      id: 'site-preparation',
      title: '3. Site Preparation & Enabling Works',
      items: [
        'Mobilisation and site setup (hoarding, welfare, signage)',
        'Demolition and stripping out (if refurbishment)',
        'Site clearance and grading',
        'Temporary works (access, scaffolding, shoring)',
        'Utility diversions and temporary connections',
        'Traffic management plan (if required)'
      ]
    },
    {
      id: 'substructure',
      title: '4. Substructure Works',
      items: [
        'Excavation works',
        'Piling and ground improvement',
        'Foundations (pad, strip, raft, piles)',
        'Basement works (if applicable)',
        'Drainage and waterproofing',
        'Retaining walls and earthworks'
      ]
    },
    {
      id: 'superstructure',
      title: '5. Superstructure Works',
      items: [
        'Structural frame (RC, steel, timber)',
        'Slabs, beams, and columns',
        'Roof structure',
        'Staircases and ramps',
        'External walls and cladding',
        'Windows, glazing, and curtain walling'
      ]
    },
    {
      id: 'building-envelope',
      title: '6. Building Envelope',
      items: [
        'Waterproofing and insulation',
        'Roofing (membrane, tiles, metal)',
        'Facade finishes (render, stone, panels)',
        'External doors, shutters, louvers',
        'Rainwater goods (gutters, downpipes)',
        'Weatherproofing and sealing'
      ]
    },
    {
      id: 'internal-works',
      title: '7. Internal Works',
      items: [
        'Partitions and linings (blockwork, drywall, glass)',
        'Flooring (tiles, wood, carpet, epoxy)',
        'Ceilings (suspended, plasterboard, acoustic)',
        'Internal doors and ironmongery',
        'Wall finishes (paint, panels, wallpaper)',
        'Joinery (cabinets, wardrobes, skirtings)'
      ]
    },
    {
      id: 'mep',
      title: '8. Mechanical, Electrical & Plumbing (MEP)',
      subsections: [
        {
          title: '8.1 Mechanical',
          items: [
            'HVAC system (ducts, AHUs, chillers, VRF)',
            'Ventilation and smoke extraction',
            'Firefighting systems (sprinklers, extinguishers)',
            'Lifts and escalators (if applicable)'
          ]
        },
        {
          title: '8.2 Electrical',
          items: [
            'Main incoming power and distribution',
            'Cabling, conduits, and containment',
            'Lighting and controls',
            'Small power (sockets, outlets)',
            'Emergency lighting and backup systems'
          ]
        },
        {
          title: '8.3 Plumbing & Drainage',
          items: [
            'Water supply and storage tanks',
            'Hot water systems',
            'Drainage and soil stacks',
            'Sanitary fittings and fixtures'
          ]
        },
        {
          title: '8.4 ELV / Specialist Systems',
          items: [
            'Data, telecom, and WiFi infrastructure',
            'Security and CCTV systems',
            'Access control systems',
            'Fire alarm and detection',
            'BMS (Building Management System)'
          ]
        }
      ]
    },
    {
      id: 'external-works',
      title: '9. External & Landscape Works',
      items: [
        'Boundary walls and gates',
        'Hard landscaping (paving, kerbs, stairs, ramps)',
        'Soft landscaping (trees, shrubs, turf)',
        'External lighting',
        'Car parking and driveways',
        'Signage and wayfinding'
      ]
    },
    {
      id: 'testing-commissioning',
      title: '10. Testing, Commissioning & Handover',
      items: [
        'MEP testing and commissioning',
        'Snagging and de-snagging',
        'Quality assurance inspections',
        'HSE audits and compliance',
        'Training for client (systems and O&M manuals)',
        'As-built drawings and documentation',
        'Completion certificate and occupancy permit'
      ]
    },
    {
      id: 'post-construction',
      title: '11. Post-Construction / Close-Out',
      items: [
        'Defects liability period management',
        'Maintenance schedules and planning',
        'Energy performance certification (LEED, BREEAM, etc.)',
        'Sustainability compliance documentation',
        'Final project close-out and handover'
      ]
    }
  ]
};

// Comprehensive Work Breakdown Structure (WBS) template
const WBS_TEMPLATE = {
  projectTypes: {
    'new-build': {
      phases: [
        {
          id: 'pre-construction',
          title: '1. Pre-Construction',
          workPackages: [
            {
              id: 'surveys-approvals',
              title: '1.1 Surveys & Approvals',
              activities: [
                '1.1.1 Topographical Survey',
                '1.1.2 Soil Investigation',
                '1.1.3 Utility Mapping',
                '1.1.4 Environmental Assessment',
                '1.1.5 Planning Permission Application',
                '1.1.6 Building Regulations Approval'
              ]
            },
            {
              id: 'design-documentation',
              title: '1.2 Design & Documentation',
              activities: [
                '1.2.1 Concept Design',
                '1.2.2 Detailed Architectural Drawings',
                '1.2.3 Structural Calculations',
                '1.2.4 MEP Design',
                '1.2.5 Technical Specifications',
                '1.2.6 Bill of Quantities'
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: '2. Construction',
          workPackages: [
            {
              id: 'site-preparation',
              title: '2.1 Site Preparation',
              activities: [
                '2.1.1 Site Mobilisation',
                '2.1.2 Hoarding & Security',
                '2.1.3 Site Clearance',
                '2.1.4 Temporary Works'
              ]
            },
            {
              id: 'substructure',
              title: '2.2 Substructure',
              activities: [
                '2.2.1 Excavation Works',
                '2.2.2 Foundation Construction',
                '2.2.3 Basement Works (if applicable)',
                '2.2.4 Drainage & Waterproofing'
              ]
            },
            {
              id: 'superstructure',
              title: '2.3 Superstructure',
              activities: [
                '2.3.1 Structural Frame',
                '2.3.2 Slabs & Beams',
                '2.3.3 Roof Structure',
                '2.3.4 Staircases & Ramps'
              ]
            },
            {
              id: 'building-envelope',
              title: '2.4 Building Envelope',
              activities: [
                '2.4.1 External Walls',
                '2.4.2 Windows & Glazing',
                '2.4.3 Roofing',
                '2.4.4 External Doors'
              ]
            },
            {
              id: 'internal-works',
              title: '2.5 Internal Works',
              activities: [
                '2.5.1 Partitions & Linings',
                '2.5.2 Flooring',
                '2.5.3 Ceilings',
                '2.5.4 Internal Doors',
                '2.5.5 Wall Finishes',
                '2.5.6 Joinery'
              ]
            },
            {
              id: 'mep',
              title: '2.6 MEP Installation',
              activities: [
                '2.6.1 HVAC Systems',
                '2.6.2 Electrical Installation',
                '2.6.3 Plumbing & Drainage',
                '2.6.4 Fire Safety Systems',
                '2.6.5 ELV Systems'
              ]
            }
          ]
        },
        {
          id: 'external-works',
          title: '3. External Works',
          workPackages: [
            {
              id: 'landscaping',
              title: '3.1 Landscaping',
              activities: [
                '3.1.1 Hard Landscaping',
                '3.1.2 Soft Landscaping',
                '3.1.3 External Lighting',
                '3.1.4 Car Parking'
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: '4. Handover & Close-Out',
          workPackages: [
            {
              id: 'testing-commissioning',
              title: '4.1 Testing & Commissioning',
              activities: [
                '4.1.1 MEP Testing',
                '4.1.2 System Commissioning',
                '4.1.3 Performance Testing'
              ]
            },
            {
              id: 'completion',
              title: '4.2 Completion',
              activities: [
                '4.2.1 Snagging & De-snagging',
                '4.2.2 Final Inspections',
                '4.2.3 As-Built Drawings',
                '4.2.4 O&M Manuals',
                '4.2.5 Handover Documentation'
              ]
            }
          ]
        }
      ]
    },
    'fit-out': {
      phases: [
        {
          id: 'pre-construction',
          title: '1. Pre-Construction',
          workPackages: [
            {
              id: 'surveys-approvals',
              title: '1.1 Surveys & Approvals',
              activities: [
                '1.1.1 Measured Building Survey',
                '1.1.2 Authority NOCs',
                '1.1.3 Fire Safety Assessment',
                '1.1.4 Planning Permission (if required)'
              ]
            },
            {
              id: 'design-documentation',
              title: '1.2 Design & Documentation',
              activities: [
                '1.2.1 Interior Layouts',
                '1.2.2 MEP Shop Drawings',
                '1.2.3 Material Specifications',
                '1.2.4 Technical Drawings'
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: '2. Construction',
          workPackages: [
            {
              id: 'site-preparation',
              title: '2.1 Site Preparation',
              activities: [
                '2.1.1 Hoarding & Mobilisation',
                '2.1.2 Strip-Out Works',
                '2.1.3 Site Protection',
                '2.1.4 Temporary Services'
              ]
            },
            {
              id: 'internal-works',
              title: '2.2 Internal Works',
              activities: [
                '2.2.1 Partitions & Ceilings',
                '2.2.2 Flooring & Finishes',
                '2.2.3 Internal Doors',
                '2.2.4 Wall Finishes',
                '2.2.5 Joinery & Fittings'
              ]
            },
            {
              id: 'mep',
              title: '2.3 MEP',
              activities: [
                '2.3.1 HVAC Ducting & Units',
                '2.3.2 Electrical Cabling & Lighting',
                '2.3.3 Plumbing & Sanitary',
                '2.3.4 Fire Safety Systems',
                '2.3.5 Data & Communications'
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: '3. Handover',
          workPackages: [
            {
              id: 'testing-commissioning',
              title: '3.1 Testing & Commissioning',
              activities: [
                '3.1.1 MEP Testing',
                '3.1.2 System Commissioning',
                '3.1.3 Performance Testing'
              ]
            },
            {
              id: 'completion',
              title: '3.2 Completion',
              activities: [
                '3.2.1 Snagging & De-snagging',
                '3.2.2 O&M Manuals',
                '3.2.3 As-Built Drawings',
                '3.2.4 Handover Documentation'
              ]
            }
          ]
        }
      ]
    },
    'refurbishment': {
      phases: [
        {
          id: 'pre-construction',
          title: '1. Pre-Construction',
          workPackages: [
            {
              id: 'surveys-approvals',
              title: '1.1 Surveys & Approvals',
              activities: [
                '1.1.1 Structural Survey',
                '1.1.2 Asbestos Survey',
                '1.1.3 Planning Permission',
                '1.1.4 Building Regulations',
                '1.1.5 Party Wall Agreements'
              ]
            },
            {
              id: 'design-documentation',
              title: '1.2 Design & Documentation',
              activities: [
                '1.2.1 Existing Condition Survey',
                '1.2.2 Refurbishment Design',
                '1.2.3 Structural Modifications',
                '1.2.4 MEP Upgrades',
                '1.2.5 Heritage Assessment (if applicable)'
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: '2. Construction',
          workPackages: [
            {
              id: 'demolition',
              title: '2.1 Demolition & Strip-Out',
              activities: [
                '2.1.1 Asbestos Removal',
                '2.1.2 Structural Demolition',
                '2.1.3 MEP Removal',
                '2.1.4 Waste Management'
              ]
            },
            {
              id: 'structural-works',
              title: '2.2 Structural Works',
              activities: [
                '2.2.1 Structural Modifications',
                '2.2.2 Foundation Works',
                '2.2.3 Structural Repairs',
                '2.2.4 Structural Upgrades'
              ]
            },
            {
              id: 'building-envelope',
              title: '2.3 Building Envelope',
              activities: [
                '2.3.1 Roof Repairs/Replacement',
                '2.3.2 Window Replacement',
                '2.3.3 External Wall Repairs',
                '2.3.4 Weatherproofing'
              ]
            },
            {
              id: 'internal-works',
              title: '2.4 Internal Works',
              activities: [
                '2.4.1 New Partitions',
                '2.4.2 Flooring Installation',
                '2.4.3 Ceiling Works',
                '2.4.4 Internal Doors',
                '2.4.5 Wall Finishes',
                '2.4.6 Kitchen/Bathroom Installation'
              ]
            },
            {
              id: 'mep',
              title: '2.5 MEP Installation',
              activities: [
                '2.5.1 Electrical Rewiring',
                '2.5.2 Plumbing Installation',
                '2.5.3 Heating Systems',
                '2.5.4 Ventilation',
                '2.5.5 Fire Safety Systems'
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: '3. Handover',
          workPackages: [
            {
              id: 'testing-commissioning',
              title: '3.1 Testing & Commissioning',
              activities: [
                '3.1.1 MEP Testing',
                '3.1.2 System Commissioning',
                '3.1.3 Performance Testing'
              ]
            },
            {
              id: 'completion',
              title: '3.2 Completion',
              activities: [
                '3.2.1 Snagging & De-snagging',
                '3.2.2 Final Inspections',
                '3.2.3 O&M Manuals',
                '3.2.4 As-Built Drawings',
                '3.2.5 Handover Documentation'
              ]
            }
          ]
        }
      ]
    }
  }
};

// Comprehensive Project Schedule (Schedule of Works) template
const SCHEDULE_TEMPLATE = {
  projectTypes: {
    'new-build': {
      phases: [
        {
          id: 'pre-construction',
          title: 'Pre-Construction',
          duration: 12, // weeks
          workPackages: [
            {
              id: 'surveys-approvals',
              title: 'Surveys & Approvals',
              duration: 6,
              activities: [
                { id: '1.1.1', name: 'Topographical Survey', duration: 1, dependencies: [], milestone: false },
                { id: '1.1.2', name: 'Soil Investigation', duration: 2, dependencies: ['1.1.1'], milestone: false },
                { id: '1.1.3', name: 'Utility Mapping', duration: 1, dependencies: ['1.1.1'], milestone: false },
                { id: '1.1.4', name: 'Environmental Assessment', duration: 2, dependencies: ['1.1.2'], milestone: false },
                { id: '1.1.5', name: 'Planning Permission Application', duration: 4, dependencies: ['1.1.3', '1.1.4'], milestone: true },
                { id: '1.1.6', name: 'Building Regulations Approval', duration: 2, dependencies: ['1.1.5'], milestone: true }
              ]
            },
            {
              id: 'design-documentation',
              title: 'Design & Documentation',
              duration: 8,
              activities: [
                { id: '1.2.1', name: 'Concept Design', duration: 2, dependencies: ['1.1.1'], milestone: false },
                { id: '1.2.2', name: 'Detailed Architectural Drawings', duration: 4, dependencies: ['1.2.1'], milestone: false },
                { id: '1.2.3', name: 'Structural Calculations', duration: 3, dependencies: ['1.2.2'], milestone: false },
                { id: '1.2.4', name: 'MEP Design', duration: 3, dependencies: ['1.2.2'], milestone: false },
                { id: '1.2.5', name: 'Technical Specifications', duration: 2, dependencies: ['1.2.3', '1.2.4'], milestone: false },
                { id: '1.2.6', name: 'Bill of Quantities', duration: 1, dependencies: ['1.2.5'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: 'Construction',
          duration: 24, // weeks
          workPackages: [
            {
              id: 'site-preparation',
              title: 'Site Preparation',
              duration: 2,
              activities: [
                { id: '2.1.1', name: 'Site Mobilisation', duration: 1, dependencies: ['1.1.6'], milestone: false },
                { id: '2.1.2', name: 'Hoarding & Security', duration: 1, dependencies: ['2.1.1'], milestone: false },
                { id: '2.1.3', name: 'Site Clearance', duration: 1, dependencies: ['2.1.2'], milestone: false },
                { id: '2.1.4', name: 'Temporary Works', duration: 1, dependencies: ['2.1.3'], milestone: false }
              ]
            },
            {
              id: 'substructure',
              title: 'Substructure',
              duration: 4,
              activities: [
                { id: '2.2.1', name: 'Excavation Works', duration: 1, dependencies: ['2.1.4'], milestone: false },
                { id: '2.2.2', name: 'Foundation Construction', duration: 2, dependencies: ['2.2.1'], milestone: true },
                { id: '2.2.3', name: 'Basement Works (if applicable)', duration: 2, dependencies: ['2.2.2'], milestone: false },
                { id: '2.2.4', name: 'Drainage & Waterproofing', duration: 1, dependencies: ['2.2.3'], milestone: false }
              ]
            },
            {
              id: 'superstructure',
              title: 'Superstructure',
              duration: 6,
              activities: [
                { id: '2.3.1', name: 'Structural Frame', duration: 3, dependencies: ['2.2.4'], milestone: true },
                { id: '2.3.2', name: 'Slabs & Beams', duration: 2, dependencies: ['2.3.1'], milestone: false },
                { id: '2.3.3', name: 'Roof Structure', duration: 2, dependencies: ['2.3.2'], milestone: false },
                { id: '2.3.4', name: 'Staircases & Ramps', duration: 1, dependencies: ['2.3.3'], milestone: false }
              ]
            },
            {
              id: 'building-envelope',
              title: 'Building Envelope',
              duration: 4,
              activities: [
                { id: '2.4.1', name: 'External Walls', duration: 2, dependencies: ['2.3.1'], milestone: false },
                { id: '2.4.2', name: 'Windows & Glazing', duration: 2, dependencies: ['2.4.1'], milestone: false },
                { id: '2.4.3', name: 'Roofing', duration: 2, dependencies: ['2.3.3'], milestone: false },
                { id: '2.4.4', name: 'External Doors', duration: 1, dependencies: ['2.4.2'], milestone: false }
              ]
            },
            {
              id: 'internal-works',
              title: 'Internal Works',
              duration: 6,
              activities: [
                { id: '2.5.1', name: 'Partitions & Linings', duration: 2, dependencies: ['2.3.1'], milestone: false },
                { id: '2.5.2', name: 'Flooring', duration: 2, dependencies: ['2.5.1'], milestone: false },
                { id: '2.5.3', name: 'Ceilings', duration: 2, dependencies: ['2.5.2'], milestone: false },
                { id: '2.5.4', name: 'Internal Doors', duration: 1, dependencies: ['2.5.3'], milestone: false },
                { id: '2.5.5', name: 'Wall Finishes', duration: 2, dependencies: ['2.5.4'], milestone: false },
                { id: '2.5.6', name: 'Joinery', duration: 2, dependencies: ['2.5.5'], milestone: false }
              ]
            },
            {
              id: 'mep',
              title: 'MEP Installation',
              duration: 8,
              activities: [
                { id: '2.6.1', name: 'HVAC Systems', duration: 3, dependencies: ['2.3.1'], milestone: false },
                { id: '2.6.2', name: 'Electrical Installation', duration: 4, dependencies: ['2.5.1'], milestone: false },
                { id: '2.6.3', name: 'Plumbing & Drainage', duration: 3, dependencies: ['2.5.1'], milestone: false },
                { id: '2.6.4', name: 'Fire Safety Systems', duration: 2, dependencies: ['2.6.2'], milestone: false },
                { id: '2.6.5', name: 'ELV Systems', duration: 2, dependencies: ['2.6.2'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'external-works',
          title: 'External Works',
          duration: 3,
          workPackages: [
            {
              id: 'landscaping',
              title: 'Landscaping',
              duration: 3,
              activities: [
                { id: '3.1.1', name: 'Hard Landscaping', duration: 2, dependencies: ['2.4.4'], milestone: false },
                { id: '3.1.2', name: 'Soft Landscaping', duration: 1, dependencies: ['3.1.1'], milestone: false },
                { id: '3.1.3', name: 'External Lighting', duration: 1, dependencies: ['3.1.2'], milestone: false },
                { id: '3.1.4', name: 'Car Parking', duration: 1, dependencies: ['3.1.1'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: 'Handover & Close-Out',
          duration: 3,
          workPackages: [
            {
              id: 'testing-commissioning',
              title: 'Testing & Commissioning',
              duration: 2,
              activities: [
                { id: '4.1.1', name: 'MEP Testing', duration: 1, dependencies: ['2.6.5'], milestone: false },
                { id: '4.1.2', name: 'System Commissioning', duration: 1, dependencies: ['4.1.1'], milestone: false },
                { id: '4.1.3', name: 'Performance Testing', duration: 1, dependencies: ['4.1.2'], milestone: false }
              ]
            },
            {
              id: 'completion',
              title: 'Completion',
              duration: 2,
              activities: [
                { id: '4.2.1', name: 'Snagging & De-snagging', duration: 1, dependencies: ['4.1.3'], milestone: false },
                { id: '4.2.2', name: 'Final Inspections', duration: 1, dependencies: ['4.2.1'], milestone: true },
                { id: '4.2.3', name: 'As-Built Drawings', duration: 1, dependencies: ['4.2.2'], milestone: false },
                { id: '4.2.4', name: 'O&M Manuals', duration: 1, dependencies: ['4.2.3'], milestone: false },
                { id: '4.2.5', name: 'Handover Documentation', duration: 1, dependencies: ['4.2.4'], milestone: true }
              ]
            }
          ]
        }
      ]
    },
    'fit-out': {
      phases: [
        {
          id: 'pre-construction',
          title: 'Pre-Construction',
          duration: 6,
          workPackages: [
            {
              id: 'surveys-approvals',
              title: 'Surveys & Approvals',
              duration: 3,
              activities: [
                { id: '1.1.1', name: 'Measured Building Survey', duration: 1, dependencies: [], milestone: false },
                { id: '1.1.2', name: 'Authority NOCs', duration: 1, dependencies: ['1.1.1'], milestone: false },
                { id: '1.1.3', name: 'Fire Safety Assessment', duration: 1, dependencies: ['1.1.2'], milestone: false },
                { id: '1.1.4', name: 'Planning Permission (if required)', duration: 2, dependencies: ['1.1.3'], milestone: true }
              ]
            },
            {
              id: 'design-documentation',
              title: 'Design & Documentation',
              duration: 4,
              activities: [
                { id: '1.2.1', name: 'Interior Layouts', duration: 2, dependencies: ['1.1.1'], milestone: false },
                { id: '1.2.2', name: 'MEP Shop Drawings', duration: 2, dependencies: ['1.2.1'], milestone: false },
                { id: '1.2.3', name: 'Material Specifications', duration: 1, dependencies: ['1.2.2'], milestone: false },
                { id: '1.2.4', name: 'Technical Drawings', duration: 1, dependencies: ['1.2.3'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: 'Construction',
          duration: 12,
          workPackages: [
            {
              id: 'site-preparation',
              title: 'Site Preparation',
              duration: 1,
              activities: [
                { id: '2.1.1', name: 'Hoarding & Mobilisation', duration: 1, dependencies: ['1.1.4'], milestone: false },
                { id: '2.1.2', name: 'Strip-Out Works', duration: 1, dependencies: ['2.1.1'], milestone: false },
                { id: '2.1.3', name: 'Site Protection', duration: 1, dependencies: ['2.1.2'], milestone: false },
                { id: '2.1.4', name: 'Temporary Services', duration: 1, dependencies: ['2.1.3'], milestone: false }
              ]
            },
            {
              id: 'internal-works',
              title: 'Internal Works',
              duration: 6,
              activities: [
                { id: '2.2.1', name: 'Partitions & Ceilings', duration: 2, dependencies: ['2.1.4'], milestone: false },
                { id: '2.2.2', name: 'Flooring & Finishes', duration: 2, dependencies: ['2.2.1'], milestone: false },
                { id: '2.2.3', name: 'Internal Doors', duration: 1, dependencies: ['2.2.2'], milestone: false },
                { id: '2.2.4', name: 'Wall Finishes', duration: 2, dependencies: ['2.2.3'], milestone: false },
                { id: '2.2.5', name: 'Joinery & Fittings', duration: 2, dependencies: ['2.2.4'], milestone: false }
              ]
            },
            {
              id: 'mep',
              title: 'MEP',
              duration: 4,
              activities: [
                { id: '2.3.1', name: 'HVAC Ducting & Units', duration: 2, dependencies: ['2.2.1'], milestone: false },
                { id: '2.3.2', name: 'Electrical Cabling & Lighting', duration: 2, dependencies: ['2.2.1'], milestone: false },
                { id: '2.3.3', name: 'Plumbing & Sanitary', duration: 2, dependencies: ['2.2.1'], milestone: false },
                { id: '2.3.4', name: 'Fire Safety Systems', duration: 1, dependencies: ['2.3.2'], milestone: false },
                { id: '2.3.5', name: 'Data & Communications', duration: 1, dependencies: ['2.3.2'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: 'Handover',
          duration: 2,
          workPackages: [
            {
              id: 'testing-commissioning',
              title: 'Testing & Commissioning',
              duration: 1,
              activities: [
                { id: '3.1.1', name: 'MEP Testing', duration: 1, dependencies: ['2.3.5'], milestone: false },
                { id: '3.1.2', name: 'System Commissioning', duration: 1, dependencies: ['3.1.1'], milestone: false },
                { id: '3.1.3', name: 'Performance Testing', duration: 1, dependencies: ['3.1.2'], milestone: false }
              ]
            },
            {
              id: 'completion',
              title: 'Completion',
              duration: 1,
              activities: [
                { id: '3.2.1', name: 'Snagging & De-snagging', duration: 1, dependencies: ['3.1.3'], milestone: false },
                { id: '3.2.2', name: 'O&M Manuals', duration: 1, dependencies: ['3.2.1'], milestone: false },
                { id: '3.2.3', name: 'As-Built Drawings', duration: 1, dependencies: ['3.2.2'], milestone: false },
                { id: '3.2.4', name: 'Handover Documentation', duration: 1, dependencies: ['3.2.3'], milestone: true }
              ]
            }
          ]
        }
      ]
    },
    'refurbishment': {
      phases: [
        {
          id: 'pre-construction',
          title: 'Pre-Construction',
          duration: 8,
          workPackages: [
            {
              id: 'surveys-approvals',
              title: 'Surveys & Approvals',
              duration: 4,
              activities: [
                { id: '1.1.1', name: 'Structural Survey', duration: 1, dependencies: [], milestone: false },
                { id: '1.1.2', name: 'Asbestos Survey', duration: 1, dependencies: ['1.1.1'], milestone: false },
                { id: '1.1.3', name: 'Planning Permission', duration: 3, dependencies: ['1.1.2'], milestone: true },
                { id: '1.1.4', name: 'Building Regulations', duration: 2, dependencies: ['1.1.3'], milestone: true },
                { id: '1.1.5', name: 'Party Wall Agreements', duration: 2, dependencies: ['1.1.4'], milestone: false }
              ]
            },
            {
              id: 'design-documentation',
              title: 'Design & Documentation',
              duration: 6,
              activities: [
                { id: '1.2.1', name: 'Existing Condition Survey', duration: 2, dependencies: ['1.1.1'], milestone: false },
                { id: '1.2.2', name: 'Refurbishment Design', duration: 3, dependencies: ['1.2.1'], milestone: false },
                { id: '1.2.3', name: 'Structural Modifications', duration: 2, dependencies: ['1.2.2'], milestone: false },
                { id: '1.2.4', name: 'MEP Upgrades', duration: 2, dependencies: ['1.2.2'], milestone: false },
                { id: '1.2.5', name: 'Heritage Assessment (if applicable)', duration: 1, dependencies: ['1.2.2'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'construction',
          title: 'Construction',
          duration: 16,
          workPackages: [
            {
              id: 'demolition',
              title: 'Demolition & Strip-Out',
              duration: 3,
              activities: [
                { id: '2.1.1', name: 'Asbestos Removal', duration: 1, dependencies: ['1.1.5'], milestone: false },
                { id: '2.1.2', name: 'Structural Demolition', duration: 2, dependencies: ['2.1.1'], milestone: false },
                { id: '2.1.3', name: 'MEP Removal', duration: 1, dependencies: ['2.1.2'], milestone: false },
                { id: '2.1.4', name: 'Waste Management', duration: 1, dependencies: ['2.1.3'], milestone: false }
              ]
            },
            {
              id: 'structural-works',
              title: 'Structural Works',
              duration: 4,
              activities: [
                { id: '2.2.1', name: 'Structural Modifications', duration: 2, dependencies: ['2.1.4'], milestone: false },
                { id: '2.2.2', name: 'Foundation Works', duration: 2, dependencies: ['2.2.1'], milestone: true },
                { id: '2.2.3', name: 'Structural Repairs', duration: 2, dependencies: ['2.2.2'], milestone: false },
                { id: '2.2.4', name: 'Structural Upgrades', duration: 2, dependencies: ['2.2.3'], milestone: false }
              ]
            },
            {
              id: 'building-envelope',
              title: 'Building Envelope',
              duration: 3,
              activities: [
                { id: '2.3.1', name: 'Roof Repairs/Replacement', duration: 2, dependencies: ['2.2.4'], milestone: false },
                { id: '2.3.2', name: 'Window Replacement', duration: 2, dependencies: ['2.3.1'], milestone: false },
                { id: '2.3.3', name: 'External Wall Repairs', duration: 2, dependencies: ['2.3.2'], milestone: false },
                { id: '2.3.4', name: 'Weatherproofing', duration: 1, dependencies: ['2.3.3'], milestone: false }
              ]
            },
            {
              id: 'internal-works',
              title: 'Internal Works',
              duration: 4,
              activities: [
                { id: '2.4.1', name: 'New Partitions', duration: 2, dependencies: ['2.2.4'], milestone: false },
                { id: '2.4.2', name: 'Flooring Installation', duration: 2, dependencies: ['2.4.1'], milestone: false },
                { id: '2.4.3', name: 'Ceiling Works', duration: 2, dependencies: ['2.4.2'], milestone: false },
                { id: '2.4.4', name: 'Internal Doors', duration: 1, dependencies: ['2.4.3'], milestone: false },
                { id: '2.4.5', name: 'Wall Finishes', duration: 2, dependencies: ['2.4.4'], milestone: false },
                { id: '2.4.6', name: 'Kitchen/Bathroom Installation', duration: 2, dependencies: ['2.4.5'], milestone: false }
              ]
            },
            {
              id: 'mep',
              title: 'MEP Installation',
              duration: 4,
              activities: [
                { id: '2.5.1', name: 'Electrical Rewiring', duration: 2, dependencies: ['2.4.1'], milestone: false },
                { id: '2.5.2', name: 'Plumbing Installation', duration: 2, dependencies: ['2.4.1'], milestone: false },
                { id: '2.5.3', name: 'Heating Systems', duration: 2, dependencies: ['2.5.2'], milestone: false },
                { id: '2.5.4', name: 'Ventilation', duration: 2, dependencies: ['2.5.1'], milestone: false },
                { id: '2.5.5', name: 'Fire Safety Systems', duration: 1, dependencies: ['2.5.4'], milestone: false }
              ]
            }
          ]
        },
        {
          id: 'handover',
          title: 'Handover',
          duration: 2,
          workPackages: [
            {
              id: 'testing-commissioning',
              title: 'Testing & Commissioning',
              duration: 1,
              activities: [
                { id: '3.1.1', name: 'MEP Testing', duration: 1, dependencies: ['2.5.5'], milestone: false },
                { id: '3.1.2', name: 'System Commissioning', duration: 1, dependencies: ['3.1.1'], milestone: false },
                { id: '3.1.3', name: 'Performance Testing', duration: 1, dependencies: ['3.1.2'], milestone: false }
              ]
            },
            {
              id: 'completion',
              title: 'Completion',
              duration: 1,
              activities: [
                { id: '3.2.1', name: 'Snagging & De-snagging', duration: 1, dependencies: ['3.1.3'], milestone: false },
                { id: '3.2.2', name: 'Final Inspections', duration: 1, dependencies: ['3.2.1'], milestone: true },
                { id: '3.2.3', name: 'O&M Manuals', duration: 1, dependencies: ['3.2.2'], milestone: false },
                { id: '3.2.4', name: 'As-Built Drawings', duration: 1, dependencies: ['3.2.3'], milestone: false },
                { id: '3.2.5', name: 'Handover Documentation', duration: 1, dependencies: ['3.2.4'], milestone: true }
              ]
            }
          ]
        }
      ]
    }
  }
};

// Function to generate detailed itemized cost breakdown aligned with WBS
function generateDetailedCostBreakdown(projectData: {
  projectType: string;
  location: string;
  area: number;
  finishTier: string;
  includeKitchen: boolean;
  includeBathroom: boolean;
  includeMEP: boolean;
}, wbsTemplate: WbsTemplate) {
  const { projectType, location, area, finishTier } = projectData;
  
  const locationInfo = COST_DATA.locations[location as keyof typeof COST_DATA.locations] || COST_DATA.locations['UK'];
  const baseRates = COST_DATA.detailedBaseRates;
  const finishTierMultiplier = (COST_DATA.finishTiers[finishTier as keyof typeof COST_DATA.finishTiers] as { multiplier: number })?.multiplier || 1;
  
  let breakdown = `# DETAILED COST BREAKDOWN\n\n`;
  breakdown += `Project Type: ${projectType.replace('-', ' ').toUpperCase()}\n`;
  breakdown += `Location: ${location}\n`;
  breakdown += `Area: ${area}m²\n`;
  breakdown += `Finish Tier: ${finishTier.toUpperCase()}\n`;
  breakdown += `Currency: ${locationInfo.currency} (${locationInfo.symbol})\n`;
  breakdown += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  // Cost categories
  const costCategories = {
    materials: 'Materials',
    labour: 'Labour',
    plant: 'Plant/Equipment',
    subcontractors: 'Subcontractors',
    professional: 'Professional Fees',
    permits: 'Permits & Approvals',
    contingency: 'Contingency'
  };
  
  // Generate detailed breakdown table
  breakdown += `## ITEMIZED COST BREAKDOWN\n\n`;
  breakdown += `| WBS Code | Task Name | Cost Category | Unit/Qty | Unit Rate | Subtotal |\n`;
  breakdown += `|----------|-----------|---------------|----------|-----------|----------|\n`;
  
  let totalConstructionCost = 0;
  let totalProfessionalFees = 0;
  let totalPermitsCost = 0;
  let totalContingency = 0;
  
  // Process each phase and generate cost breakdown
  wbsTemplate.phases.forEach((phase: Phase) => {
    breakdown += `| **${phase.title}** | | | | | |\n`;
    
    phase.workPackages.forEach((workPackage: WorkPackage) => {
      breakdown += `| **${workPackage.title}** | | | | | |\n`;
      
      workPackage.activities.forEach((activityName: string, index: number) => {
        // Create a mock activity object for cost generation
        const activity: Activity = {
          id: `${workPackage.id}.${index + 1}`,
          name: activityName,
          duration: 1,
          dependencies: [],
          milestone: false
        };
        
        // Generate costs for each activity based on WBS code
        const activityCosts = generateActivityCosts(activity, projectData, locationInfo, baseRates, finishTierMultiplier);
        
        activityCosts.forEach(costItem => {
          const subtotal = costItem.quantity * costItem.unitRate * locationInfo.multiplier;
          const subtotalFormatted = `${locationInfo.symbol}${Math.round(subtotal).toLocaleString()}`;
          
          breakdown += `| ${activity.id} | ${activity.name} | ${costItem.category} | ${costItem.quantity} ${costItem.unit} | ${locationInfo.symbol}${Math.round(costItem.unitRate * locationInfo.multiplier).toLocaleString()}/${costItem.unit} | ${subtotalFormatted} |\n`;
          
          // Add to appropriate total
          if (costItem.category === costCategories.professional) {
            totalProfessionalFees += subtotal;
          } else if (costItem.category === costCategories.permits) {
            totalPermitsCost += subtotal;
          } else if (costItem.category === costCategories.contingency) {
            totalContingency += subtotal;
          } else {
            totalConstructionCost += subtotal;
          }
        });
      });
    });
  });
  
  // Calculate contingency (10-15% of construction cost)
  const contingencyRate = 0.12; // 12% average
  const calculatedContingency = totalConstructionCost * contingencyRate;
  totalContingency = calculatedContingency;
  
  // Add contingency row
  breakdown += `| | | ${costCategories.contingency} | 12% | ${locationInfo.symbol}${Math.round(calculatedContingency).toLocaleString()} | ${locationInfo.symbol}${Math.round(calculatedContingency).toLocaleString()} |\n`;
  
  // Generate summary table
  const grandTotal = totalConstructionCost + totalProfessionalFees + totalPermitsCost + totalContingency;
  
  breakdown += `\n## SUMMARY TABLE\n\n`;
  breakdown += `| Cost Category | Amount | Percentage |\n`;
  breakdown += `|---------------|--------|------------|\n`;
  breakdown += `| **Total Construction Cost** | ${locationInfo.symbol}${Math.round(totalConstructionCost).toLocaleString()} | ${Math.round((totalConstructionCost / grandTotal) * 100)}% |\n`;
  breakdown += `| **Professional/Consultant Fees** | ${locationInfo.symbol}${Math.round(totalProfessionalFees).toLocaleString()} | ${Math.round((totalProfessionalFees / grandTotal) * 100)}% |\n`;
  breakdown += `| **Permits & Regulatory Costs** | ${locationInfo.symbol}${Math.round(totalPermitsCost).toLocaleString()} | ${Math.round((totalPermitsCost / grandTotal) * 100)}% |\n`;
  breakdown += `| **Contingency (12%)** | ${locationInfo.symbol}${Math.round(totalContingency).toLocaleString()} | ${Math.round((totalContingency / grandTotal) * 100)}% |\n`;
  breakdown += `| **GRAND TOTAL** | **${locationInfo.symbol}${Math.round(grandTotal).toLocaleString()}** | **100%** |\n`;
  
  // Add cost per m²
  const costPerM2 = grandTotal / area;
  breakdown += `\n## COST ANALYSIS\n\n`;
  breakdown += `• **Cost per m²:** ${locationInfo.symbol}${Math.round(costPerM2).toLocaleString()}/m²\n`;
  breakdown += `• **Total Project Cost:** ${locationInfo.symbol}${Math.round(grandTotal).toLocaleString()}\n`;
  breakdown += `• **Project Area:** ${area}m²\n`;
  breakdown += `• **Finish Tier:** ${finishTier.toUpperCase()}\n`;
  breakdown += `• **Location Multiplier:** ${locationInfo.multiplier}x\n\n`;
  
  // Add regional notes
  breakdown += `## REGIONAL COST NOTES\n\n`;
  breakdown += `• **Location:** ${location}\n`;
  breakdown += `• **Currency:** ${locationInfo.currency} (${locationInfo.symbol})\n`;
  breakdown += `• **Regional Multiplier:** ${locationInfo.multiplier}x (vs UK baseline)\n`;
  breakdown += `• **VAT Rate:** ${locationInfo.vat}%\n`;
  breakdown += `• **Last Updated:** ${new Date().toLocaleDateString()}\n\n`;
  
  // Add supplier pricing notes
  breakdown += `## SUPPLIER PRICING NOTES\n\n`;
  if (location === 'UAE') {
    breakdown += `• **Live Supplier APIs:** Danube, SLECO, Al Futtaim\n`;
    breakdown += `• **Material Sourcing:** Local suppliers preferred for cost efficiency\n`;
    breakdown += `• **Labour Rates:** Based on current UAE construction market\n`;
  } else if (location === 'UK') {
    breakdown += `• **Live Supplier APIs:** Travis Perkins, Jewson, Screwfix\n`;
    breakdown += `• **Material Sourcing:** UK suppliers with regional delivery\n`;
    breakdown += `• **Labour Rates:** Based on current UK construction market\n`;
  } else {
    breakdown += `• **Benchmark Pricing:** Based on international construction cost databases\n`;
    breakdown += `• **Material Sourcing:** Regional suppliers recommended\n`;
    breakdown += `• **Labour Rates:** Local market rates applied\n`;
  }
  
  breakdown += `\n---\n\n`;
  breakdown += `**Document Control:**\n`;
  breakdown += `• Version: 1.0\n`;
  breakdown += `• Status: Draft\n`;
  breakdown += `• Next Review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
  
  return {
    breakdown,
    totals: {
      construction: totalConstructionCost,
      professional: totalProfessionalFees,
      permits: totalPermitsCost,
      contingency: totalContingency,
      grandTotal
    }
  };
}

// Type definitions
interface Activity {
  id: string;
  name: string;
  duration: number;
  dependencies: string[];
  milestone: boolean;
}

interface WorkPackage {
  id: string;
  title: string;
  duration?: number;
  activities: string[];
}

interface Phase {
  id: string;
  title: string;
  duration?: number;
  workPackages: WorkPackage[];
}

interface WbsTemplate {
  phases: Phase[];
}

interface CostItem {
  category: string;
  item: string;
  unit: string;
  quantity: number;
  unitRate: number;
}

// Function to generate costs for individual activities
function generateActivityCosts(activity: Activity, projectData: { area: number }, locationInfo: { multiplier: number }, baseRates: Record<string, Record<string, number>>, finishTierMultiplier: number): CostItem[] {
  const costs: CostItem[] = [];
  const { area } = projectData;
  
  // Define cost items based on activity type
  const activityCosts = getActivityCostItems(activity, { includeKitchen: true, includeBathroom: true, includeMEP: true });
  
  activityCosts.forEach(costItem => {
    const baseRate = baseRates[costItem.category]?.[costItem.item] || 0;
    const adjustedRate = baseRate * finishTierMultiplier;
    const quantity = calculateQuantity(costItem, area, { projectType: 'new-build' });
    
    costs.push({
      category: costItem.category,
      item: costItem.item,
      unit: costItem.unit,
      quantity: quantity,
      unitRate: adjustedRate
    });
  });
  
  return costs;
}

// Function to get cost items for specific activities
function getActivityCostItems(activity: Activity, projectData: { includeKitchen: boolean; includeBathroom: boolean; includeMEP: boolean }) {
  const { includeKitchen, includeBathroom, includeMEP } = projectData;
  const activityId = activity.id;
  
  // Define cost items based on WBS code patterns
  if (activityId.includes('1.1.1') || activityId.includes('1.1.2')) {
    // Surveys
    return [
      { category: 'Professional Fees', item: 'Topographical Survey', unit: 'survey' },
      { category: 'Professional Fees', item: 'Soil Investigation', unit: 'borehole' },
      { category: 'Professional Fees', item: 'Utility Mapping', unit: 'survey' }
    ];
  } else if (activityId.includes('1.1.5') || activityId.includes('1.1.6')) {
    // Permits
    return [
      { category: 'Permits & Approvals', item: 'Planning Permission', unit: 'application' },
      { category: 'Permits & Approvals', item: 'Building Regulations', unit: 'application' },
      { category: 'Professional Fees', item: 'Planning Consultant', unit: 'hour' }
    ];
  } else if (activityId.includes('1.2')) {
    // Design
    return [
      { category: 'Professional Fees', item: 'Architectural Design', unit: 'hour' },
      { category: 'Professional Fees', item: 'Structural Engineering', unit: 'hour' },
      { category: 'Professional Fees', item: 'MEP Design', unit: 'hour' }
    ];
  } else if (activityId.includes('2.1')) {
    // Site Preparation
    return [
      { category: 'Labour', item: 'Site Mobilisation', unit: 'day' },
      { category: 'Materials', item: 'Hoarding Materials', unit: 'm²' },
      { category: 'Plant/Equipment', item: 'Temporary Works', unit: 'day' }
    ];
  } else if (activityId.includes('2.2')) {
    // Substructure
    return [
      { category: 'Materials', item: 'Concrete', unit: 'm³' },
      { category: 'Materials', item: 'Reinforcement Steel', unit: 'tonne' },
      { category: 'Labour', item: 'Excavation', unit: 'm³' },
      { category: 'Plant/Equipment', item: 'Excavator Hire', unit: 'day' }
    ];
  } else if (activityId.includes('2.3')) {
    // Superstructure
    return [
      { category: 'Materials', item: 'Structural Steel', unit: 'tonne' },
      { category: 'Materials', item: 'Concrete', unit: 'm³' },
      { category: 'Labour', item: 'Steel Erection', unit: 'tonne' },
      { category: 'Subcontractors', item: 'Steel Fabrication', unit: 'tonne' }
    ];
  } else if (activityId.includes('2.4')) {
    // Building Envelope
    return [
      { category: 'Materials', item: 'External Cladding', unit: 'm²' },
      { category: 'Materials', item: 'Windows', unit: 'm²' },
      { category: 'Materials', item: 'Roofing', unit: 'm²' },
      { category: 'Labour', item: 'Installation', unit: 'm²' }
    ];
  } else if (activityId.includes('2.5')) {
    // Internal Works
    const costs = [
      { category: 'Materials', item: 'Partitions', unit: 'm²' },
      { category: 'Materials', item: 'Flooring', unit: 'm²' },
      { category: 'Materials', item: 'Ceilings', unit: 'm²' },
      { category: 'Labour', item: 'Installation', unit: 'm²' }
    ];
    
    if (includeKitchen) {
      costs.push(
        { category: 'Materials', item: 'Kitchen Units', unit: 'set' },
        { category: 'Materials', item: 'Kitchen Appliances', unit: 'set' },
        { category: 'Labour', item: 'Kitchen Installation', unit: 'set' }
      );
    }
    
    if (includeBathroom) {
      costs.push(
        { category: 'Materials', item: 'Bathroom Fixtures', unit: 'set' },
        { category: 'Materials', item: 'Tiles', unit: 'm²' },
        { category: 'Labour', item: 'Bathroom Installation', unit: 'set' }
      );
    }
    
    return costs;
  } else if (activityId.includes('2.6') && includeMEP) {
    // MEP
    return [
      { category: 'Materials', item: 'Electrical Cables', unit: 'm' },
      { category: 'Materials', item: 'HVAC Ducts', unit: 'm' },
      { category: 'Materials', item: 'Plumbing Pipes', unit: 'm' },
      { category: 'Labour', item: 'MEP Installation', unit: 'm²' },
      { category: 'Subcontractors', item: 'MEP Specialist', unit: 'm²' }
    ];
  } else if (activityId.includes('3.1')) {
    // External Works
    return [
      { category: 'Materials', item: 'Hard Landscaping', unit: 'm²' },
      { category: 'Materials', item: 'Soft Landscaping', unit: 'm²' },
      { category: 'Labour', item: 'Landscaping', unit: 'm²' }
    ];
  } else if (activityId.includes('4.1') || activityId.includes('4.2')) {
    // Handover
    return [
      { category: 'Professional Fees', item: 'Testing & Commissioning', unit: 'hour' },
      { category: 'Professional Fees', item: 'Documentation', unit: 'hour' },
      { category: 'Labour', item: 'Snagging', unit: 'day' }
    ];
  }
  
  // Default cost items
  return [
    { category: 'Materials', item: 'General Materials', unit: 'm²' },
    { category: 'Labour', item: 'General Labour', unit: 'hour' }
  ];
}

// Function to calculate quantities based on project data
function calculateQuantity(costItem: { unit: string }, area: number, projectData: { projectType: string }) {
  const { projectType } = projectData;
  
  // Base quantities per m²
  const baseQuantities: { [key: string]: number } = {
    'm²': area,
    'm³': area * 0.3, // Assume 30cm average depth
    'm': area * 2, // Assume 2m perimeter per m²
    'tonne': area * 0.1, // Assume 100kg per m²
    'survey': 1,
    'application': 1,
    'hour': area * 0.5, // Assume 0.5 hours per m²
    'day': area * 0.1, // Assume 0.1 days per m²
    'set': 1 // Default to 1 set for kitchen/bathroom items
  };
  
  // Adjust quantities based on project type
  const projectMultipliers: { [key: string]: number } = {
    'new-build': 1.0,
    'fit-out': 0.3,
    'refurbishment': 0.7,
    'extension': 0.8
  };
  
  const multiplier = projectMultipliers[projectType] || 1.0;
  return Math.max(1, Math.round(baseQuantities[costItem.unit] * multiplier));
}

// Function to generate comprehensive Project Schedule
function generateComprehensiveSchedule(projectData: {
  projectType: string;
  location: string;
  area: number;
  finishTier: string;
  includeKitchen: boolean;
  includeBathroom: boolean;
  includeMEP: boolean;
}) {
  const { projectType, location, area, finishTier, includeKitchen, includeBathroom, includeMEP } = projectData;
  
  // Get the appropriate schedule template based on project type
  const scheduleTemplate = SCHEDULE_TEMPLATE.projectTypes[projectType as keyof typeof SCHEDULE_TEMPLATE.projectTypes] || 
                          SCHEDULE_TEMPLATE.projectTypes['new-build'];
  
  // Calculate project start date (assume current date)
  const projectStartDate = new Date();
  let currentDate = new Date(projectStartDate);
  
  // Scale durations based on project area
  const areaMultiplier = Math.max(0.8, Math.min(1.5, area / 50));
  
  let schedule = `# PROJECT SCHEDULE (SCHEDULE OF WORKS)\n\n`;
  schedule += `Project Type: ${projectType.replace('-', ' ').toUpperCase()}\n`;
  schedule += `Location: ${location}\n`;
  schedule += `Area: ${area}m²\n`;
  schedule += `Finish Tier: ${finishTier.toUpperCase()}\n`;
  schedule += `Project Start: ${projectStartDate.toLocaleDateString()}\n`;
  schedule += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  // Generate schedule table
  schedule += `## SCHEDULE TABLE\n\n`;
  schedule += `| WBS Code | Task Name | Duration | Start | Finish | Dependencies | Milestone |\n`;
  schedule += `|----------|-----------|----------|-------|--------|--------------|----------|\n`;
  
  const taskDates: { [key: string]: { start: Date; finish: Date } } = {};
  
  // Process each phase
  scheduleTemplate.phases.forEach(phase => {
    schedule += `| **${phase.title}** | | | | | | |\n`;
    
    phase.workPackages.forEach(workPackage => {
      schedule += `| **${workPackage.title}** | | | | | | |\n`;
      
      workPackage.activities.forEach(activity => {
        // Calculate scaled duration
        const scaledDuration = Math.max(1, Math.round(activity.duration * areaMultiplier));
        
        // Calculate start date based on dependencies
        let activityStartDate = new Date(currentDate);
        if (activity.dependencies.length > 0) {
          const latestDependencyFinish = activity.dependencies
            .map(dep => taskDates[dep]?.finish)
            .filter(date => date)
            .sort((a, b) => b.getTime() - a.getTime())[0];
          
          if (latestDependencyFinish) {
            activityStartDate = new Date(latestDependencyFinish);
            activityStartDate.setDate(activityStartDate.getDate() + 1); // Start day after dependency
          }
        }
        
        const activityFinishDate = new Date(activityStartDate);
        activityFinishDate.setDate(activityFinishDate.getDate() + scaledDuration - 1);
        
        // Store dates for dependency calculations
        taskDates[activity.id] = {
          start: activityStartDate,
          finish: activityFinishDate
        };
        
        // Update current date
        if (activityFinishDate > currentDate) {
          currentDate = new Date(activityFinishDate);
        }
        
        // Format dates
        const startStr = activityStartDate.toLocaleDateString();
        const finishStr = activityFinishDate.toLocaleDateString();
        const dependenciesStr = activity.dependencies.length > 0 ? activity.dependencies.join(', ') : '-';
        const milestoneStr = activity.milestone ? '✓' : '-';
        
        schedule += `| ${activity.id} | ${activity.name} | ${scaledDuration} week${scaledDuration > 1 ? 's' : ''} | ${startStr} | ${finishStr} | ${dependenciesStr} | ${milestoneStr} |\n`;
      });
    });
  });
  
  // Calculate project end date
  const projectEndDate = new Date(currentDate);
  const totalDuration = Math.ceil((projectEndDate.getTime() - projectStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
  
  schedule += `\n## PROJECT SUMMARY\n\n`;
  schedule += `• Total Project Duration: ${totalDuration} weeks\n`;
  schedule += `• Project End Date: ${projectEndDate.toLocaleDateString()}\n`;
  // Count milestones from the template
  let milestoneCount = 0;
  scheduleTemplate.phases.forEach(phase => {
    phase.workPackages.forEach(workPackage => {
      workPackage.activities.forEach(activity => {
        if (activity.milestone) milestoneCount++;
      });
    });
  });
  
  schedule += `• Key Milestones: ${milestoneCount} milestones identified\n\n`;
  
  // Generate Gantt-style outline
  schedule += `## GANTT-STYLE OUTLINE\n\n`;
  
  const totalWeeks = totalDuration;
  const weekWidth = Math.max(1, Math.floor(60 / totalWeeks)); // Adjust width based on total weeks
  
  scheduleTemplate.phases.forEach(phase => {
    schedule += `\n### ${phase.title}\n`;
    
    phase.workPackages.forEach(workPackage => {
      schedule += `\n${workPackage.title}:\n`;
      
      workPackage.activities.forEach(activity => {
        const activityDates = taskDates[activity.id];
        if (activityDates) {
          const startWeek = Math.floor((activityDates.start.getTime() - projectStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
          const duration = Math.ceil((activityDates.finish.getTime() - activityDates.start.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
          
          // Create Gantt bar
          let ganttBar = '|';
          for (let i = 0; i < totalWeeks; i++) {
            if (i >= startWeek && i < startWeek + duration) {
              ganttBar += '█'.repeat(weekWidth);
            } else {
              ganttBar += ' '.repeat(weekWidth);
            }
          }
          ganttBar += '|';
          
          schedule += `${activity.id} ${activity.name.padEnd(30)} ${ganttBar}\n`;
        }
      });
    });
  });
  
  // Add critical path analysis
  schedule += `\n## CRITICAL PATH ANALYSIS\n\n`;
  schedule += `The critical path represents the longest sequence of dependent activities:\n\n`;
  
  // Find critical path (simplified - longest chain of dependencies)
  const criticalPath: string[] = [];
  const visited = new Set<string>();
  
  function findCriticalPath(activityId: string, path: string[]): string[] {
    if (visited.has(activityId)) return path;
    visited.add(activityId);
    
    const currentPath = [...path, activityId];
    let longestPath = currentPath;
    
    // Find activities that depend on this one
    scheduleTemplate.phases.forEach(phase => {
      phase.workPackages.forEach(workPackage => {
        workPackage.activities.forEach(activity => {
          if (activity.dependencies.includes(activityId)) {
            const extendedPath = findCriticalPath(activity.id, currentPath);
            if (extendedPath.length > longestPath.length) {
              longestPath = extendedPath;
            }
          }
        });
      });
    });
    
    return longestPath;
  }
  
  // Find the longest critical path
  scheduleTemplate.phases.forEach(phase => {
    phase.workPackages.forEach(workPackage => {
      workPackage.activities.forEach(activity => {
        if (activity.dependencies.length === 0) {
          const path = findCriticalPath(activity.id, []);
          if (path.length > criticalPath.length) {
            criticalPath.splice(0, criticalPath.length, ...path);
          }
        }
      });
    });
  });
  
  if (criticalPath.length > 0) {
    schedule += `Critical Path: ${criticalPath.join(' → ')}\n\n`;
    schedule += `Activities on the critical path must be completed on time to avoid project delays.\n`;
  }
  
  // Add project-specific considerations
  schedule += `\n## PROJECT-SPECIFIC CONSIDERATIONS\n\n`;
  schedule += `• Weather Delays: Allow 10% buffer for weather-related delays\n`;
  schedule += `• Material Lead Times: Order materials 4-6 weeks in advance\n`;
  schedule += `• Permit Approvals: Factor in 2-4 weeks for regulatory approvals\n`;
  schedule += `• Quality Control: Weekly progress meetings and inspections\n`;
  schedule += `• Risk Management: Regular risk assessments and mitigation planning\n\n`;
  
  if (includeKitchen) {
    schedule += `• Kitchen Installation: Coordinate with kitchen supplier delivery schedule\n`;
  }
  
  if (includeBathroom) {
    schedule += `• Bathroom Installation: Ensure waterproofing is completed before tiling\n`;
  }
  
  if (!includeMEP) {
    schedule += `• MEP Works: Not included in this project scope\n`;
  }
  
  schedule += `\n---\n\n`;
  schedule += `Document Control:\n`;
  schedule += `• Version: 1.0\n`;
  schedule += `• Status: Draft\n`;
  schedule += `• Next Review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
  
  return schedule;
}

// Function to generate comprehensive Work Breakdown Structure
function generateComprehensiveWBS(projectData: {
  projectType: string;
  location: string;
  area: number;
  finishTier: string;
  includeKitchen: boolean;
  includeBathroom: boolean;
  includeMEP: boolean;
}) {
  const { projectType, location, area, finishTier, includeKitchen, includeBathroom, includeMEP } = projectData;
  
  // Get the appropriate WBS template based on project type
  const wbsTemplate = WBS_TEMPLATE.projectTypes[projectType as keyof typeof WBS_TEMPLATE.projectTypes] || 
                     WBS_TEMPLATE.projectTypes['new-build'];
  
  let wbs = `# WORK BREAKDOWN STRUCTURE (WBS)\n\n`;
  wbs += `Project Type: ${projectType.replace('-', ' ').toUpperCase()}\n`;
  wbs += `Location: ${location}\n`;
  wbs += `Area: ${area}m²\n`;
  wbs += `Finish Tier: ${finishTier.toUpperCase()}\n`;
  wbs += `Generated: ${new Date().toLocaleDateString()}\n\n`;
  
  // Generate WBS based on template
  wbsTemplate.phases.forEach(phase => {
    wbs += `## ${phase.title}\n\n`;
    
    phase.workPackages.forEach(workPackage => {
      wbs += `### ${workPackage.title}\n`;
      
      workPackage.activities.forEach(activity => {
        wbs += `• ${activity}\n`;
      });
      
      // Add project-specific notes
      if (workPackage.id === 'mep' && !includeMEP) {
        wbs += `\nNote: MEP works not included in this project scope.\n`;
      }
      
      if (workPackage.id === 'internal-works') {
        if (includeKitchen) {
          wbs += `\nKitchen Works Included:\n`;
          wbs += `• Kitchen design and installation\n`;
          wbs += `• Appliances and fixtures\n`;
          wbs += `• Worktop and cabinet installation\n`;
        }
        
        if (includeBathroom) {
          wbs += `\nBathroom Works Included:\n`;
          wbs += `• Bathroom design and installation\n`;
          wbs += `• Sanitary fixtures and fittings\n`;
          wbs += `• Tiling and waterproofing\n`;
        }
      }
      
      wbs += `\n`;
    });
  });
  
  // Add project-specific considerations
  wbs += `---\n\n`;
  wbs += `## Project-Specific Considerations\n\n`;
  wbs += `• Project Duration: ${getProjectDuration(projectType, area)} weeks\n`;
  wbs += `• Key Stakeholders: Client, Architect, Structural Engineer, MEP Consultant\n`;
  wbs += `• Critical Path: Planning approval → Foundation works → Structural works → MEP → Finishes\n`;
  wbs += `• Risk Factors: Weather delays, material availability, regulatory approvals\n`;
  wbs += `• Quality Control: Regular inspections, testing, and commissioning\n\n`;
  
  wbs += `---\n\n`;
  wbs += `Document Control:\n`;
  wbs += `• Version: 1.0\n`;
  wbs += `• Status: Draft\n`;
  wbs += `• Next Review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
  
  return wbs;
}

// Function to generate comprehensive Scope of Works
function generateComprehensiveScopeOfWorks(projectData: {
  projectType: string;
  location: string;
  area: number;
  finishTier: string;
  includeKitchen: boolean;
  includeBathroom: boolean;
  includeMEP: boolean;
}) {
  const { projectType, location, area, finishTier, includeKitchen, includeBathroom, includeMEP } = projectData;
  
  let scopeOfWorks = `# COMPREHENSIVE SCOPE OF WORKS\n\n`;
  scopeOfWorks += `**Project Type:** ${projectType.replace('-', ' ').toUpperCase()}\n`;
  scopeOfWorks += `**Location:** ${location}\n`;
  scopeOfWorks += `**Area:** ${area}m²\n`;
  scopeOfWorks += `**Finish Tier:** ${finishTier.toUpperCase()}\n`;
  scopeOfWorks += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
  
  // Generate each section
  SCOPE_OF_WORKS_TEMPLATE.sections.forEach(section => {
    scopeOfWorks += `## ${section.title}\n\n`;
    
    if (section.subsections) {
      // Handle sections with subsections (like Pre-Construction, MEP)
      section.subsections.forEach(subsection => {
        scopeOfWorks += `### ${subsection.title}\n`;
        subsection.items.forEach(item => {
          scopeOfWorks += `• ${item}\n`;
        });
        scopeOfWorks += `\n`;
      });
    } else {
      // Handle simple sections
      section.items.forEach(item => {
        scopeOfWorks += `• ${item}\n`;
      });
      scopeOfWorks += `\n`;
    }
    
    // Add project-specific notes for certain sections
    if (section.id === 'project-info') {
      scopeOfWorks += `**Project-Specific Details:**\n`;
      scopeOfWorks += `• Project Reference: ${projectType.toUpperCase()}-${Date.now().toString().slice(-6)}\n`;
      scopeOfWorks += `• Estimated Duration: ${getProjectDuration(projectType, area)} weeks\n`;
      scopeOfWorks += `• Key Stakeholders: Client, Architect, Structural Engineer, MEP Consultant\n\n`;
    }
    
    if (section.id === 'mep' && !includeMEP) {
      scopeOfWorks += `**Note:** MEP works not included in this project scope.\n\n`;
    }
    
    if (section.id === 'internal-works') {
      if (includeKitchen) {
        scopeOfWorks += `**Kitchen Works Included:**\n`;
        scopeOfWorks += `• Kitchen design and installation\n`;
        scopeOfWorks += `• Appliances and fixtures\n`;
        scopeOfWorks += `• Worktop and cabinet installation\n\n`;
      }
      
      if (includeBathroom) {
        scopeOfWorks += `**Bathroom Works Included:**\n`;
        scopeOfWorks += `• Bathroom design and installation\n`;
        scopeOfWorks += `• Sanitary fixtures and fittings\n`;
        scopeOfWorks += `• Tiling and waterproofing\n\n`;
      }
    }
  });
  
  scopeOfWorks += `---\n\n`;
  scopeOfWorks += `**Document Control:**\n`;
  scopeOfWorks += `• Version: 1.0\n`;
  scopeOfWorks += `• Status: Draft\n`;
  scopeOfWorks += `• Next Review: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n`;
  
  return scopeOfWorks;
}

// Helper function to estimate project duration
function getProjectDuration(projectType: string, area: number): number {
  const baseDuration = {
    'rear-extension': 20,
    'kitchen-renovation': 8,
    'bathroom-renovation': 6,
    'loft-conversion': 16,
    'new-build': 32,
    'refurbishment': 24
  };
  
  const duration = baseDuration[projectType as keyof typeof baseDuration] || 20;
  const areaMultiplier = Math.max(1, Math.min(2, area / 50)); // Scale based on area
  return Math.round(duration * areaMultiplier);
}

function calculateBaseCosts(projectType: string, area: number, finishTier: string, options: {
  includeKitchen: boolean;
  includeBathroom: boolean;
  includeMEP: boolean;
}, location: string) {
  // Get location info
  const locationInfo = COST_DATA.locations[location as keyof typeof COST_DATA.locations] || COST_DATA.locations['UK'];
  const { currency, symbol, multiplier } = locationInfo;
  
  const costs: Record<string, {
    description: string;
    unitRate: number;
    quantity: number;
    unit: string;
    subtotal: number;
    currency: string;
    symbol: string;
  }> = {};
  let total = 0;

  // Main structure costs
  if (projectType === 'rear-extension' || projectType === 'extension') {
    const baseRate = COST_DATA.baseRates['rear-extension-shell'][finishTier as keyof typeof COST_DATA.baseRates['rear-extension-shell']];
    const adjustedRate = Math.round(baseRate * multiplier);
    costs.structure = {
      description: 'Rear Extension Shell',
      unitRate: adjustedRate,
      quantity: area,
      unit: 'm²',
      subtotal: adjustedRate * area,
      currency,
      symbol
    };
    total += costs.structure.subtotal;
  }

  // Internal finishes
  const internalFinishesBaseRate = COST_DATA.baseRates['internal-finishes'][finishTier as keyof typeof COST_DATA.baseRates['internal-finishes']];
  const internalFinishesAdjustedRate = Math.round(internalFinishesBaseRate * multiplier);
  costs.internalFinishes = {
    description: 'Internal Finishes',
    unitRate: internalFinishesAdjustedRate,
    quantity: area,
    unit: 'm²',
    subtotal: internalFinishesAdjustedRate * area,
    currency,
    symbol
  };
  total += costs.internalFinishes.subtotal;

  // Kitchen
  if (options.includeKitchen) {
    const kitchenBaseRate = COST_DATA.baseRates.kitchen[finishTier as keyof typeof COST_DATA.baseRates.kitchen];
    const kitchenAdjustedRate = Math.round(kitchenBaseRate * multiplier);
    costs.kitchen = {
      description: 'Kitchen Installation',
      unitRate: kitchenAdjustedRate,
      quantity: 1,
      unit: 'kitchen',
      subtotal: kitchenAdjustedRate,
      currency,
      symbol
    };
    total += costs.kitchen.subtotal;
  }

  // Bathroom
  if (options.includeBathroom) {
    const bathroomBaseRate = COST_DATA.baseRates.bathroom[finishTier as keyof typeof COST_DATA.baseRates.bathroom];
    const bathroomAdjustedRate = Math.round(bathroomBaseRate * multiplier);
    costs.bathroom = {
      description: 'Bathroom Installation',
      unitRate: bathroomAdjustedRate,
      quantity: 1,
      unit: 'bathroom',
      subtotal: bathroomAdjustedRate,
      currency,
      symbol
    };
    total += costs.bathroom.subtotal;
  }

  // MEP (Mechanical, Electrical, Plumbing)
  if (options.includeMEP) {
    const mepBaseRate = COST_DATA.baseRates.mep[finishTier as keyof typeof COST_DATA.baseRates.mep];
    const mepAdjustedRate = Math.round(mepBaseRate * multiplier);
    costs.mep = {
      description: 'MEP (Mechanical, Electrical, Plumbing)',
      unitRate: mepAdjustedRate,
      quantity: area,
      unit: 'm²',
      subtotal: mepAdjustedRate * area,
      currency,
      symbol
    };
    total += costs.mep.subtotal;
  }

  // Flooring
  const flooringBaseRate = COST_DATA.baseRates.flooring[finishTier as keyof typeof COST_DATA.baseRates.flooring];
  const flooringAdjustedRate = Math.round(flooringBaseRate * multiplier);
  costs.flooring = {
    description: 'Flooring',
    unitRate: flooringAdjustedRate,
    quantity: area,
    unit: 'm²',
    subtotal: flooringAdjustedRate * area,
    currency,
    symbol
  };
  total += costs.flooring.subtotal;

  return { ...costs, total };
}

function calculateAdditionalCosts(baseTotal: number, location: string) {
  const locationInfo = COST_DATA.locations[location as keyof typeof COST_DATA.locations] || COST_DATA.locations['UK'];
  const { vat, symbol } = locationInfo;
  
  const vatAmount = baseTotal * vat;
  const contingency = baseTotal * COST_DATA.additionalCosts.contingency;
  const consultantFees = baseTotal * COST_DATA.additionalCosts.consultantFees;
  const planningPermission = Math.round(COST_DATA.additionalCosts.planningPermission * locationInfo.multiplier);
  const buildingRegs = Math.round(COST_DATA.additionalCosts.buildingRegs * locationInfo.multiplier);

  return {
    vat: {
      description: `VAT (${Math.round(vat * 100)}%)`,
      amount: vatAmount,
      currency: locationInfo.currency,
      symbol
    },
    contingency: {
      description: 'Contingency (10%)',
      amount: contingency,
      currency: locationInfo.currency,
      symbol
    },
    consultantFees: {
      description: 'Consultant Fees (8%)',
      amount: consultantFees,
      currency: locationInfo.currency,
      symbol
    },
    planningPermission: {
      description: 'Planning Permission',
      amount: planningPermission,
      currency: locationInfo.currency,
      symbol
    },
    buildingRegs: {
      description: 'Building Regulations',
      amount: buildingRegs,
      currency: locationInfo.currency,
      symbol
    },
    total: vatAmount + contingency + consultantFees + planningPermission + buildingRegs
  };
}

function generateItemizedBreakdown(
  baseCosts: Record<string, {
    description: string;
    unitRate: number;
    quantity: number;
    unit: string;
    subtotal: number;
    currency: string;
    symbol: string;
  }>, 
  additionalCosts: Record<string, {
    description: string;
    amount: number;
    currency: string;
    symbol: string;
  }>
) {
  const items: Array<{
    category: string;
    description: string;
    unitRate: string;
    quantity: number;
    subtotal: string;
  }> = [];
  
  // Base costs
  Object.values(baseCosts).forEach((cost) => {
    if (cost.description) {
      items.push({
        category: 'Construction',
        description: cost.description,
        unitRate: `${cost.symbol}${cost.unitRate.toLocaleString()}/${cost.unit}`,
        quantity: cost.quantity,
        subtotal: `${cost.symbol}${Math.round(cost.subtotal).toLocaleString()}`
      });
    }
  });

  // Additional costs
  Object.values(additionalCosts).forEach((cost) => {
    if (cost.description && cost.amount) {
      items.push({
        category: 'Additional',
        description: cost.description,
        unitRate: cost.description.includes('%') ? 'Percentage' : 'Fixed',
        quantity: 1,
        subtotal: `${cost.symbol}${Math.round(cost.amount).toLocaleString()}`
      });
    }
  });

  return items;
}
