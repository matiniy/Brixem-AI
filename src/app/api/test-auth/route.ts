import { NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    console.log('Testing authentication...');
    
    const supabase = await createUserClient();
    console.log('Supabase client created');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check result:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        details: authError?.message || 'No user found',
        debug: {
          hasUser: !!user,
          errorMessage: authError?.message,
          errorCode: authError?.status
        }
      }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
