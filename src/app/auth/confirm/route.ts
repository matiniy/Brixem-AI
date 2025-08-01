import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  console.log('Auth confirm route called with:', { token_hash, type, error, errorDescription });

  if (error) {
    console.error('Email confirmation error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/?error=${error}&description=${errorDescription}`, request.url));
  }

  if (token_hash && type === 'signup') {
    try {
      console.log('Attempting to verify OTP with token_hash:', token_hash);
      
      // Confirm the email
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      });

      if (error) {
        console.error('Email confirmation error:', error);
        return NextResponse.redirect(new URL(`/?error=email_confirmation_failed&description=${error.message}`, request.url));
      }

      if (data.user) {
        console.log('Email confirmed successfully for user:', data.user.email);
        
        // Check if user has any projects
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id')
          .eq('user_id', data.user.id)
          .limit(1);

        if (projectsError) {
          console.error('Projects fetch error:', projectsError);
        }

        // If user has projects, go to regular dashboard, otherwise go to empty dashboard
        if (projectsData && projectsData.length > 0) {
          return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
        } else {
          return NextResponse.redirect(new URL('/dashboard/homeowner/empty', request.url));
        }
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      return NextResponse.redirect(new URL('/?error=confirmation_failed', request.url));
    }
  }

  // Fallback redirect to homeowner dashboard
  console.log('No valid token_hash or type, redirecting to dashboard');
  return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
} 