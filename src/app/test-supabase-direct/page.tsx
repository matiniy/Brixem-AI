"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function TestSupabaseDirectPage() {
  const [status, setStatus] = useState('Testing direct connection...');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    async function testDirectConnection() {
      try {
        setStatus('Testing direct fetch to Supabase...');
        
        // Test direct fetch to the Supabase API using environment variables
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          setStatus('❌ Missing Supabase environment variables');
          setResult({ error: 'Environment variables not configured' });
          return;
        }
        
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setStatus('✅ Direct connection successful!');
          const data = await response.text();
          setResult({
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: data.substring(0, 200) + '...'
          });
        } else {
          setStatus(`❌ Connection failed: ${response.status} ${response.statusText}`);
          setResult({
            status: response.status,
            statusText: response.statusText,
            error: 'HTTP error'
          });
        }

      } catch (error) {
        setStatus(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setResult({
          error: error instanceof Error ? error.message : 'Unknown error',
          type: 'network_error'
        });
      }
    }

    testDirectConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Direct Supabase Connection Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <Link 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
