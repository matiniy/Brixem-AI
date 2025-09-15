'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuth() {
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check environment variables
        const envInfo = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing',
          supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
          supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
        };

        // Test Supabase connection
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        const { data: userData, error: userError } = await supabase.auth.getUser();

        setDebugInfo({
          env: envInfo,
          session: { data: sessionData, error: sessionError },
          user: { data: userData, error: userError },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        setDebugInfo({
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto text-xs">
      <h3 className="font-bold mb-2">Debug Auth Info</h3>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}
