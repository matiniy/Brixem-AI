'use client';

import { useState } from 'react';

interface DevLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: { email: string; name: string; role: string }) => void;
}

export default function DevLoginModal({ isOpen, onClose }: DevLoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const testUsers = [
    {
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
      role: 'homeowner'
    },
    {
      email: 'jane@example.com',
      password: 'password123', 
      name: 'Jane Smith',
      role: 'contractor'
    },
    {
      email: 'demo@brixem.com',
      password: 'demo123',
      name: 'Demo User',
      role: 'homeowner'
    }
  ];

  const handleLogin = async (user: typeof testUsers[0]) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dev-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store development session in localStorage
        localStorage.setItem('dev-session', JSON.stringify(data.mockSession));
        localStorage.setItem('dev-user', JSON.stringify(data.user));
        
        // Close the modal and redirect to dashboard
        onClose();
        
        // Redirect based on user role
        if (user.role === 'contractor') {
          window.location.href = '/dashboard/contractor';
        } else {
          window.location.href = '/dashboard/homeowner';
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🚀 Development Login
          </h2>
          <p className="text-gray-600">
            Choose a test user to login instantly
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {testUsers.map((user) => (
            <button
              key={user.email}
              onClick={() => handleLogin(user)}
              disabled={isLoading}
              className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-blue-600 capitalize">{user.role}</div>
                </div>
                <div className="text-gray-400">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This is a development-only feature. These test users are for local development only.
          </p>
        </div>
      </div>
    </div>
  );
}
