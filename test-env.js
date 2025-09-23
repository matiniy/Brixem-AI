// Test environment variables loading
require('dotenv').config({ path: '.env.local' });
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'LOADED' : 'NOT LOADED');
console.log('GROQ_MODEL:', process.env.GROQ_MODEL);
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'LOADED' : 'NOT LOADED');
