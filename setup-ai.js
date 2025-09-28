#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🤖 Brixem AI - AI Provider Setup\n');

const providers = {
  '1': {
    name: 'OpenAI',
    envKey: 'OPENAI_API_KEY',
    description: 'GPT-3.5/GPT-4 models, $5 free credits monthly',
    getKeyUrl: 'https://platform.openai.com/api-keys'
  },
  '2': {
    name: 'Google Gemini',
    envKey: 'GOOGLE_API_KEY',
    description: 'Gemini Pro models, 1M tokens/day free',
    getKeyUrl: 'https://makersuite.google.com/app/apikey'
  },
  '3': {
    name: 'Anthropic Claude',
    envKey: 'ANTHROPIC_API_KEY',
    description: 'Claude-3 models, $5 free credits monthly',
    getKeyUrl: 'https://console.anthropic.com/'
  },
  '4': {
    name: 'Hugging Face',
    envKey: 'HUGGINGFACE_API_KEY',
    description: 'Open source models, 1000 requests/month free',
    getKeyUrl: 'https://huggingface.co/settings/tokens'
  },
  '5': {
    name: 'Groq',
    envKey: 'GROQ_API_KEY',
    description: 'Fast Llama models, free tier available',
    getKeyUrl: 'https://console.groq.com/keys'
  }
};

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('Choose your AI provider:\n');
  
  Object.entries(providers).forEach(([key, provider]) => {
    console.log(`${key}. ${provider.name}`);
    console.log(`   ${provider.description}`);
    console.log(`   Get API key: ${provider.getKeyUrl}\n`);
  });

  const choice = await askQuestion('Enter your choice (1-5): ');
  const selectedProvider = providers[choice];

  if (!selectedProvider) {
    console.log('❌ Invalid choice. Please run the script again.');
    process.exit(1);
  }

  console.log(`\n✅ Selected: ${selectedProvider.name}`);
  console.log(`📝 Get your API key from: ${selectedProvider.getKeyUrl}\n`);

  const apiKey = await askQuestion(`Enter your ${selectedProvider.name} API key: `);

  if (!apiKey.trim()) {
    console.log('❌ No API key provided. Please run the script again.');
    process.exit(1);
  }

  // Read existing .env.local or create new one
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  // Update or add AI provider configuration
  const providerName = selectedProvider.name.toLowerCase().replace(' ', '');
  const lines = envContent.split('\n');
  
  // Remove existing AI provider configurations
  const filteredLines = lines.filter(line => 
    !line.startsWith('AI_PROVIDER=') && 
    !line.startsWith('OPENAI_API_KEY=') &&
    !line.startsWith('GOOGLE_API_KEY=') &&
    !line.startsWith('ANTHROPIC_API_KEY=') &&
    !line.startsWith('HUGGINGFACE_API_KEY=') &&
    !line.startsWith('GROQ_API_KEY=')
  );

  // Add new configuration
  filteredLines.push(`AI_PROVIDER=${providerName}`);
  filteredLines.push(`${selectedProvider.envKey}=${apiKey.trim()}`);

  // Write updated .env.local
  const updatedEnvContent = filteredLines.join('\n');
  fs.writeFileSync(envPath, updatedEnvContent);

  console.log('\n✅ Configuration saved to .env.local');
  console.log('\n🚀 Next steps:');
  console.log('1. Run: npm run dev');
  console.log('2. Visit: http://localhost:3000/dashboard/homeowner/guided-project');
  console.log('3. Test: "I want to create a kitchen renovation project"');
  console.log('\n🎉 Your AI chat should now work!');

  rl.close();
}

main().catch(console.error);
