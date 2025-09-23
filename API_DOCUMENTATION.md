# Brixem AI - API Documentation

## Overview
This document provides comprehensive API documentation for the Brixem AI construction management platform.

## Base URL
- **Production**: `https://www.brixem.com`
- **Development**: `http://localhost:3000`

## Authentication
All API endpoints require authentication via Supabase JWT tokens.

## API Endpoints

### 1. Chat API
**Endpoint**: `POST /api/chat`

**Description**: AI-powered chat interface for construction project assistance.

**Request Body**:
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Help me plan my kitchen renovation"
    }
  ],
  "projectContext": {
    "projectId": "uuid",
    "projectType": "kitchen-renovation"
  }
}
```

**Response**:
```json
{
  "message": "AI response text",
  "isCostEstimation": false,
  "costData": null
}
```

### 2. Cost Estimation API
**Endpoint**: `POST /api/cost-estimation`

**Description**: Generate detailed cost estimates for construction projects.

**Request Body**:
```json
{
  "projectType": "kitchen-renovation",
  "area": 25,
  "finishTier": "standard",
  "includeKitchen": true,
  "includeBathroom": false,
  "includeMEP": true,
  "location": "UK"
}
```

**Response**:
```json
{
  "projectType": "kitchen-renovation",
  "area": 25,
  "finishTier": "standard",
  "location": "UK",
  "currency": "GBP",
  "symbol": "£",
  "assumptions": {
    "area": "25m²",
    "finishTier": "Standard",
    "includeKitchen": true,
    "includeBathroom": false,
    "includeMEP": true,
    "lastUpdated": "2024-09-22T10:00:00.000Z"
  },
  "costs": {
    "base": {
      "total": 37500
    },
    "additional": {
      "total": 7500
    },
    "total": 45000
  },
  "itemizedBreakdown": [
    {
      "category": "Construction",
      "description": "Kitchen renovation shell work",
      "unitRate": "£1,500/m²",
      "quantity": 25,
      "subtotal": "£37,500"
    }
  ],
  "summary": {
    "costPerM2": 1800,
    "costPerM2Formatted": "£1,800/m²",
    "totalFormatted": "£45,000",
    "vatIncluded": true,
    "contingencyIncluded": true
  }
}
```

### 3. Projects API
**Endpoint**: `GET /api/projects`
**Description**: Retrieve all projects for the authenticated user.

**Endpoint**: `POST /api/projects`
**Description**: Create a new project.

**Request Body**:
```json
{
  "name": "Kitchen Renovation",
  "type": "kitchen-renovation",
  "location": "London, UK",
  "description": "Complete kitchen renovation project",
  "size_sqft": 250,
  "budget": 45000
}
```

### 4. Tasks API
**Endpoint**: `GET /api/tasks`
**Description**: Retrieve all tasks for a project.

**Endpoint**: `POST /api/tasks`
**Description**: Create a new task.

**Request Body**:
```json
{
  "project_id": "uuid",
  "title": "Install new cabinets",
  "description": "Install custom kitchen cabinets",
  "priority": "high",
  "due_date": "2024-10-15T00:00:00.000Z"
}
```

**Endpoint**: `PUT /api/tasks/[id]`
**Description**: Update an existing task.

**Endpoint**: `DELETE /api/tasks/[id]`
**Description**: Delete a task.

### 5. Milestones API
**Endpoint**: `GET /api/milestones`
**Description**: Retrieve all milestones for a project.

**Endpoint**: `POST /api/milestones`
**Description**: Create a new milestone.

**Request Body**:
```json
{
  "project_id": "uuid",
  "title": "Kitchen Demolition Complete",
  "description": "All old kitchen fixtures removed",
  "due_date": "2024-10-01T00:00:00.000Z"
}
```

### 6. Document Generation API
**Endpoint**: `POST /api/documents/generate`

**Description**: Generate project documents (SOW, estimates, schedules).

**Request Body**:
```json
{
  "projectId": "uuid",
  "documentType": "sow",
  "projectData": {
    "name": "Kitchen Renovation",
    "type": "kitchen-renovation",
    "budget": 45000
  }
}
```

**Response**:
```json
{
  "success": true,
  "documentUrl": "https://storage.url/document.pdf",
  "documentType": "sow"
}
```

### 7. Database Test API
**Endpoint**: `GET /api/test-db`

**Description**: Test database connectivity and authentication.

**Response**:
```json
{
  "success": true,
  "message": "Database connection successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

## Status Codes

- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Chat API: 100 requests per hour per user
- Cost Estimation: 50 requests per hour per user
- Other endpoints: 1000 requests per hour per user

## Webhooks

### Stripe Webhook
**Endpoint**: `POST /api/stripe/webhook`

**Description**: Handle Stripe payment events for subscription management.

## SDK Examples

### JavaScript/TypeScript
```typescript
// Initialize API client
const API_BASE = 'https://www.brixem.com';

// Chat API
const chatResponse = await fetch(`${API_BASE}/api/chat`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Help me plan my project' }]
  })
});

// Cost Estimation
const costResponse = await fetch(`${API_BASE}/api/cost-estimation`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectType: 'kitchen-renovation',
    area: 25,
    finishTier: 'standard'
  })
});
```

## Support

For API support and questions:
- Email: api-support@brixem.com
- Documentation: https://docs.brixem.com
- Status Page: https://status.brixem.com
