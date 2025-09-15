import { NextRequest, NextResponse } from 'next/server';

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }
  return {
    chat: {
      completions: {
        create: async (params: { model: string; messages: any[]; max_tokens: number; temperature: number }) => {
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

export async function POST(request: NextRequest) {
  try {
    // Get Groq client (this will throw if API key is not configured)
    const groq = getGroqClient();

    // Parse request body
    const body = await request.json();
    const { messages, projectContext } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Create system prompt for construction project context
    const systemPrompt = `You are Brixem AI, a specialized AI assistant for construction and renovation project management. You help homeowners and contractors manage their projects effectively.

Your capabilities include:
- Creating and managing tasks
- Providing project advice and best practices
- Helping with project planning and scheduling
- Answering questions about construction processes
- Suggesting improvements to project workflows

Current project context: ${projectContext || 'General construction project management'}

Always be helpful, professional, and construction-focused. When users ask to create tasks, extract the task details and confirm before creating. Keep responses concise but informative.`;

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
      model: process.env.GROQ_MODEL || 'llama-3.1-70b-versatile',
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