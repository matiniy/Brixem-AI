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
        
        // Test direct fetch to the Supabase API
        const response = await fetch('https://npclviylnwigldpfvscw.supabase.co/rest/v1/', {
          method: 'GET',
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2x2aXlsbndpZ2xkcGZ2c2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI4NTEsImV4cCI6MjA2OTYxODg1MX0.xnb9Kd8fl2PJSTZOLj6ry9I1jNGFy-RdNd5uL4B5c5A',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wY2x2aXlsbndpZ2xkcGZ2c2N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNDI4NTEsImV4cCI6MjA2OTYxODg1MX0.xnb9Kd8fl2PJSTZOLj6ry9I1jNGFy-RdNd5uL4B5c5A',
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
