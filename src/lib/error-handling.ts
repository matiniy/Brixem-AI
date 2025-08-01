export interface ErrorInfo {
  message: string;
  code?: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId?: string;
}

export class AppError extends Error {
  public code: string;
  public timestamp: string;
  public userId?: string;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', userId?: string) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.timestamp = new Date().toISOString();
    this.userId = userId;
  }
}

export const errorCodes = {
  AUTHENTICATION_FAILED: 'AUTH_001',
  INVALID_INPUT: 'INPUT_001',
  DATABASE_ERROR: 'DB_001',
  API_ERROR: 'API_001',
  NETWORK_ERROR: 'NET_001',
  QUOTA_EXCEEDED: 'QUOTA_001',
  PERMISSION_DENIED: 'PERM_001',
} as const;

export function logError(error: Error | AppError, context?: Record<string, unknown>) {
  const errorInfo: ErrorInfo = {
    message: error.message,
    code: error instanceof AppError ? error.code : 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userId: error instanceof AppError ? error.userId : undefined,
    ...context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Application Error:', errorInfo);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry.captureException(error, { extra: errorInfo });
  
  return errorInfo;
}

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Handle OpenAI API errors
  if (error?.code === 'insufficient_quota') {
    return new AppError(
      'AI service quota exceeded. Please try again later or upgrade your plan.',
      errorCodes.QUOTA_EXCEEDED
    );
  }

  // Handle network errors
  if (error?.message?.includes('fetch')) {
    return new AppError(
      'Network connection error. Please check your internet connection.',
      errorCodes.NETWORK_ERROR
    );
  }

  // Handle authentication errors
  if (error?.status === 401) {
    return new AppError(
      'Authentication failed. Please log in again.',
      errorCodes.AUTHENTICATION_FAILED
    );
  }

  // Default error
  return new AppError(
    error?.message || 'An unexpected error occurred. Please try again.',
    errorCodes.API_ERROR
  );
}

export function showErrorToast(error: AppError) {
  // You can integrate this with your toast library
  // For now, we'll use a simple alert in development
  if (process.env.NODE_ENV === 'development') {
    alert(`Error: ${error.message}`);
  }
  
  // In production, use your preferred toast library
  // Example: toast.error(error.message);
} 