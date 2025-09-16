"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function TestAuthFlowPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    async function testAuthFlow() {
      try {
        // Test 1: Check current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        setTestResults(prev => ({
          ...prev,
          sessionCheck: {
            success: !sessionError,
            error: sessionError?.message,
            hasSession: !!session,
            user: session?.user?.email
          }
        }));

        if (session) {
          setUser(session.user);
        }

        // Test 2: Check user profile
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setTestResults(prev => ({
            ...prev,
            profileCheck: {
              success: !profileError,
              error: profileError?.message,
              hasProfile: !!profile,
              profile: profile
            }
          }));
        }

        // Test 3: Check projects access
        if (session?.user) {
          const { data: projects, error: projectsError } = await supabase
            .from('projects_new')
            .select('*')
            .eq('created_by', session.user.id);

          setTestResults(prev => ({
            ...prev,
            projectsCheck: {
              success: !projectsError,
              error: projectsError?.message,
              projectCount: projects?.length || 0
            }
          }));
        }

      } catch (error) {
        console.error('Auth flow test error:', error);
        setTestResults(prev => ({
          ...prev,
          generalError: error instanceof Error ? error.message : 'Unknown error'
        }));
      } finally {
        setLoading(false);
      }
    }

    testAuthFlow();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setTestResults({});
      window.location.reload();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Testing authentication flow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Authentication Flow Test</h1>
        
        {/* User Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          {user ? (
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
              <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
              <button
                onClick={handleSignOut}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">No user signed in</p>
              <Link
                href="/"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Go to Homepage to Sign In
              </Link>
            </div>
          )}
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <div className="space-y-4">
            {Object.entries(testResults).map(([testName, result]) => (
              <div key={testName} className="border rounded p-4">
                <h3 className="font-medium capitalize mb-2">{testName.replace(/([A-Z])/g, ' $1')}</h3>
                <div className="space-y-1 text-sm">
                  {typeof result === 'object' ? (
                    Object.entries(result).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className={key === 'success' ? (value ? 'text-green-600' : 'text-red-600') : 'text-gray-800'}>
                          {typeof value === 'boolean' ? (value ? '✅' : '❌') : String(value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className={testName === 'generalError' ? 'text-red-600' : 'text-gray-800'}>
                      {String(result)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-4"
          >
            Back to Home
          </Link>
          <Link
            href="/dashboard/homeowner"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
