'use client';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-md">
            <h3 className="font-medium text-green-800">✅ App is Working</h3>
            <p className="text-sm text-green-600">This page loaded successfully!</p>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-800">Environment Variables</h3>
            <div className="text-sm text-blue-600 space-y-1">
              <p>NODE_ENV: {process.env.NODE_ENV}</p>
              <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing'}</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing'}</p>
              <p>GROQ_API_KEY: {process.env.GROQ_API_KEY ? 'Present' : 'Missing'}</p>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 rounded-md">
            <h3 className="font-medium text-yellow-800">Build Info</h3>
            <div className="text-sm text-yellow-600">
              <p>Build Time: {new Date().toISOString()}</p>
              <p>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
