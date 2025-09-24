// WebSocket implementation for real-time project updates
import React from 'react';
import { analytics } from './analytics';

export interface WebSocketMessage {
  type: 'project_update' | 'task_update' | 'milestone_update' | 'chat_message' | 'user_activity' | 'error' | 'heartbeat';
  data: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  projectId?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: Record<string, unknown>) => void>> = new Map();
  private isConnected = false;
  private userId: string | null = null;

  private constructor() {
    this.config = {
      url: process.env.NEXT_PUBLIC_WS_URL || 'wss://brixem-ai.vercel.app/ws',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    };
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.userId = userId;
      const wsUrl = `${this.config.url}?userId=${userId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          analytics.trackAction('websocket_connected', 'system');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
            analytics.trackError(error as Error, 'websocket_message_parse');
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          this.stopHeartbeat();
          analytics.trackAction('websocket_disconnected', 'system');
          
          if (!event.wasClean && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          analytics.trackError(new Error('WebSocket connection error'), 'websocket_connection');
          reject(error);
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        analytics.trackError(error as Error, 'websocket_creation');
        reject(error);
      }
    });
  }

  public disconnect(): void {
    this.stopHeartbeat();
    this.clearReconnectTimer();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
    
    this.isConnected = false;
    analytics.trackAction('websocket_disconnected', 'system');
  }

  public send(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
      userId: this.userId || undefined
    };

    try {
      this.ws.send(JSON.stringify(fullMessage));
      analytics.trackAction('websocket_message_sent', 'system', message.type);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      analytics.trackError(error as Error, 'websocket_send');
    }
  }

  public subscribe(eventType: string, callback: (data: Record<string, unknown>) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return 'connected';
    } else if (this.ws?.readyState === WebSocket.CONNECTING) {
      return 'connecting';
    } else {
      return 'disconnected';
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Notify all listeners for this message type
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message.data);
        } catch (error) {
          console.error('Error in WebSocket message handler:', error);
          analytics.trackError(error as Error, 'websocket_message_handler');
        }
      });
    }

    // Handle specific message types
    switch (message.type) {
      case 'project_update':
        this.handleProjectUpdate(message.data);
        break;
      case 'task_update':
        this.handleTaskUpdate(message.data);
        break;
      case 'milestone_update':
        this.handleMilestoneUpdate(message.data);
        break;
      case 'chat_message':
        this.handleChatMessage(message.data);
        break;
      case 'user_activity':
        this.handleUserActivity(message.data);
        break;
      case 'error':
        this.handleError(message.data);
        break;
    }
  }

  private handleProjectUpdate(data: Record<string, unknown>): void {
    analytics.trackAction('project_updated_realtime', 'engagement');
    // Emit custom event for project updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('projectUpdate', { detail: data }));
    }
  }

  private handleTaskUpdate(data: Record<string, unknown>): void {
    analytics.trackAction('task_updated_realtime', 'engagement');
    // Emit custom event for task updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('taskUpdate', { detail: data }));
    }
  }

  private handleMilestoneUpdate(data: Record<string, unknown>): void {
    analytics.trackAction('milestone_updated_realtime', 'engagement');
    // Emit custom event for milestone updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('milestoneUpdate', { detail: data }));
    }
  }

  private handleChatMessage(data: Record<string, unknown>): void {
    analytics.trackAction('chat_message_realtime', 'engagement');
    // Emit custom event for chat messages
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('chatMessage', { detail: data }));
    }
  }

  private handleUserActivity(data: Record<string, unknown>): void {
    analytics.trackAction('user_activity_realtime', 'engagement');
    // Emit custom event for user activity
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userActivity', { detail: data }));
    }
  }

  private handleError(data: Record<string, unknown>): void {
    console.error('WebSocket server error:', data);
    analytics.trackError(new Error(String(data.message) || 'WebSocket server error'), 'websocket_server');
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);
      
      if (this.userId) {
        this.connect(this.userId).catch(error => {
          console.error('Reconnection failed:', error);
          if (this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        });
      }
    }, this.config.reconnectInterval);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          data: { timestamp: new Date().toISOString() }
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

// Export singleton instance
export const websocketManager = WebSocketManager.getInstance();

// React hook for WebSocket
export const useWebSocket = (userId: string | null) => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  React.useEffect(() => {
    if (!userId) return;

    const connect = async () => {
      try {
        await websocketManager.connect(userId);
        setIsConnected(true);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    };

    connect();

    // Check connection status periodically
    const statusInterval = setInterval(() => {
      const status = websocketManager.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status === 'connected');
    }, 1000);

    return () => {
      clearInterval(statusInterval);
      websocketManager.disconnect();
    };
  }, [userId]);

  return {
    isConnected,
    connectionStatus,
    send: websocketManager.send.bind(websocketManager),
    subscribe: websocketManager.subscribe.bind(websocketManager)
  };
};

// Utility functions for real-time updates
export const realtimeUpdates = {
  // Send project update
  sendProjectUpdate: (projectId: string, update: Record<string, unknown>) => {
    websocketManager.send({
      type: 'project_update',
      data: { projectId, ...update }
    });
  },

  // Send task update
  sendTaskUpdate: (taskId: string, update: Record<string, unknown>) => {
    websocketManager.send({
      type: 'task_update',
      data: { taskId, ...update }
    });
  },

  // Send milestone update
  sendMilestoneUpdate: (milestoneId: string, update: Record<string, unknown>) => {
    websocketManager.send({
      type: 'milestone_update',
      data: { milestoneId, ...update }
    });
  },

  // Send chat message
  sendChatMessage: (message: Record<string, unknown>) => {
    websocketManager.send({
      type: 'chat_message',
      data: message
    });
  },

  // Send user activity
  sendUserActivity: (activity: Record<string, unknown>) => {
    websocketManager.send({
      type: 'user_activity',
      data: activity
    });
  }
};

// Event listeners for real-time updates
export const setupRealtimeListeners = () => {
  if (typeof window === 'undefined') return;

  // Listen for project updates
  window.addEventListener('projectUpdate', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Project updated:', customEvent.detail);
    // Trigger UI updates here
  });

  // Listen for task updates
  window.addEventListener('taskUpdate', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Task updated:', customEvent.detail);
    // Trigger UI updates here
  });

  // Listen for milestone updates
  window.addEventListener('milestoneUpdate', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Milestone updated:', customEvent.detail);
    // Trigger UI updates here
  });

  // Listen for chat messages
  window.addEventListener('chatMessage', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Chat message received:', customEvent.detail);
    // Trigger UI updates here
  });

  // Listen for user activity
  window.addEventListener('userActivity', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('User activity:', customEvent.detail);
    // Trigger UI updates here
  });
};
