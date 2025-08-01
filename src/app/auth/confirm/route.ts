import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (error) {
    console.error('Email confirmation error:', error, errorDescription);
    return NextResponse.redirect(new URL(`/?error=${error}&description=${errorDescription}`, request.url));
  }

  if (token_hash && type === 'signup') {
    try {
      // Confirm the email
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'signup'
      });

      if (error) {
        console.error('Email confirmation error:', error);
        return NextResponse.redirect(new URL('/?error=email_confirmation_failed', request.url));
      }

      if (data.user) {
        // Email confirmed successfully, redirect to homeowner dashboard
        return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
      }
    } catch (error) {
      console.error('Email confirmation error:', error);
      return NextResponse.redirect(new URL('/?error=confirmation_failed', request.url));
    }
  }

  // Fallback redirect to homeowner dashboard
  return NextResponse.redirect(new URL('/dashboard/homeowner', request.url));
} 