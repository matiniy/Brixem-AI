import { AppError, errorCodes } from './error-handling';

// Validation schemas
export interface UserData {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  role: 'homeowner' | 'contractor';
  phone?: string;
}

export interface ProjectData {
  id?: string;
  name: string;
  type: string;
  location: string;
  description: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  userId: string;
}

export interface TaskData {
  id?: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedUsers: string[];
  dueDate?: string;
  projectId: string;
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Phone number validation
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Date validation
export function validateDate(date: string): boolean {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

// Budget validation
export function validateBudget(budget: number): boolean {
  return budget > 0 && budget <= 10000000; // Max $10M
}

// User data validation
export function validateUserData(data: Partial<UserData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.email || !validateEmail(data.email)) {
    errors.push('Valid email is required');
  }
  
  if (!data.firstName || data.firstName.trim().length < 2) {
    errors.push('First name must be at least 2 characters');
  }
  
  if (!data.lastName || data.lastName.trim().length < 2) {
    errors.push('Last name must be at least 2 characters');
  }
  
  if (!data.role || !['homeowner', 'contractor'].includes(data.role)) {
    errors.push('Valid role is required');
  }
  
  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Project data validation
export function validateProjectData(data: Partial<ProjectData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length < 3) {
    errors.push('Project name must be at least 3 characters');
  }
  
  if (!data.type || data.type.trim().length < 2) {
    errors.push('Project type is required');
  }
  
  if (!data.location || data.location.trim().length < 2) {
    errors.push('Project location is required');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Project description must be at least 10 characters');
  }
  
  if (!data.startDate || !validateDate(data.startDate)) {
    errors.push('Valid start date is required');
  }
  
  if (data.endDate && !validateDate(data.endDate)) {
    errors.push('Valid end date is required');
  }
  
  if (data.budget && !validateBudget(data.budget)) {
    errors.push('Budget must be between $1 and $10,000,000');
  }
  
  if (!data.status || !['planning', 'in-progress', 'completed', 'on-hold'].includes(data.status)) {
    errors.push('Valid status is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Task data validation
export function validateTaskData(data: Partial<TaskData>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Task title must be at least 3 characters');
  }
  
  if (!data.description || data.description.trim().length < 5) {
    errors.push('Task description must be at least 5 characters');
  }
  
  if (!data.status || !['todo', 'in-progress', 'completed'].includes(data.status)) {
    errors.push('Valid status is required');
  }
  
  if (!data.priority || !['low', 'medium', 'high'].includes(data.priority)) {
    errors.push('Valid priority is required');
  }
  
  if (!Array.isArray(data.assignedUsers)) {
    errors.push('Assigned users must be an array');
  }
  
  if (data.dueDate && !validateDate(data.dueDate)) {
    errors.push('Valid due date is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Sanitize input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

// Validate and sanitize user input
export function validateAndSanitizeInput(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    throw new AppError('Input is required and must be a string', errorCodes.INVALID_INPUT);
  }
  
  const sanitized = sanitizeInput(input);
  
  if (sanitized.length === 0) {
    throw new AppError('Input cannot be empty after sanitization', errorCodes.INVALID_INPUT);
  }
  
  if (sanitized.length > maxLength) {
    throw new AppError(`Input exceeds maximum length of ${maxLength} characters`, errorCodes.INVALID_INPUT);
  }
  
  return sanitized;
} 