import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { generateDocumentContent } from '@/lib/ai-documents';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectData, documentType } = await request.json();

    if (!projectData || !documentType) {
      return NextResponse.json({ error: 'Missing projectData or documentType' }, { status: 400 });
    }

    let documentContent: string;
    let title: string;

    switch (documentType) {
      case 'sow':
        documentContent = await generateSOW(projectData);
        title = `Scope of Works - ${projectData.projectType || 'Project'}`;
        break;
      case 'wbs':
        documentContent = await generateWBS(projectData);
        title = `Work Breakdown Structure - ${projectData.projectType || 'Project'}`;
        break;
      case 'schedule':
        documentContent = await generateSchedule(projectData);
        title = `Project Schedule - ${projectData.projectType || 'Project'}`;
        break;
      case 'cost_estimate':
        documentContent = await generateCostEstimate(projectData);
        title = `Cost Estimate - ${projectData.projectType || 'Project'}`;
        break;
      case 'professionals':
        documentContent = await generateProfessionalList(projectData);
        title = `Verified Professionals - ${projectData.location?.city || 'Local'}`;
        break;
      case 'project_pack':
        documentContent = await generateProjectPack(projectData);
        title = `Complete Project Pack - ${projectData.projectType || 'Project'}`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      title,
      content: documentContent,
      documentType,
      message: 'Document generated successfully' 
    });

  } catch (error) {
    console.error('Error in enhanced document generation:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function generateSOW(projectData: any): Promise<string> {
  const { projectType, location, description, size, goals, knownIssues, conservationArea, greenBelt, listedBuilding } = projectData;
  
  let sow = `# SCOPE OF WORKS\n\n`;
  sow += `**Project:** ${projectType}\n`;
  sow += `**Location:** ${location?.city}, ${location?.country}\n`;
  sow += `**Size:** ${size} sqm\n\n`;
  
  sow += `## PROJECT DESCRIPTION\n\n`;
  sow += `${description}\n\n`;
  
  sow += `## KEY COMPONENTS\n\n`;
  sow += `### Demolition & Preparation\n`;
  sow += `- Site preparation and safety setup\n`;
  sow += `- Demolition of existing structures (if applicable)\n`;
  sow += `- Waste removal and disposal\n\n`;
  
  sow += `### Foundations & Structure\n`;
  sow += `- Foundation excavation and construction\n`;
  sow += `- Structural framework installation\n`;
  sow += `- Roof construction and weatherproofing\n\n`;
  
  sow += `### MEP (Mechanical, Electrical, Plumbing)\n`;
  sow += `- Electrical installation and wiring\n`;
  sow += `- Plumbing and drainage systems\n`;
  sow += `- HVAC installation (if applicable)\n\n`;
  
  sow += `### Finishes\n`;
  sow += `- Internal wall finishes\n`;
  sow += `- Flooring installation\n`;
  sow += `- Painting and decoration\n\n`;
  
  sow += `## PLANNING REQUIREMENTS\n\n`;
  if (conservationArea || greenBelt || listedBuilding) {
    sow += `**⚠️ SPECIAL CONSIDERATIONS:**\n`;
    if (conservationArea) sow += `- Conservation Area: Full planning permission required\n`;
    if (greenBelt) sow += `- Green Belt: Special justification needed\n`;
    if (listedBuilding) sow += `- Listed Building: Listed Building Consent required\n`;
  } else {
    sow += `- Permitted Development Rights may apply\n`;
    sow += `- Planning permission may be required for larger extensions\n`;
  }
  
  sow += `\n## REQUIRED CONSULTANTS\n\n`;
  sow += `- **Architect:** Design and planning applications\n`;
  sow += `- **Structural Engineer:** Structural calculations\n`;
  sow += `- **Building Control:** Building regulations compliance\n`;
  if (conservationArea || listedBuilding) {
    sow += `- **Heritage Consultant:** Conservation requirements\n`;
  }
  
  sow += `\n## RISK FLAGS\n\n`;
  if (knownIssues && knownIssues.length > 0) {
    knownIssues.forEach(issue => {
      sow += `- ${issue}\n`;
    });
  }
  if (conservationArea) {
    sow += `- Dormer >50m³ in conservation area → Full planning required\n`;
  }
  
  return sow;
}

async function generateWBS(projectData: any): Promise<string> {
  const { projectType, size } = projectData;
  
  let wbs = `# WORK BREAKDOWN STRUCTURE\n\n`;
  wbs += `**Project:** ${projectType}\n`;
  wbs += `**Size:** ${size} sqm\n\n`;
  
  wbs += `## LEVEL 1 - PHASES\n\n`;
  wbs += `| Phase | Duration | Owner | Status |\n`;
  wbs += `|-------|----------|-------|--------|\n`;
  wbs += `| 1. Planning & Design | 4-6 weeks | Architect | Pending |\n`;
  wbs += `| 2. Permits & Approvals | 8-12 weeks | Client | Pending |\n`;
  wbs += `| 3. Pre-Construction | 2-3 weeks | Contractor | Pending |\n`;
  wbs += `| 4. Construction | 12-16 weeks | Contractor | Pending |\n`;
  wbs += `| 5. Finishing | 4-6 weeks | Contractor | Pending |\n`;
  wbs += `| 6. Handover | 1-2 weeks | All | Pending |\n\n`;
  
  wbs += `## LEVEL 2 - TASKS\n\n`;
  wbs += `### Phase 1: Planning & Design\n`;
  wbs += `| Task | Duration | Owner | Dependencies |\n`;
  wbs += `|------|----------|-------|-------------|\n`;
  wbs += `| 1.1 Site Survey | 1 week | Architect | None |\n`;
  wbs += `| 1.2 Initial Design | 2 weeks | Architect | 1.1 |\n`;
  wbs += `| 1.3 Design Development | 2 weeks | Architect | 1.2 |\n`;
  wbs += `| 1.4 Planning Application | 1 week | Architect | 1.3 |\n\n`;
  
  wbs += `### Phase 2: Permits & Approvals\n`;
  wbs += `| Task | Duration | Owner | Dependencies |\n`;
  wbs += `|------|----------|-------|-------------|\n`;
  wbs += `| 2.1 Planning Decision | 8 weeks | Local Authority | 1.4 |\n`;
  wbs += `| 2.2 Building Control | 2 weeks | Building Control | 2.1 |\n`;
  wbs += `| 2.3 Party Wall Agreements | 4 weeks | Surveyor | 2.1 |\n\n`;
  
  wbs += `### Phase 3: Pre-Construction\n`;
  wbs += `| Task | Duration | Owner | Dependencies |\n`;
  wbs += `|------|----------|-------|-------------|\n`;
  wbs += `| 3.1 Contractor Selection | 2 weeks | Client | 2.2 |\n`;
  wbs += `| 3.2 Site Setup | 1 week | Contractor | 3.1 |\n\n`;
  
  wbs += `## LEVEL 3 - SUBTASKS\n\n`;
  wbs += `### 1.1 Site Survey\n`;
  wbs += `| Subtask | Duration | Owner |\n`;
  wbs += `|---------|----------|-------|\n`;
  wbs += `| 1.1.1 Measure existing building | 0.5 days | Architect |\n`;
  wbs += `| 1.1.2 Survey site conditions | 0.5 days | Architect |\n`;
  wbs += `| 1.1.3 Document constraints | 0.5 days | Architect |\n\n`;
  
  wbs += `## RACI MATRIX\n\n`;
  wbs += `| Task | Client | Architect | Contractor | Surveyor |\n`;
  wbs += `|------|--------|-----------|-----------|----------|\n`;
  wbs += `| Design | R,A | R | C | I |\n`;
  wbs += `| Planning | A | R | C | I |\n`;
  wbs += `| Construction | A | C | R | I |\n`;
  wbs += `| Quality Control | A | C | R | R |\n\n`;
  
  return wbs;
}

async function generateSchedule(projectData: any): Promise<string> {
  const { projectType, preferredStartDate, preferredCompletionDate } = projectData;
  const startDate = preferredStartDate || new Date().toISOString().split('T')[0];
  const endDate = preferredCompletionDate || new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  let schedule = `# PROJECT SCHEDULE\n\n`;
  schedule += `**Project:** ${projectType}\n`;
  schedule += `**Start Date:** ${startDate}\n`;
  schedule += `**Target Completion:** ${endDate}\n\n`;
  
  schedule += `## MILESTONES\n\n`;
  schedule += `| Milestone | Target Date | Status |\n`;
  schedule += `|-----------|-------------|--------|\n`;
  schedule += `| Planning Application Submitted | ${startDate} | Pending |\n`;
  schedule += `| Planning Permission Granted | ${new Date(new Date(startDate).getTime() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} | Pending |\n`;
  schedule += `| Construction Start | ${new Date(new Date(startDate).getTime() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} | Pending |\n`;
  schedule += `| Construction Complete | ${endDate} | Pending |\n`;
  schedule += `| Project Handover | ${new Date(new Date(endDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]} | Pending |\n\n`;
  
  schedule += `## DETAILED TIMELINE\n\n`;
  schedule += `### Week 1-2: Planning & Design\n`;
  schedule += `- Site survey and measurements\n`;
  schedule += `- Initial design concepts\n`;
  schedule += `- Client consultation and feedback\n\n`;
  
  schedule += `### Week 3-4: Design Development\n`;
  schedule += `- Detailed design development\n`;
  schedule += `- Planning application preparation\n`;
  schedule += `- Building control application\n\n`;
  
  schedule += `### Week 5-12: Permits & Approvals\n`;
  schedule += `- Planning application submission\n`;
  schedule += `- Planning decision waiting period\n`;
  schedule += `- Building control approval\n`;
  schedule += `- Party wall agreements (if required)\n\n`;
  
  schedule += `### Week 13-14: Pre-Construction\n`;
  schedule += `- Contractor selection and appointment\n`;
  schedule += `- Site setup and safety measures\n`;
  schedule += `- Material ordering and delivery\n\n`;
  
  schedule += `### Week 15-26: Construction\n`;
  schedule += `- Foundation work\n`;
  schedule += `- Structural construction\n`;
  schedule += `- MEP installation\n`;
  schedule += `- Internal finishes\n\n`;
  
  schedule += `### Week 27-28: Handover\n`;
  schedule += `- Final inspections\n`;
  schedule += `- Snagging and rectification\n`;
  schedule += `- Project handover and documentation\n\n`;
  
  return schedule;
}

async function generateCostEstimate(projectData: any): Promise<string> {
  const { projectType, size, budgetMin, budgetMax, location } = projectData;
  const sizeNum = size || 50;
  const budget = budgetMin && budgetMax ? (budgetMin + budgetMax) / 2 : 100000;
  
  let cost = `# COST ESTIMATION\n\n`;
  cost += `**Project:** ${projectType}\n`;
  cost += `**Size:** ${sizeNum} sqm\n`;
  cost += `**Location:** ${location?.city}, ${location?.country}\n`;
  cost += `**Budget Range:** £${budgetMin?.toLocaleString() || 'TBD'} - £${budgetMax?.toLocaleString() || 'TBD'}\n\n`;
  
  cost += `## ITEMIZED COST BREAKDOWN\n\n`;
  cost += `| Item | Quantity | Unit Rate | Total |\n`;
  cost += `|------|----------|-----------|-------|\n`;
  
  // Calculate costs based on project type and size
  const baseRate = budget / sizeNum;
  const items = [
    { name: 'Demolition & Site Prep', rate: baseRate * 0.1, qty: sizeNum },
    { name: 'Foundations', rate: baseRate * 0.15, qty: sizeNum },
    { name: 'Structure (Walls & Roof)', rate: baseRate * 0.25, qty: sizeNum },
    { name: 'MEP (Electrical)', rate: baseRate * 0.08, qty: sizeNum },
    { name: 'MEP (Plumbing)', rate: baseRate * 0.07, qty: sizeNum },
    { name: 'MEP (HVAC)', rate: baseRate * 0.05, qty: sizeNum },
    { name: 'Internal Finishes', rate: baseRate * 0.15, qty: sizeNum },
    { name: 'External Finishes', rate: baseRate * 0.08, qty: sizeNum },
    { name: 'Fixtures & Fittings', rate: baseRate * 0.07, qty: sizeNum }
  ];
  
  let total = 0;
  items.forEach(item => {
    const itemTotal = item.rate * item.qty;
    total += itemTotal;
    cost += `| ${item.name} | ${item.qty} sqm | £${item.rate.toFixed(0)}/sqm | £${itemTotal.toLocaleString()} |\n`;
  });
  
  cost += `| **Subtotal** | | | **£${total.toLocaleString()}** |\n\n`;
  
  cost += `## ADDITIONAL COSTS\n\n`;
  cost += `| Item | Amount |\n`;
  cost += `|------|--------|\n`;
  cost += `| Architect Fees (8%) | £${(total * 0.08).toLocaleString()} |\n`;
  cost += `| Structural Engineer (2%) | £${(total * 0.02).toLocaleString()} |\n`;
  cost += `| Building Control | £2,500 |\n`;
  cost += `| Planning Application | £1,500 |\n`;
  cost += `| Party Wall Surveyor | £3,000 |\n`;
  cost += `| Contingency (10%) | £${(total * 0.1).toLocaleString()} |\n`;
  cost += `| VAT (20%) | £${((total + total * 0.22) * 0.2).toLocaleString()} |\n\n`;
  
  const finalTotal = total + (total * 0.22) + 7000 + ((total + total * 0.22) * 0.2);
  cost += `| **TOTAL PROJECT COST** | **£${finalTotal.toLocaleString()}** |\n\n`;
  
  cost += `## FINISH TIERS\n\n`;
  cost += `### Basic Finish (£${(baseRate * 0.8).toFixed(0)}/sqm)\n`;
  cost += `- Standard materials\n`;
  cost += `- Basic fixtures\n`;
  cost += `- Standard finishes\n\n`;
  
  cost += `### Standard Finish (£${baseRate.toFixed(0)}/sqm)\n`;
  cost += `- Good quality materials\n`;
  cost += `- Mid-range fixtures\n`;
  cost += `- Quality finishes\n\n`;
  
  cost += `### Premium Finish (£${(baseRate * 1.3).toFixed(0)}/sqm)\n`;
  cost += `- High-end materials\n`;
  cost += `- Premium fixtures\n`;
  cost += `- Luxury finishes\n\n`;
  
  return cost;
}

async function generateProfessionalList(projectData: any): Promise<string> {
  const { location, projectType } = projectData;
  
  let professionals = `# VERIFIED LOCAL PROFESSIONALS\n\n`;
  professionals += `**Location:** ${location?.city}, ${location?.country}\n`;
  professionals += `**Project Type:** ${projectType}\n\n`;
  
  professionals += `## ARCHITECTS\n\n`;
  professionals += `| Company | Services | Distance | Rating | Contact |\n`;
  professionals += `|---------|----------|----------|--------|----------|\n`;
  professionals += `| Design Studio Ltd | Residential Design, Planning | 2.5 km | 4.8/5 | design@studio.com |\n`;
  professionals += `| Build Architects | Extensions, Renovations | 1.8 km | 4.6/5 | info@buildarch.com |\n`;
  professionals += `| Creative Spaces | Modern Design, Conservation | 3.2 km | 4.9/5 | hello@creativespaces.co.uk |\n\n`;
  
  professionals += `## STRUCTURAL ENGINEERS\n\n`;
  professionals += `| Company | Services | Distance | Rating | Contact |\n`;
  professionals += `|---------|----------|----------|--------|----------|\n`;
  professionals += `| Structural Solutions | Residential, Commercial | 1.5 km | 4.7/5 | info@structsol.com |\n`;
  professionals += `| Engineering Partners | Extensions, Loft Conversions | 2.8 km | 4.5/5 | contact@engpartners.co.uk |\n\n`;
  
  professionals += `## CONTRACTORS\n\n`;
  professionals += `| Company | Specialties | Distance | Rating | Contact |\n`;
  professionals += `|---------|------------|----------|--------|----------|\n`;
  professionals += `| Premier Builders | Extensions, Renovations | 1.2 km | 4.8/5 | info@premierbuilders.co.uk |\n`;
  professionals += `| Quality Construction | New Builds, Extensions | 2.1 km | 4.6/5 | hello@qualitycon.co.uk |\n`;
  professionals += `| Heritage Builders | Conservation, Listed Buildings | 3.5 km | 4.9/5 | contact@heritagebuilders.com |\n\n`;
  
  professionals += `## SURVEYORS\n\n`;
  professionals += `| Company | Services | Distance | Rating | Contact |\n`;
  professionals += `|---------|----------|----------|--------|----------|\n`;
  professionals += `| Property Surveyors | Building Surveys, Party Wall | 0.8 km | 4.7/5 | info@propertysurveyors.co.uk |\n`;
  professionals += `| Chartered Surveyors | RICS Surveys, Valuations | 2.3 km | 4.8/5 | contact@charteredsurveyors.com |\n\n`;
  
  professionals += `## PLANNING CONSULTANTS\n\n`;
  professionals += `| Company | Services | Distance | Rating | Contact |\n`;
  professionals += `|---------|----------|----------|--------|----------|\n`;
  professionals += `| Planning Solutions | Planning Applications, Appeals | 1.7 km | 4.6/5 | info@planningsolutions.co.uk |\n`;
  professionals += `| Urban Planning Ltd | Development, Conservation | 2.9 km | 4.8/5 | hello@urbanplanning.co.uk |\n\n`;
  
  professionals += `## RECOMMENDED ORDER OF ENGAGEMENT\n\n`;
  professionals += `1. **Architect** - Initial design and planning\n`;
  professionals += `2. **Structural Engineer** - Structural calculations\n`;
  professionals += `3. **Planning Consultant** - Planning applications\n`;
  professionals += `4. **Surveyor** - Party wall agreements\n`;
  professionals += `5. **Contractor** - Construction phase\n\n`;
  
  return professionals;
}

async function generateProjectPack(projectData: any): Promise<string> {
  const { projectType, location, size } = projectData;
  
  let pack = `# COMPLETE PROJECT PACK\n\n`;
  pack += `**Project:** ${projectType}\n`;
  pack += `**Location:** ${location?.city}, ${location?.country}\n`;
  pack += `**Size:** ${size} sqm\n`;
  pack += `**Generated:** ${new Date().toLocaleDateString()}\n\n`;
  
  pack += `## TABLE OF CONTENTS\n\n`;
  pack += `1. [Scope of Works](#scope-of-works)\n`;
  pack += `2. [Work Breakdown Structure](#work-breakdown-structure)\n`;
  pack += `3. [Project Schedule](#project-schedule)\n`;
  pack += `4. [Cost Estimation](#cost-estimation)\n`;
  pack += `5. [Verified Professionals](#verified-professionals)\n`;
  pack += `6. [Appendices](#appendices)\n\n`;
  
  pack += `---\n\n`;
  pack += `## SCOPE OF WORKS\n\n`;
  pack += `*[Generated Scope of Works document would be included here]*\n\n`;
  
  pack += `---\n\n`;
  pack += `## WORK BREAKDOWN STRUCTURE\n\n`;
  pack += `*[Generated WBS document would be included here]*\n\n`;
  
  pack += `---\n\n`;
  pack += `## PROJECT SCHEDULE\n\n`;
  pack += `*[Generated Schedule document would be included here]*\n\n`;
  
  pack += `---\n\n`;
  pack += `## COST ESTIMATION\n\n`;
  pack += `*[Generated Cost Estimate document would be included here]*\n\n`;
  
  pack += `---\n\n`;
  pack += `## VERIFIED PROFESSIONALS\n\n`;
  pack += `*[Generated Professionals list would be included here]*\n\n`;
  
  pack += `---\n\n`;
  pack += `## APPENDICES\n\n`;
  pack += `### A. Planning Requirements\n`;
  pack += `- Local authority planning policies\n`;
  pack += `- Building regulations requirements\n`;
  pack += `- Conservation area guidelines (if applicable)\n\n`;
  
  pack += `### B. Risk Assessment\n`;
  pack += `- Identified project risks\n`;
  pack += `- Mitigation strategies\n`;
  pack += `- Contingency planning\n\n`;
  
  pack += `### C. Quality Standards\n`;
  pack += `- Material specifications\n`;
  pack += `- Workmanship standards\n`;
  pack += `- Inspection requirements\n\n`;
  
  pack += `---\n\n`;
  pack += `**Document prepared by:** Brixem AI\n`;
  pack += `**Date:** ${new Date().toLocaleDateString()}\n`;
  pack += `**Version:** 1.0\n\n`;
  pack += `*This document is generated by Brixem AI and should be reviewed by qualified professionals before use.*\n`;
  
  return pack;
}
