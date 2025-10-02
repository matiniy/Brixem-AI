#!/usr/bin/env node

// Set environment variables for build
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder-key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-service-key';
process.env.GROQ_API_KEY = 'placeholder-groq-key';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

// Import and run the build
const { execSync } = require('child_process');

try {
  console.log('Building with placeholder environment variables...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
