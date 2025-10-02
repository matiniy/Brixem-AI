import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getAIClient, getActiveProvider } from '@/lib/ai-providers';

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
  let messageContent: string | undefined;
  let isCostRequest = false;
  
  try {
    console.log('Chat API called');
    
    // Parse request body
    const body = await request.json();
    const { messages, projectContext } = body;

    console.log('Request body:', { messagesCount: messages?.length, hasProjectContext: !!projectContext });

    if (!messages || !Array.isArray(messages)) {
      console.error('Invalid messages array');
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Check if this is a cost estimation request
    const lastMessage = messages[messages.length - 1];
    messageContent = lastMessage?.content || lastMessage?.text;
    
    // Check if this is a cost estimation request
    if (lastMessage && messageContent) {
      const costKeywords = [
        'cost estimate', 'pricing', 'budget', 'cost estimation', 'how much', 'price', 'estimate',
        'estimate a', 'cost of', 'what will it cost', 'total cost', 'renovation cost',
        'bathroom renovation', 'kitchen renovation', 'extension cost', 'loft conversion cost'
      ];
      isCostRequest = costKeywords.some(keyword => 
        messageContent!.toLowerCase().includes(keyword)
      ) || messageContent!.toLowerCase().includes('estimate') && (
        messageContent!.toLowerCase().includes('renovation') ||
        messageContent!.toLowerCase().includes('bathroom') ||
        messageContent!.toLowerCase().includes('kitchen') ||
        messageContent!.toLowerCase().includes('extension') ||
        messageContent!.toLowerCase().includes('loft')
      );
    }
    
    if (lastMessage && messageContent && isCostRequest) {
        // Extract project details from the message
        const projectDetails = extractProjectDetails(messageContent);
        
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

    // Get AI client (this will use the configured provider)
    console.log('Getting AI client...');
    const client = getAIClient();
    const provider = getActiveProvider();
    console.log(`AI client created successfully with provider: ${provider.name}`);

    // Create system prompt for construction project context
    const systemPrompt = `You are Brixem AI, a construction project management assistant. Help users create and manage construction projects through natural conversation.

## CONVERSATION STYLE
- Be conversational and helpful
- Ask follow-up questions naturally
- Don't use rigid step-by-step forms
- Let users describe their project in their own words
- Ask clarifying questions as needed
- Use construction industry terminology appropriately

## PROJECT CREATION GUIDELINES
When a user describes a project, gather information naturally by asking:
- What type of project (extension, renovation, kitchen, bathroom, etc.)
- Where is it located
- What's the size or scope
- What's the budget range
- When do they want to start/finish
- What are their main goals
- Any specific challenges or requirements

## PROJECT CREATION TRIGGERS
Suggest creating a project when you have:
- Project type and basic description
- Location information
- Any additional details (budget, timeline, goals, etc.)

Use phrases like:
- "That sounds like a great project! I have enough information to create your project. Shall I create it now?"
- "Perfect! I'm ready to create your project. Let me set that up for you."
- "I have all the details I need. Let's create your project!"

## RESPONSE FORMAT
- Keep responses conversational and natural
- Ask one question at a time
- Provide specific, actionable advice
- End with clear next steps
- Always be helpful and encouraging

Remember: This is a conversation, not a form. Let users express themselves naturally and guide them through the process organically.`;

    // Prepare messages for Groq
    const groqMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((msg: { role: string; content?: string; text?: string }) => ({
        role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content || msg.text || ''
      }))
    ];

    // Call AI API
    console.log('Calling AI API with provider:', provider.name);
    const completion = await client.chatCompletion(groqMessages, {
      maxTokens: parseInt(process.env.GROQ_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.GROQ_TEMPERATURE || '0.7'),
    });
    console.log('AI API response received');

    const aiResponse = completion.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage || { total_tokens: 0 }
    });

  } catch (error) {
    console.error('AI API error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        component: 'chat_api',
        operation: 'ai_api_call'
      },
      extra: {
        messageContent: messageContent || 'unknown',
        isCostRequest: isCostRequest || false
      }
    });
    
    // Handle specific AI provider errors
    if (error instanceof Error) {
      if (error.message.includes('API key not configured')) {
        console.error('API key not configured error');
        return NextResponse.json(
          { error: 'AI API key not configured' },
          { status: 500 }
        );
      }
      if (error.message.includes('API key')) {
        console.error('Invalid API key error');
        return NextResponse.json(
          { error: 'Invalid AI API key' },
          { status: 401 }
        );
      }
      if (error.message.includes('quota') || error.message.includes('rate limit')) {
        console.error('Rate limit error');
        return NextResponse.json(
          { error: 'AI API rate limit exceeded' },
          { status: 429 }
        );
      }
    }

    console.error('Generic error, returning 500');
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    );
  }
}