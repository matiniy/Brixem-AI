#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Brixem AI Setup\n');

// Check if .env.local already exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('⚠️  .env.local already exists!');
  rl.question('Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      createEnvFile();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  rl.question('Enter your OpenAI API key: ', (apiKey) => {
    if (!apiKey.trim()) {
      console.log('❌ API key is required!');
      rl.close();
      return;
    }

    const envContent = `# OpenAI Configuration
OPENAI_API_KEY=${apiKey.trim()}

# Optional: Model configuration
OPENAI_MODEL=gpt-4o-mini

# Optional: Max tokens for responses
OPENAI_MAX_TOKENS=1000

# Optional: Temperature for response creativity (0.0 to 2.0)
OPENAI_TEMPERATURE=0.7
`;

    try {
      fs.writeFileSync(envPath, envContent);
      console.log('✅ .env.local created successfully!');
      console.log('🚀 You can now start the development server with: npm run dev');
      console.log('💡 Try chatting with the AI in the dashboard!');
    } catch (error) {
      console.error('❌ Error creating .env.local:', error.message);
    }
    
    rl.close();
  });
}

rl.on('close', () => {
  process.exit(0);
}); 