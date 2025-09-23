import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      groqApiKey: process.env.GROQ_API_KEY ? 'LOADED' : 'NOT LOADED',
      groqModel: process.env.GROQ_MODEL || 'undefined',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'LOADED' : 'NOT LOADED',
      allEnvVars: Object.keys(process.env).filter(key => key.includes('GROQ') || key.includes('SUPABASE'))
    });
  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({ error: 'Failed to check environment variables' }, { status: 500 });
  }
}
