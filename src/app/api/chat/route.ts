import { NextRequest, NextResponse } from 'next/server';

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }
  return {
    chat: {
      completions: {
        create: async (params: { model: string; messages: { role: string; content: string }[]; max_tokens: number; temperature: number }) => {
          const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });
          
          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Groq API error: ${response.status} ${error}`);
          }
          
          return response.json();
        }
      }
    }
  };
};

// Helper function to extract project details from user message
function extractProjectDetails(message: string) {
  const text = message.toLowerCase();
  
  // Extract area (look for numbers followed by m², sqm, square meters, etc.)
  const areaMatch = text.match(/(\d+)\s*(m²|sqm|square\s*meters?|m2)/);
  const area = areaMatch ? parseInt(areaMatch[1]) : 40; // Default to 40m²
  
  // Extract project type
  let projectType = 'rear-extension'; // Default
  if (text.includes('kitchen') || text.includes('kitchen renovation')) {
    projectType = 'kitchen-renovation';
  } else if (text.includes('bathroom') || text.includes('bathroom renovation')) {
    projectType = 'bathroom-renovation';
  } else if (text.includes('extension') || text.includes('rear extension')) {
    projectType = 'rear-extension';
  } else if (text.includes('loft') || text.includes('loft conversion')) {
    projectType = 'loft-conversion';
  }
  
  // Extract finish tier
  let finishTier = 'standard'; // Default
  if (text.includes('basic') || text.includes('budget')) {
    finishTier = 'basic';
  } else if (text.includes('premium') || text.includes('luxury') || text.includes('high-end')) {
    finishTier = 'premium';
  }
  
  // Extract location
  let location = 'UK'; // Default
  const locationKeywords = {
    'London': ['london', 'greater london'],
    'US': ['united states', 'usa', 'us', 'america', 'american'],
    'Canada': ['canada', 'canadian'],
    'Australia': ['australia', 'australian', 'sydney', 'melbourne'],
    'Germany': ['germany', 'german', 'berlin', 'munich'],
    'France': ['france', 'french', 'paris'],
    'Netherlands': ['netherlands', 'dutch', 'amsterdam'],
    'Ireland': ['ireland', 'irish', 'dublin']
  };
  
  for (const [loc, keywords] of Object.entries(locationKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      location = loc;
      break;
    }
  }
  
  // Check for inclusions
  const includeKitchen = text.includes('kitchen') || text.includes('cooking');
  const includeBathroom = text.includes('bathroom') || text.includes('toilet') || text.includes('shower');
  const includeMEP = !text.includes('no mep') && !text.includes('no electrical');
  
  return {
    projectType,
    area,
    finishTier,
    includeKitchen,
    includeBathroom,
    includeMEP,
    location
  };
}

// Helper function to format cost estimation response
function formatCostEstimation(costData: {
  projectType: string;
  location: string;
  currency: string;
  symbol: string;
  itemizedBreakdown: Array<{
    category: string;
    description: string;
    unitRate: string;
    quantity: number;
    subtotal: string;
  }>;
  summary: {
    totalFormatted: string;
    costPerM2Formatted: string;
  };
  assumptions: {
    area: string;
    finishTier: string;
    includeKitchen: boolean;
    includeBathroom: boolean;
    includeMEP: boolean;
    lastUpdated: string;
  };
  comprehensiveScopeOfWorks?: string;
  comprehensiveWBS?: string;
  comprehensiveSchedule?: string;
  detailedCostBreakdown?: string;
  costTotals?: {
    construction: number;
    professional: number;
    permits: number;
    contingency: number;
    grandTotal: number;
  };
}) {
  const { projectType, location, currency, symbol, itemizedBreakdown, summary, assumptions } = costData;
  
  let response = `## 💰 Live Cost Estimation\n\n`;
  
  // Project summary
  response += `Project: ${projectType.replace('-', ' ').toUpperCase()}\n`;
  response += `Location: ${location}\n`;
  response += `Area: ${assumptions.area}\n`;
  response += `Finish Tier: ${assumptions.finishTier}\n`;
  response += `Total Cost: ${summary.totalFormatted}\n`;
  response += `Cost per m²: ${summary.costPerM2Formatted}\n\n`;
  
  // Itemized breakdown
  response += `### 📋 Itemized Breakdown\n\n`;
  
  // Construction costs
  const constructionItems = itemizedBreakdown.filter((item) => item.category === 'Construction');
  if (constructionItems.length > 0) {
    response += `Construction Costs:\n`;
    constructionItems.forEach((item) => {
      response += `• ${item.description}: ${item.subtotal} (${item.unitRate} × ${item.quantity})\n`;
    });
    response += `\n`;
  }
  
  // Additional costs
  const additionalItems = itemizedBreakdown.filter((item) => item.category === 'Additional');
  if (additionalItems.length > 0) {
    response += `Additional Costs:\n`;
    additionalItems.forEach((item) => {
      response += `• ${item.description}: ${item.subtotal}\n`;
    });
    response += `\n`;
  }
  
  // Assumptions
  response += `### 📝 Assumptions\n`;
  response += `• Location: ${location}\n`;
  response += `• Currency: ${currency} (${symbol})\n`;
  response += `• Area: ${assumptions.area}\n`;
  response += `• Finish Tier: ${assumptions.finishTier}\n`;
  response += `• Kitchen Included: ${assumptions.includeKitchen ? 'Yes' : 'No'}\n`;
  response += `• Bathroom Included: ${assumptions.includeBathroom ? 'Yes' : 'No'}\n`;
  response += `• MEP Included: ${assumptions.includeMEP ? 'Yes' : 'No'}\n`;
  response += `• VAT: Included (location-specific rate)\n`;
  response += `• Contingency: Included (10%)\n`;
  response += `• Consultant Fees: Included (8%)\n`;
  response += `• Last Updated: ${new Date(assumptions.lastUpdated).toLocaleDateString()}\n\n`;
  
  response += `> Note: This is a live cost estimation based on current ${location} construction rates. I can also research real-time market prices and local regulations using web browsing to provide even more accurate estimates. Prices may vary based on location, specific requirements, and market conditions. Always consult with local contractors for detailed quotes.`;
  
  // Add comprehensive Scope of Works if available
  if (costData.comprehensiveScopeOfWorks) {
    response += `\n\n---\n\n`;
    response += `## 📋 COMPREHENSIVE SCOPE OF WORKS\n\n`;
    response += `I've also generated a detailed Scope of Works document that covers all aspects of your project:\n\n`;
    response += costData.comprehensiveScopeOfWorks;
  }
  
  // Add comprehensive Work Breakdown Structure if available
  if (costData.comprehensiveWBS) {
    response += `\n\n---\n\n`;
    response += `## 🔨 WORK BREAKDOWN STRUCTURE (WBS)\n\n`;
    response += `Here's your detailed Work Breakdown Structure with hierarchical task organization:\n\n`;
    response += costData.comprehensiveWBS;
  }
  
  // Add comprehensive Project Schedule if available
  if (costData.comprehensiveSchedule) {
    response += `\n\n---\n\n`;
    response += `## 📅 PROJECT SCHEDULE (SCHEDULE OF WORKS)\n\n`;
    response += `Here's your detailed project schedule with dependencies, milestones, and Gantt-style visualization:\n\n`;
    response += costData.comprehensiveSchedule;
  }
  
  // Add detailed itemized cost breakdown if available
  if (costData.detailedCostBreakdown) {
    response += `\n\n---\n\n`;
    response += `## 💰 DETAILED COST BREAKDOWN\n\n`;
    response += `Here's your comprehensive itemized cost breakdown aligned with the WBS structure:\n\n`;
    response += costData.detailedCostBreakdown;
  }
  
  return response;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { messages, projectContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if this is a cost estimation request
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.text) {
      const costKeywords = ['cost estimate', 'pricing', 'budget', 'cost estimation', 'how much', 'price', 'estimate'];
      const isCostRequest = costKeywords.some(keyword => 
        lastMessage.text.toLowerCase().includes(keyword)
      );

      if (isCostRequest) {
        // Extract project details from the message
        const projectDetails = extractProjectDetails(lastMessage.text);
        
        // Get live cost estimation
        const costResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/cost-estimation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectDetails)
        });

        if (costResponse.ok) {
          const costData = await costResponse.json();
          const formattedResponse = formatCostEstimation(costData);
          
          return NextResponse.json({
            message: formattedResponse,
            costData: costData,
            isCostEstimation: true
          });
        }
      }
    }

    // Get Groq client (this will throw if API key is not configured)
    const groq = getGroqClient();

    // Create system prompt for construction project context
    const systemPrompt = `You are Brixem AI, a specialized AI assistant for construction and renovation project management. You help homeowners and contractors manage their projects effectively.

Your capabilities include:
- Creating and managing tasks
- Providing project advice and best practices
- Helping with project planning and scheduling
- Answering questions about construction processes
- Suggesting improvements to project workflows
- Providing live cost estimations for construction projects
- Accessing real-time web information for current market prices, regulations, and best practices
- Researching latest construction trends, materials, and technologies
- Finding current building codes and regulations
- Looking up local contractor reviews and recommendations
- Checking current material prices and availability

IMPORTANT: You have web browsing enabled! Use this capability to:
- Get the most current construction material prices and market rates
- Research local building regulations and permit requirements
- Find up-to-date contractor reviews and recommendations
- Look up latest construction techniques and best practices
- Verify current building codes and compliance requirements
- Research specific product specifications and availability

When providing cost estimates or advice, always try to use current web data to ensure accuracy and relevance.

Current project context: ${projectContext || 'General construction project management'}

Always be helpful, professional, and construction-focused. When users ask to create tasks, extract the task details and confirm before creating. Keep responses concise but informative. Use web browsing to provide the most current and accurate information possible.`;

    // Prepare messages for Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: { role: string; text: string }) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }))
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: groqMessages,
      max_tokens: parseInt(process.env.GROQ_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.GROQ_TEMPERATURE || '0.7'),
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: aiResponse,
      usage: completion.usage
    });

  } catch (error) {
    console.error('Groq API error:', error);
    
    // Handle specific Groq errors
    if (error instanceof Error) {
      if (error.message.includes('API key not configured')) {
        return NextResponse.json(
          { error: 'Groq API key not configured' },
          { status: 500 }
        );
      }
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid Groq API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Groq API rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}