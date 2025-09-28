// AI Provider Configuration
export interface AIProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  models: {
    chat: string;
    fast: string;
    advanced: string;
  };
  headers: Record<string, string>;
  maxTokens: number;
  temperature: number;
}

// Provider configurations
export const AI_PROVIDERS: Record<string, AIProvider> = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_API_KEY || '',
    models: {
      chat: 'gpt-3.5-turbo',
      fast: 'gpt-3.5-turbo',
      advanced: 'gpt-4'
    },
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    maxTokens: 2000,
    temperature: 0.7
  },
  
  anthropic: {
    name: 'Anthropic Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    models: {
      chat: 'claude-3-haiku-20240307',
      fast: 'claude-3-haiku-20240307',
      advanced: 'claude-3-sonnet-20240229'
    },
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    maxTokens: 2000,
    temperature: 0.7
  },
  
  google: {
    name: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: process.env.GOOGLE_API_KEY || '',
    models: {
      chat: 'gemini-pro',
      fast: 'gemini-pro',
      advanced: 'gemini-pro'
    },
    headers: {
      'Content-Type': 'application/json'
    },
    maxTokens: 2000,
    temperature: 0.7
  },
  
  huggingface: {
    name: 'Hugging Face',
    baseUrl: 'https://api-inference.huggingface.co/models',
    apiKey: process.env.HUGGINGFACE_API_KEY || '',
    models: {
      chat: 'microsoft/DialoGPT-medium',
      fast: 'microsoft/DialoGPT-medium',
      advanced: 'meta-llama/Llama-2-7b-chat-hf'
    },
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    maxTokens: 1000,
    temperature: 0.7
  },
  
  groq: {
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY || '',
    models: {
      chat: 'llama-3.3-70b-versatile',
      fast: 'llama-3.3-70b-versatile',
      advanced: 'llama-3.3-70b-versatile'
    },
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    maxTokens: 2000,
    temperature: 0.7
  }
};

// Get the active provider based on environment
export function getActiveProvider(): AIProvider {
  const providerName = process.env.AI_PROVIDER || 'openai';
  const provider = AI_PROVIDERS[providerName];
  
  if (!provider) {
    throw new Error(`AI provider '${providerName}' not found`);
  }
  
  if (!provider.apiKey) {
    throw new Error(`API key not configured for ${provider.name}`);
  }
  
  return provider;
}

// Generic AI client that works with any provider
export class AIClient {
  private provider: AIProvider;
  
  constructor(providerName?: string) {
    this.provider = providerName ? AI_PROVIDERS[providerName] || AI_PROVIDERS.openai : getActiveProvider();
  }
  
  async chatCompletion(messages: Array<{role: string; content: string}>, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{content: string; usage: Record<string, unknown>}> {
    const model = options?.model || this.provider.models.chat;
    const maxTokens = options?.maxTokens || this.provider.maxTokens;
    const temperature = options?.temperature || this.provider.temperature;
    
    // Format messages based on provider
    const formattedMessages = this.formatMessages(messages);
    
    // Make API call based on provider
    const response = await this.makeAPICall(model, formattedMessages, maxTokens, temperature);
    
    return this.parseResponse(response);
  }
  
  private formatMessages(messages: Array<{role: string; content: string}>): Record<string, unknown> {
    const providerName = this.provider.name.toLowerCase();
    
    if (providerName.includes('anthropic')) {
      // Claude uses different format
      return {
        model: this.provider.models.chat,
        max_tokens: this.provider.maxTokens,
        messages: messages.map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content
        }))
      };
    } else if (providerName.includes('google')) {
      // Gemini uses different format
      return {
        contents: messages.map(msg => ({
          parts: [{ text: msg.content }],
          role: msg.role === 'user' ? 'user' : 'model'
        }))
      };
    } else {
      // OpenAI, Groq, HuggingFace use similar format
      return {
        model: this.provider.models.chat,
        messages: messages,
        max_tokens: this.provider.maxTokens,
        temperature: this.provider.temperature
      };
    }
  }
  
  private async makeAPICall(model: string, payload: Record<string, unknown>, maxTokens: number, temperature: number): Promise<Record<string, unknown>> {
    const providerName = this.provider.name.toLowerCase();
    let url: string;
    let body: Record<string, unknown>;
    
    if (providerName.includes('anthropic')) {
      url = `${this.provider.baseUrl}/messages`;
      body = {
        ...payload,
        max_tokens: maxTokens,
        temperature: temperature
      };
    } else if (providerName.includes('google')) {
      url = `${this.provider.baseUrl}/models/${model}:generateContent?key=${this.provider.apiKey}`;
      body = payload;
    } else if (providerName.includes('huggingface')) {
      url = `${this.provider.baseUrl}/${model}`;
      const messages = payload.messages as Array<{role: string; content: string}>;
      body = {
        inputs: messages[messages.length - 1].content,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: temperature,
          return_full_text: false
        }
      };
    } else {
      // OpenAI, Groq
      url = `${this.provider.baseUrl}/chat/completions`;
      body = {
        ...payload,
        max_tokens: maxTokens,
        temperature: temperature
      };
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: this.provider.headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`${this.provider.name} API error: ${response.status} ${error}`);
    }
    
    return response.json();
  }
  
  private parseResponse(response: Record<string, unknown>): {content: string; usage: Record<string, unknown>} {
    const providerName = this.provider.name.toLowerCase();
    
    if (providerName.includes('anthropic')) {
      return {
        content: response.content[0].text,
        usage: response.usage
      };
    } else if (providerName.includes('google')) {
      return {
        content: response.candidates[0].content.parts[0].text,
        usage: response.usageMetadata
      };
    } else if (providerName.includes('huggingface')) {
      return {
        content: response[0].generated_text,
        usage: { total_tokens: 0 }
      };
    } else {
      // OpenAI, Groq
      return {
        content: response.choices[0].message.content,
        usage: response.usage
      };
    }
  }
}

// Export a default client instance
export const aiClient = new AIClient();
