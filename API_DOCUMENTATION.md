# BRIXEM AI - API DOCUMENTATION

## 🚀 **OVERVIEW**

This document provides comprehensive documentation for all API endpoints, data structures, and integration patterns for the Brixem AI platform.

**Base URL:** `https://www.brixem.com/api`  
**Version:** 1.0.0  
**Authentication:** Bearer Token (Supabase JWT)  

---

## 📋 **TABLE OF CONTENTS**

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Data Models](#data-models)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [WebSocket API](#websocket-api)
7. [Analytics API](#analytics-api)
8. [Performance Monitoring](#performance-monitoring)

---

## 🔐 **AUTHENTICATION**

### **Authentication Method**
All API endpoints require authentication using Supabase JWT tokens.

```http
Authorization: Bearer <supabase_jwt_token>
```

### **Getting Authentication Token**
```javascript
// Client-side authentication
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get token
const token = data.session?.access_token;
```

---

## 🛠 **API ENDPOINTS**

### **1. Chat API**

#### **POST /api/chat**
AI-powered chat endpoint for project assistance and cost estimation.

**Request Body:**
```json
{
  "message": "Create a kitchen renovation project for a 20m² space in Dubai",
  "conversationHistory": [
    {
      "role": "user",
      "text": "Hello, I need help with my project"
    },
    {
      "role": "ai", 
      "text": "I'd be happy to help! What kind of project are you working on?"
    }
  ]
}
```

**Response:**
```json
{
  "message": "I'll help you create a kitchen renovation project for your 20m² space in Dubai. Let me gather some details...",
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 75,
    "total_tokens": 225
  },
  "isCostEstimation": false,
  "projectData": {
    "name": "Kitchen Renovation - Dubai",
    "type": "kitchen-renovation",
    "location": "Dubai",
    "area": 20,
    "phases": [...]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing message)
- `401` - Unauthorized
- `429` - Rate Limited
- `500` - Internal Server Error

---

### **2. Cost Estimation API**

#### **POST /api/cost-estimation**
Generate detailed cost estimates for construction projects.

**Request Body:**
```json
{
  "projectType": "kitchen-renovation",
  "area": 20,
  "finishTier": "standard",
  "includeKitchen": true,
  "includeBathroom": false,
  "includeMEP": true,
  "location": "UAE"
}
```

**Response:**
```json
{
  "projectType": "kitchen-renovation",
  "area": 20,
  "finishTier": "standard",
  "location": "UAE",
  "currency": "AED",
  "symbol": "د.إ",
  "assumptions": {
    "area": "20m²",
    "finishTier": "Standard",
    "includeKitchen": true,
    "includeBathroom": false,
    "includeMEP": true,
    "lastUpdated": "2024-12-19T10:30:00.000Z"
  },
  "costs": {
    "base": {
      "structure": {
        "description": "Kitchen Renovation",
        "unitRate": 1200,
        "quantity": 20,
        "unit": "m²",
        "subtotal": 24000,
        "currency": "AED",
        "symbol": "د.إ"
      }
    },
    "additional": {
      "vat": {
        "description": "VAT (5%)",
        "amount": 1200,
        "currency": "AED",
        "symbol": "د.إ"
      }
    },
    "total": 25200
  },
  "summary": {
    "costPerM2": 1260,
    "costPerM2Formatted": "د.إ1,260/m²",
    "totalFormatted": "د.إ25,200",
    "vatIncluded": true,
    "contingencyIncluded": true
  }
}
```

---

### **3. Projects API**

#### **GET /api/projects**
Retrieve all projects for the authenticated user.

**Response:**
```json
[
  {
    "id": "proj_123",
    "name": "Kitchen Renovation",
    "location": "Dubai",
    "description": "Modern kitchen renovation",
    "size_sqft": 215,
    "type": "kitchen-renovation",
    "status": "in-progress",
    "created_at": "2024-12-19T10:00:00.000Z",
    "updated_at": "2024-12-19T10:30:00.000Z",
    "progress": 45,
    "ai_data": {
      "area": "20m²",
      "finishLevel": "standard",
      "phases": [...]
    }
  }
]
```

#### **POST /api/projects**
Create a new project.

**Request Body:**
```json
{
  "name": "Kitchen Renovation",
  "type": "kitchen-renovation",
  "location": "Dubai",
  "description": "Modern kitchen renovation project",
  "size_sqft": 215,
  "ai_data": {
    "area": "20m²",
    "finishLevel": "standard",
    "phases": [...]
  }
}
```

**Response:**
```json
{
  "id": "proj_123",
  "name": "Kitchen Renovation",
  "location": "Dubai",
  "description": "Modern kitchen renovation project",
  "size_sqft": 215,
  "type": "kitchen-renovation",
  "status": "in-progress",
  "created_at": "2024-12-19T10:00:00.000Z",
  "updated_at": "2024-12-19T10:00:00.000Z",
  "progress": 0,
  "ai_data": {
    "area": "20m²",
    "finishLevel": "standard",
    "phases": [...]
  }
}
```

---

### **4. Tasks API**

#### **GET /api/tasks**
Retrieve all tasks for a project.

**Query Parameters:**
- `projectId` (required) - Project ID

**Response:**
```json
[
  {
    "id": "task_123",
    "project_id": "proj_123",
    "title": "Design Planning",
    "description": "Create detailed kitchen design plans",
    "status": "in-progress",
    "priority": "high",
    "due_date": "2024-12-25T00:00:00.000Z",
    "created_at": "2024-12-19T10:00:00.000Z",
    "updated_at": "2024-12-19T10:30:00.000Z",
    "subtasks": [
      {
        "id": "subtask_123",
        "title": "Measure space dimensions",
        "status": "completed",
        "due_date": "2024-12-20T00:00:00.000Z"
      }
    ]
  }
]
```

#### **POST /api/tasks**
Create a new task.

**Request Body:**
```json
{
  "project_id": "proj_123",
  "title": "Design Planning",
  "description": "Create detailed kitchen design plans",
  "priority": "high",
  "due_date": "2024-12-25T00:00:00.000Z",
  "subtasks": [
    {
      "title": "Measure space dimensions",
      "due_date": "2024-12-20T00:00:00.000Z"
    }
  ]
}
```

---

### **5. Milestones API**

#### **GET /api/milestones**
Retrieve all milestones for a project.

**Query Parameters:**
- `projectId` (required) - Project ID

**Response:**
```json
[
  {
    "id": "milestone_123",
    "project_id": "proj_123",
    "title": "Design Phase Complete",
    "description": "All design work completed and approved",
    "status": "pending",
    "due_date": "2024-12-25T00:00:00.000Z",
    "created_at": "2024-12-19T10:00:00.000Z",
    "updated_at": "2024-12-19T10:00:00.000Z"
  }
]
```

---

### **6. File Upload API**

#### **POST /api/upload**
Upload files (documents, images) to a project.

**Request Body:** `multipart/form-data`
- `file` (required) - File to upload
- `projectId` (required) - Project ID
- `type` (optional) - File type (document, image, etc.)

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_123",
    "name": "kitchen_design.pdf",
    "type": "document",
    "size": 1024000,
    "url": "https://storage.supabase.co/object/public/files/file_123",
    "project_id": "proj_123",
    "uploaded_at": "2024-12-19T10:00:00.000Z"
  }
}
```

---

### **7. Document Generation API**

#### **POST /api/documents/generate**
Generate project documents (scope of work, contracts, etc.).

**Request Body:**
```json
{
  "projectId": "proj_123",
  "documentType": "scope_of_work",
  "template": "kitchen_renovation",
  "customizations": {
    "includeCostBreakdown": true,
    "includeTimeline": true,
    "includeMaterials": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "document": {
    "id": "doc_123",
    "name": "Scope of Work - Kitchen Renovation",
    "type": "scope_of_work",
    "url": "https://storage.supabase.co/object/public/documents/doc_123.pdf",
    "generated_at": "2024-12-19T10:00:00.000Z"
  }
}
```

---

## 📊 **DATA MODELS**

### **Project Model**
```typescript
interface Project {
  id: string;
  name: string;
  location: string;
  description?: string;
  size_sqft?: number;
  type: 'kitchen-renovation' | 'bathroom-renovation' | 'extension' | 'new-build' | 'refurbishment';
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  progress: number; // 0-100
  ai_data?: {
    area?: string;
    finishLevel?: string;
    phases?: Phase[];
  };
}
```

### **Task Model**
```typescript
interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  created_at: string;
  updated_at: string;
  subtasks?: SubTask[];
  assigned_to?: string;
  estimated_hours?: number;
  actual_hours?: number;
}
```

### **Phase Model**
```typescript
interface Phase {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed';
  order: number;
  tasks: Task[];
  estimated_duration?: string;
  start_date?: string;
  end_date?: string;
}
```

---

## ⚠️ **ERROR HANDLING**

### **Error Response Format**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details",
  "timestamp": "2024-12-19T10:00:00.000Z"
}
```

### **Common Error Codes**
- `AUTHENTICATION_REQUIRED` - 401
- `INVALID_TOKEN` - 401
- `INSUFFICIENT_PERMISSIONS` - 403
- `RESOURCE_NOT_FOUND` - 404
- `VALIDATION_ERROR` - 400
- `RATE_LIMIT_EXCEEDED` - 429
- `INTERNAL_SERVER_ERROR` - 500
- `SERVICE_UNAVAILABLE` - 503

---

## 🚦 **RATE LIMITING**

### **Rate Limits**
- **Chat API:** 100 requests per hour per user
- **Cost Estimation:** 50 requests per hour per user
- **File Upload:** 20 requests per hour per user
- **General API:** 1000 requests per hour per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 🔌 **WEBSOCKET API**

### **Connection**
```javascript
const ws = new WebSocket('wss://www.brixem.com/ws?userId=user_123');
```

### **Message Types**

#### **Project Updates**
```json
{
  "type": "project_update",
  "data": {
    "projectId": "proj_123",
    "action": "created|updated|deleted",
    "project": { /* Project object */ }
  },
  "timestamp": "2024-12-19T10:00:00.000Z",
  "userId": "user_123"
}
```

#### **Task Updates**
```json
{
  "type": "task_update",
  "data": {
    "taskId": "task_123",
    "action": "created|updated|completed|deleted",
    "task": { /* Task object */ }
  },
  "timestamp": "2024-12-19T10:00:00.000Z",
  "userId": "user_123"
}
```

#### **Chat Messages**
```json
{
  "type": "chat_message",
  "data": {
    "role": "user|ai",
    "text": "Message content",
    "projectId": "proj_123"
  },
  "timestamp": "2024-12-19T10:00:00.000Z",
  "userId": "user_123"
}
```

---

## 📈 **ANALYTICS API**

### **Event Tracking**
```javascript
// Track page views
analytics.trackPageView('/dashboard', 'Dashboard');

// Track user actions
analytics.trackAction('project_created', 'engagement', 'chat');

// Track business events
analytics.trackBusinessEvent('PROJECT_CREATED', {
  projectId: 'proj_123',
  projectType: 'kitchen-renovation',
  estimatedValue: 25000
});

// Track feature usage
analytics.trackFeatureUsage('ai_chat', 'message_sent');
```

### **Performance Metrics**
```javascript
// Track performance metrics
analytics.trackPerformance('page_load', 1250, 'ms');
analytics.trackPerformance('api_response', 500, 'ms');
```

---

## 🔍 **PERFORMANCE MONITORING**

### **Core Web Vitals**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### **Performance Metrics**
```javascript
import { performanceMonitor } from '@/lib/performance';

// Get current metrics
const metrics = performanceMonitor.getMetrics();
console.log(metrics);
// {
//   lcp: 1200,
//   fid: 50,
//   cls: 0.05,
//   page_load: 1500
// }
```

---

## 🧪 **TESTING**

### **Test Endpoints**
- `GET /api/test-db` - Database connectivity test
- `GET /api/test-env` - Environment variables test

### **Example Test Request**
```bash
curl -X GET "https://www.brixem.com/api/test-db" \
  -H "Authorization: Bearer <token>"
```

---

## 📚 **SDK EXAMPLES**

### **JavaScript/TypeScript**
```typescript
import { BrixemAPI } from '@brixem/api-client';

const api = new BrixemAPI({
  baseURL: 'https://www.brixem.com/api',
  token: 'your-supabase-jwt-token'
});

// Create project
const project = await api.projects.create({
  name: 'Kitchen Renovation',
  type: 'kitchen-renovation',
  location: 'Dubai'
});

// Send chat message
const response = await api.chat.send({
  message: 'Help me plan my kitchen renovation',
  conversationHistory: []
});
```

### **Python**
```python
import requests

class BrixemAPI:
    def __init__(self, token):
        self.base_url = "https://www.brixem.com/api"
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
    
    def create_project(self, data):
        response = requests.post(
            f"{self.base_url}/projects",
            json=data,
            headers=self.headers
        )
        return response.json()

# Usage
api = BrixemAPI("your-supabase-jwt-token")
project = api.create_project({
    "name": "Kitchen Renovation",
    "type": "kitchen-renovation",
    "location": "Dubai"
})
```

---

## 🔒 **SECURITY**

### **Authentication**
- JWT tokens with 1-hour expiration
- Automatic token refresh
- Secure HTTP-only cookies

### **Data Protection**
- All data encrypted in transit (HTTPS)
- Sensitive data encrypted at rest
- GDPR compliant data handling

### **Rate Limiting**
- Per-user rate limits
- IP-based rate limiting
- DDoS protection

---

## 📞 **SUPPORT**

### **API Support**
- **Email:** api-support@brixem.com
- **Documentation:** https://docs.brixem.com
- **Status Page:** https://status.brixem.com

### **Error Reporting**
- All errors automatically reported to Sentry
- Real-time error monitoring
- Performance issue tracking

---

**Last Updated:** December 2024  
**API Version:** 1.0.0  
**Documentation Version:** 1.0.0