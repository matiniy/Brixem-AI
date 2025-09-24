// Analytics and tracking utilities
import { performanceMonitor } from './performance';

// Event tracking interface
interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

// User properties interface
interface UserProperties {
  user_id?: string;
  user_type?: 'homeowner' | 'contractor';
  subscription_tier?: string;
  project_count?: number;
  created_at?: string;
}

class AnalyticsManager {
  private static instance: AnalyticsManager;
  private isInitialized = false;
  private userId: string | null = null;
  private userProperties: UserProperties = {};

  private constructor() {
    this.initialize();
  }

  public static getInstance(): AnalyticsManager {
    if (!AnalyticsManager.instance) {
      AnalyticsManager.instance = new AnalyticsManager();
    }
    return AnalyticsManager.instance;
  }

  private initialize() {
    if (typeof window === 'undefined') return;

    // Initialize Google Analytics if available
    if (typeof window !== 'undefined' && (window as unknown as { gtag: unknown }).gtag) {
      this.isInitialized = true;
      console.log('Analytics initialized');
    }

    // Initialize performance monitoring
    performanceMonitor.measurePageLoad();
  }

  // Track page views
  public trackPageView(page: string, title?: string) {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: 'page_view',
      category: 'navigation',
      label: page,
      custom_parameters: {
        page_title: title || document.title,
        page_url: window.location.href,
        timestamp: new Date().toISOString()
      }
    };

    this.trackEvent(event);
  }

  // Track user actions
  public trackAction(action: string, category: string, label?: string, value?: number) {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action,
      category,
      label,
      value,
      custom_parameters: {
        timestamp: new Date().toISOString(),
        user_id: this.userId
      }
    };

    this.trackEvent(event);
  }

  // Track business events
  public trackBusinessEvent(eventName: string, parameters: Record<string, unknown> = {}) {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: eventName,
      category: 'business',
      custom_parameters: {
        ...parameters,
        timestamp: new Date().toISOString(),
        user_id: this.userId
      }
    };

    this.trackEvent(event);
  }

  // Track performance metrics
  public trackPerformance(metricName: string, value: number, unit: string = 'ms') {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: 'performance_metric',
      category: 'performance',
      label: metricName,
      value: Math.round(value),
      custom_parameters: {
        unit,
        timestamp: new Date().toISOString()
      }
    };

    this.trackEvent(event);
  }

  // Track errors
  public trackError(error: Error, context?: string) {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: 'error',
      category: 'error',
      label: error.name,
      custom_parameters: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        user_id: this.userId
      }
    };

    this.trackEvent(event);
  }

  // Set user properties
  public setUserProperties(properties: UserProperties) {
    this.userProperties = { ...this.userProperties, ...properties };
    this.userId = properties.user_id || null;

    if (this.isInitialized && typeof window !== 'undefined' && (window as unknown as { gtag: unknown }).gtag) {
      (window as unknown as { gtag: (command: string, targetId: string, config: Record<string, unknown>) => void }).gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: this.userId,
        custom_map: {
          user_type: 'user_type',
          subscription_tier: 'subscription_tier',
          project_count: 'project_count'
        }
      });
    }
  }

  // Track conversion events
  public trackConversion(conversionType: string, value?: number, currency: string = 'USD') {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: 'conversion',
      category: 'business',
      label: conversionType,
      value,
      custom_parameters: {
        currency,
        timestamp: new Date().toISOString(),
        user_id: this.userId
      }
    };

    this.trackEvent(event);
  }

  // Track feature usage
  public trackFeatureUsage(feature: string, action: string = 'used') {
    if (!this.isInitialized) return;

    const event: AnalyticsEvent = {
      action: 'feature_usage',
      category: 'engagement',
      label: feature,
      custom_parameters: {
        feature_action: action,
        timestamp: new Date().toISOString(),
        user_id: this.userId
      }
    };

    this.trackEvent(event);
  }

  // Private method to send events
  private trackEvent(event: AnalyticsEvent) {
    if (typeof window !== 'undefined' && (window as unknown as { gtag: unknown }).gtag) {
      (window as unknown as { gtag: (command: string, action: string, parameters: Record<string, unknown>) => void }).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters
      });
    }

    // Also send to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', event);
    }
  }

  // Get analytics data
  public getAnalyticsData() {
    return {
      isInitialized: this.isInitialized,
      userId: this.userId,
      userProperties: this.userProperties,
      performanceMetrics: performanceMonitor.getMetrics()
    };
  }
}

// Export singleton instance
export const analytics = AnalyticsManager.getInstance();

// Convenience functions
export const trackPageView = (page: string, title?: string) => analytics.trackPageView(page, title);
export const trackAction = (action: string, category: string, label?: string, value?: number) => 
  analytics.trackAction(action, category, label, value);
export const trackBusinessEvent = (eventName: string, parameters?: Record<string, unknown>) => 
  analytics.trackBusinessEvent(eventName, parameters);
export const trackError = (error: Error, context?: string) => analytics.trackError(error, context);
export const trackConversion = (conversionType: string, value?: number, currency?: string) => 
  analytics.trackConversion(conversionType, value, currency);
export const trackFeatureUsage = (feature: string, action?: string) => 
  analytics.trackFeatureUsage(feature, action);
export const setUserProperties = (properties: UserProperties) => 
  analytics.setUserProperties(properties);

// Business event constants
export const BUSINESS_EVENTS = {
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  PROJECT_CREATED: 'project_created',
  PROJECT_COMPLETED: 'project_completed',
  COST_ESTIMATION_REQUESTED: 'cost_estimation_requested',
  COST_ESTIMATION_COMPLETED: 'cost_estimation_completed',
  AI_CHAT_STARTED: 'ai_chat_started',
  AI_CHAT_COMPLETED: 'ai_chat_completed',
  FILE_UPLOADED: 'file_uploaded',
  TASK_COMPLETED: 'task_completed',
  MILESTONE_REACHED: 'milestone_reached',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed'
} as const;

// Feature usage constants
export const FEATURES = {
  AI_CHAT: 'ai_chat',
  COST_ESTIMATION: 'cost_estimation',
  PROJECT_MANAGEMENT: 'project_management',
  FILE_UPLOAD: 'file_upload',
  TASK_MANAGEMENT: 'task_management',
  MOBILE_APP: 'mobile_app',
  DASHBOARD: 'dashboard',
  ONBOARDING: 'onboarding'
} as const;
