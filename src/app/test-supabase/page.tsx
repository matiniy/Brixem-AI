"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    async function testSupabase() {
      try {
        setStatus('Testing Supabase connection...');
        
        // Test 1: Check environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setDetails({
          supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'Not set',
          supabaseKey: supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Not set',
        });

        // Test 2: Try to connect to Supabase
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        
        if (error) {
          setStatus(`❌ Supabase Error: ${error.message}`);
          setDetails(prev => ({ ...prev, error: error.message, code: error.code }));
        } else {
          setStatus('✅ Supabase connection successful!');
          setDetails(prev => ({ ...prev, data }));
        }

        // Test 3: Try authentication
        setStatus('Testing authentication...');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPassword123!',
          options: {
            data: {
              full_name: 'Test User',
              role: 'homeowner'
            }
          }
        });

        if (authError) {
          setStatus(`❌ Auth Error: ${authError.message}`);
          setDetails(prev => ({ ...prev, authError: authError.message }));
        } else {
          setStatus('✅ Authentication test successful!');
          setDetails(prev => ({ ...prev, authData }));
        }

      } catch (error) {
        setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setDetails(prev => ({ ...prev, connectionError: error }));
      }
    }

    testSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Details</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
