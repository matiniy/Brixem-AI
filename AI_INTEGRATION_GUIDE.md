# 🤖 Brixem AI Integration Guide

## 💰 **OpenAI GPT Cost Breakdown**

### **Detailed Cost Analysis Table**

| **Feature** | **Model** | **Input Tokens** | **Output Tokens** | **Cost/Request** | **Monthly (1000 users)** | **Optimization** |
|-------------|-----------|------------------|-------------------|------------------|-------------------------|------------------|
| **Chat Messages** | GPT-4o-mini | ~200 | ~150 | $0.00015 | $37.50 | Cache responses |
| **Plan of Works** | GPT-4o-mini | ~500 | ~800 | $0.00065 | $162.50 | Template system |
| **Task Creation** | GPT-4o-mini | ~300 | ~200 | $0.00025 | $62.50 | Structured prompts |
| **Project Analysis** | GPT-4o-mini | ~400 | ~300 | $0.00035 | $87.50 | Batch processing |
| **Document Generation** | GPT-4o-mini | ~600 | ~1000 | $0.00080 | $200.00 | Pre-built templates |
| **Daily Summary** | GPT-4o-mini | ~800 | ~400 | $0.00060 | $150.00 | Scheduled jobs |

**Total Monthly Cost: ~$700 for 1000 active users**

### **Cost Optimization Strategies**

| **Strategy** | **Savings** | **Implementation** |
|--------------|-------------|-------------------|
| **Response Caching** | 60% | Cache frequent responses for 1 hour |
| **Template System** | 40% | Pre-built templates for common requests |
| **Token Limits** | 30% | Set max_tokens to 500-1000 |
| **Batch Processing** | 50% | Group similar requests |
| **Model Selection** | 90% | Use GPT-4o-mini instead of GPT-4 |
| **Smart Prompts** | 25% | Optimize prompt engineering |

## 🏗️ **Build Process**

### **Step 1: Environment Setup**

```bash
# Install dependencies
npm install openai

# Create environment variables
echo "OPENAI_API_KEY=your_api_key_here" >> .env.local
echo "OPENAI_MODEL=gpt-4o-mini" >> .env.local
echo "OPENAI_MAX_TOKENS=1000" >> .env.local
echo "OPENAI_TEMPERATURE=0.7" >> .env.local
```

### **Step 2: Core AI Library (`src/lib/ai.ts`)**

```typescript
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

export async function sendChatMessage(
  message: string,
  context?: string
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('AI Error:', error);
    return 'I apologize, but I encountered an error. Please try again.';
  }
}
```

### **Step 3: API Route (`src/app/api/chat/route.ts`)**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    const systemPrompt = `You are Brixem AI, a construction project management assistant. 
    Help users with project planning, task creation, and construction advice.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1000'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    });

    return NextResponse.json({
      message: completion.choices[0]?.message?.content,
      usage: completion.usage
    });

  } catch (error) {
    console.error('OpenAI Error:', error);
    return NextResponse.json(
      { error: 'AI service unavailable' },
      { status: 500 }
    );
  }
}
```

### **Step 4: Frontend Integration**

```typescript
// In your component
const [messages, setMessages] = useState<Message[]>([]);
const [isLoading, setIsLoading] = useState(false);

const handleSend = async (message: string) => {
  setIsLoading(true);
  
  try {
    const response = await sendChatMessage(message);
    setMessages(prev => [...prev, 
      { role: 'user', text: message },
      { role: 'ai', text: response }
    ]);
  } catch (error) {
    console.error('Chat error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

## 🔧 **Advanced Features**

### **1. Response Caching**

```typescript
// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

function getCachedResponse(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedResponse(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}
```

### **2. Template System**

```typescript
const TEMPLATES = {
  planOfWorks: (data: ProjectData) => `
    Generate a Plan of Works for:
    Project: ${data.projectType}
    Location: ${data.location}
    Budget: ${data.budget}
    Timeline: ${data.timeline}
    
    Include: Scope, Timeline, Budget, Permits, Risks, Next Steps
  `,
  
  taskCreation: (description: string) => `
    Create a task with description: ${description}
    Include: Title, Priority, Estimated Hours, Dependencies
  `
};
```

### **3. Error Handling**

```typescript
class AIError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'AIError';
  }
}

function handleAIError(error: any) {
  if (error.message.includes('quota')) {
    return 'AI service is temporarily unavailable due to high usage.';
  }
  if (error.message.includes('API key')) {
    return 'AI service configuration error.';
  }
  return 'I apologize, but I encountered an error. Please try again.';
}
```

## 📊 **Usage Monitoring**

### **Token Usage Tracking**

```typescript
interface UsageStats {
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  requests: number;
  cost: number;
}

const usageStats: UsageStats = {
  totalTokens: 0,
  promptTokens: 0,
  completionTokens: 0,
  requests: 0,
  cost: 0
};

function updateUsageStats(usage: any) {
  usageStats.totalTokens += usage.total_tokens;
  usageStats.promptTokens += usage.prompt_tokens;
  usageStats.completionTokens += usage.completion_tokens;
  usageStats.requests += 1;
  
  // Calculate cost (GPT-4o-mini: $0.00015 per 1K tokens)
  const cost = (usage.total_tokens / 1000) * 0.00015;
  usageStats.cost += cost;
}
```

## 🚀 **Deployment Checklist**

### **Environment Variables**
```bash
# Required
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Optional
OPENAI_ORGANIZATION=org-...
CACHE_DURATION=3600000
ENABLE_USAGE_TRACKING=true
```

### **Vercel Configuration**
```json
{
  "env": {
    "OPENAI_API_KEY": "@openai_api_key",
    "OPENAI_MODEL": "gpt-4o-mini",
    "OPENAI_MAX_TOKENS": "1000",
    "OPENAI_TEMPERATURE": "0.7"
  }
}
```

## 🔒 **Security Considerations**

1. **API Key Protection**: Never expose in client-side code
2. **Rate Limiting**: Implement request throttling
3. **Input Validation**: Sanitize all user inputs
4. **Error Handling**: Don't expose internal errors
5. **Usage Monitoring**: Track costs and usage patterns

## 📈 **Performance Optimization**

1. **Response Caching**: Cache frequent responses
2. **Batch Processing**: Group similar requests
3. **Token Limits**: Set appropriate max_tokens
4. **Model Selection**: Use cost-effective models
5. **Prompt Engineering**: Optimize for efficiency

## 🎯 **Next Steps**

1. **Implement caching** for cost reduction
2. **Add usage monitoring** for budget control
3. **Create template system** for common requests
4. **Set up rate limiting** for abuse prevention
5. **Add analytics** for usage insights

---

**Total Implementation Time: ~4-6 hours**
**Monthly Cost: ~$700 for 1000 users**
**ROI: Significant user engagement and feature differentiation** 