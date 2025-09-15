import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Removed unused import

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    const { email, password } = await request.json();

    // Test user credentials
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

    const user = testUsers.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // For development, we'll create a simple session simulation
    // This bypasses Supabase auth for now and creates a mock session
    const mockSession = {
      user: {
        id: `dev-user-${user.email.replace('@', '-').replace('.', '-')}`,
        email: user.email,
        user_metadata: {
          full_name: user.name,
          role: user.role
        }
      },
      access_token: `dev-token-${Date.now()}`,
      refresh_token: `dev-refresh-${Date.now()}`
    };

    // Store the mock session in localStorage (this will be handled by the client)
    return NextResponse.json({ 
      success: true, 
      user: {
        email: user.email,
        name: user.name,
        role: user.role
      },
      message: 'Development login successful',
      mockSession: mockSession
    });

  } catch (error) {
    console.error('Dev login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
