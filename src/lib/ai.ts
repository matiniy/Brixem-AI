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

import { handleApiError, logError } from './error-handling';
import { cache, cacheKeys, hashString } from './cache';
import { validateAndSanitizeInput } from './validation';

export async function sendChatMessage(
  messages: Message[],
  projectContext?: string
): Promise<AIResponse> {
  try {
    // Validate and sanitize inputs
    const sanitizedMessages = messages.map(msg => ({
      ...msg,
      text: validateAndSanitizeInput(msg.text, 4000)
    }));

    const sanitizedContext = projectContext ? validateAndSanitizeInput(projectContext, 1000) : undefined;

    // Generate cache key for this request
    const requestHash = hashString(JSON.stringify({ messages: sanitizedMessages, projectContext: sanitizedContext }));
    const cacheKey = cacheKeys.aiResponse(requestHash);

    // Check cache first
    const cached = cache.get<AIResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: sanitizedMessages,
        projectContext: sanitizedContext,
      }),
    });

    if (!response.ok) {
      const errorData: AIError = await response.json();
      const error = handleApiError(new Error(errorData.error || `HTTP error! status: ${response.status}`));
      logError(error, { endpoint: '/api/chat', status: response.status });
      throw error;
    }

    const data: AIResponse = await response.json();
    
    // Cache the response for 1 hour
    cache.set(cacheKey, data, 60 * 60 * 1000);
    
    return data;
  } catch (error) {
    logError(error as Error, { 
      function: 'sendChatMessage',
      messagesCount: messages.length,
      hasProjectContext: !!projectContext
    });
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