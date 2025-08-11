interface DocumentGenerationParams {
  projectName: string;
  location: string;
  description: string;
  sizeSqft?: number;
  type: 'sow' | 'estimate';
}

export async function generateDocumentContent(params: DocumentGenerationParams): Promise<string> {
  const { projectName, location, description, sizeSqft, type } = params;

  // System prompt for construction planning
  const systemPrompt = `You are Brixem's construction planning assistant. Generate professional, structured construction documents in clear markdown format.

For Scope of Work (SOW): Include detailed work descriptions, materials, quality standards, and exclusions.
For Estimates: Provide high-level cost ranges for materials and labor, with assumptions clearly stated.

Use proper markdown formatting with headings, bullet points, tables, and clear sections.`;

  // User prompt with project details
  const userPrompt = `Generate a ${type === 'sow' ? 'Scope of Work' : 'Estimate'} for the following project:

**Project Details:**
- Name: ${projectName}
- Location: ${location}
${sizeSqft ? `- Size: ${sizeSqft} square feet` : ''}
- Description: ${description}

**Requirements:**
${type === 'sow' 
  ? `- Detailed scope of work with clear deliverables
- Materials and quality specifications
- Work phases and timeline
- Exclusions and assumptions
- Quality standards and inspections`
  : `- High-level cost estimate with ranges
- Materials cost breakdown
- Labor cost estimates
- Timeline and phases
- Assumptions and exclusions
- Risk factors and contingencies`
}

Format the response in clean markdown with proper headings, bullet points, and tables where appropriate.`;

  try {
    // Try OpenAI first if available
    if (process.env.OPENAI_API_KEY) {
      return await generateWithOpenAI(systemPrompt, userPrompt);
    }
    
    // Fallback to Ollama if configured
    if (process.env.OLLAMA_BASE_URL) {
      return await generateWithOllama(systemPrompt, userPrompt);
    }
    
    // Fallback to mock content if no AI providers available
    return generateMockContent(params);
    
  } catch (error) {
    console.error('Error generating document content:', error);
    // Return mock content as fallback
    return generateMockContent(params);
  }
}

async function generateWithOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  });

  return response.choices[0]?.message?.content || 'Failed to generate content';
}

async function generateWithOllama(systemPrompt: string, userPrompt: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL;
  
  const response = await fetch(`${ollamaUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3.1:8b', // Default model, can be configured
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      stream: false,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2000,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.response || 'Failed to generate content';
}

function generateMockContent(params: DocumentGenerationParams): string {
  const { projectName, location, description, sizeSqft, type } = params;
  
  if (type === 'sow') {
    return `# Scope of Work - ${projectName}

## Project Overview
**Project Name:** ${projectName}  
**Location:** ${location}  
${sizeSqft ? `**Size:** ${sizeSqft} square feet` : ''}  
**Description:** ${description}

## Scope of Work

### 1. Site Preparation
- Site survey and measurements
- Existing condition assessment
- Permit acquisition and coordination
- Site safety setup and protection

### 2. Demolition and Removal
- Removal of existing fixtures and materials
- Structural assessment and reinforcement if needed
- Debris removal and site cleanup

### 3. Construction Work
- Foundation and structural work (if applicable)
- Framing and structural modifications
- Electrical and plumbing rough-in
- HVAC system installation/upgrades
- Insulation and vapor barrier installation

### 4. Finishing Work
- Interior wall and ceiling finishes
- Flooring installation
- Cabinetry and millwork
- Fixture and appliance installation
- Paint and final finishes

### 5. Quality Assurance
- Progress inspections at key milestones
- Final walkthrough and punch list
- Quality testing and verification

## Materials and Specifications
- All materials to meet local building codes
- Premium grade materials for visible surfaces
- Energy-efficient components where applicable

## Timeline
- **Phase 1 (Weeks 1-2):** Site preparation and permits
- **Phase 2 (Weeks 3-6):** Structural and rough-in work
- **Phase 3 (Weeks 7-10):** Finishing work
- **Phase 4 (Week 11):** Final inspection and cleanup

## Exclusions
- Furniture and personal belongings
- Landscaping and exterior work (unless specified)
- Permits and fees (responsibility of owner)
- Temporary accommodations during construction

## Assumptions
- Access to utilities and services
- Standard working hours (8 AM - 5 PM, Monday-Friday)
- Weather conditions permitting outdoor work
- Owner availability for decisions and approvals

---
*This Scope of Work is generated by Brixem AI and should be reviewed by qualified construction professionals before proceeding with the project.*`;
  } else {
    return `# Cost Estimate - ${projectName}

## Project Summary
**Project Name:** ${projectName}  
**Location:** ${location}  
${sizeSqft ? `**Size:** ${sizeSqft} square feet` : ''}  
**Description:** ${description}

## Cost Breakdown

### Materials
| Category | Estimated Cost | Notes |
|----------|----------------|-------|
| Structural Materials | $15,000 - $25,000 | Framing, foundation, structural components |
| Electrical | $8,000 - $15,000 | Wiring, panels, fixtures, and appliances |
| Plumbing | $6,000 - $12,000 | Pipes, fixtures, and connections |
| HVAC | $5,000 - $10,000 | Heating, ventilation, and air conditioning |
| Finishes | $12,000 - $20,000 | Paint, flooring, cabinets, and trim |
| **Total Materials** | **$46,000 - $82,000** | |

### Labor
| Category | Estimated Hours | Rate | Estimated Cost |
|----------|-----------------|------|----------------|
| General Contractor | 80-120 | $75-100/hr | $6,000 - $12,000 |
| Electrician | 40-60 | $65-85/hr | $2,600 - $5,100 |
| Plumber | 30-45 | $70-90/hr | $2,100 - $4,050 |
| HVAC Technician | 25-35 | $70-90/hr | $1,750 - $3,150 |
| Carpenters | 60-90 | $45-65/hr | $2,700 - $5,850 |
| Painters | 20-30 | $35-50/hr | $700 - $1,500 |
| **Total Labor** | **255-380** | | **$15,850 - $31,650** |

### Additional Costs
- **Permits and Fees:** $2,000 - $5,000
- **Equipment Rental:** $1,500 - $3,000
- **Waste Removal:** $800 - $1,500
- **Contingency (10%):** $6,500 - $12,200

## Total Project Estimate
**Range:** $72,650 - $145,950  
**Recommended Budget:** $110,000

## Timeline Estimate
- **Total Duration:** 10-12 weeks
- **Start Date:** TBD based on permit approval
- **Completion:** TBD based on start date

## Assumptions and Notes
- Costs based on current market rates in ${location}
- Estimates assume standard construction methods
- Prices may vary based on material choices and finishes
- Additional costs may apply for:
  - Design changes during construction
  - Unforeseen structural issues
  - Premium materials or finishes
  - Expedited timeline

## Risk Factors
- **Material Price Fluctuations:** ±5-10% due to market conditions
- **Weather Delays:** Potential for 1-2 week delays
- **Permit Processing:** Timeline dependent on local authorities
- **Supply Chain Issues:** May affect material availability

## Recommendations
1. **Budget Planning:** Plan for the upper end of the estimate range
2. **Timeline:** Allow 2-3 weeks buffer for unexpected delays
3. **Materials:** Lock in material prices early when possible
4. **Insurance:** Ensure adequate coverage during construction

---
*This estimate is generated by Brixem AI and should be reviewed by qualified construction professionals. Actual costs may vary based on specific project requirements and market conditions.*`;
  }
}
