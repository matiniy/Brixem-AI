// Development authentication utilities
// This file provides mock authentication for development purposes

export interface DevUser {
  email: string;
  name: string;
  role: 'homeowner' | 'contractor';
}

export interface DevSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      full_name: string;
      role: string;
    };
  };
  access_token: string;
  refresh_token: string;
}

export function getDevUser(): DevUser | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const devUser = localStorage.getItem('dev-user');
    return devUser ? JSON.parse(devUser) : null;
  } catch {
    return null;
  }
}

export function getDevSession(): DevSession | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const devSession = localStorage.getItem('dev-session');
    return devSession ? JSON.parse(devSession) : null;
  } catch {
    return null;
  }
}

export function isDevAuthenticated(): boolean {
  return getDevUser() !== null && getDevSession() !== null;
}

export function clearDevAuth(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('dev-user');
  localStorage.removeItem('dev-session');
}

export function getDevUserRole(): 'homeowner' | 'contractor' | null {
  const user = getDevUser();
  return user?.role || null;
}
