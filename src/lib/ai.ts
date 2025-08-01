export interface Message {
  role: "user" | "ai";
  text: string;
}

export interface AIResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIError {
  error: string;
}

export async function sendChatMessage(
  messages: Message[],
  projectContext?: string
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        projectContext,
      }),
    });

    if (!response.ok) {
      const errorData: AIError = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error) {
    console.error('AI chat error:', error);
    throw error;
  }
}

// Helper function to detect task creation requests
export function detectTaskCreation(message: string): string | null {
  const taskKeywords = [
    'create task',
    'add task', 
    'new task',
    'make task',
    'add card',
    'create card',
    'new card'
  ];
  
  const lowerMessage = message.toLowerCase();
  
  for (const keyword of taskKeywords) {
    if (lowerMessage.includes(keyword)) {
      // Extract task description after the keyword
      const index = lowerMessage.indexOf(keyword);
      const afterKeyword = message.slice(index + keyword.length).trim();
      if (afterKeyword) {
        return afterKeyword;
      }
    }
  }
  
  return null;
}

// Helper function to extract task details from AI response
export function extractTaskDetails(aiResponse: string): {
  title: string;
  description?: string;
  priority?: 'high' | 'medium' | 'low';
} | null {
  // Look for task creation patterns in AI response
  const taskPatterns = [
    /created.*task.*[""]([^""]+)[""]/i,
    /added.*task.*[""]([^""]+)[""]/i,
    /new task.*[""]([^""]+)[""]/i,
  ];

  for (const pattern of taskPatterns) {
    const match = aiResponse.match(pattern);
    if (match && match[1]) {
      return {
        title: match[1].trim(),
        description: `Task created via AI chat`,
        priority: 'medium'
      };
    }
  }

  return null;
} 