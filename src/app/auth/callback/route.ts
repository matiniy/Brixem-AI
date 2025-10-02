import { NextRequest, NextResponse } from 'next/server';
import { createUserClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    // Handle error cases
    console.error('Auth error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/?error=${error}&description=${errorDescription}`, request.url));
  }

  if (code) {
    try {
      // Exchange the code for a session
      const supabase = await createUserClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Session exchange error:', error);
        return NextResponse.redirect(new URL('/?error=session_exchange_failed', request.url));
      }

      if (data.session) {
        // Successfully authenticated, redirect to homeowner dashboard
        return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(new URL('/?error=callback_failed', request.url));
    }
  }

  // Fallback redirect to homeowner dashboard
  return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
} 