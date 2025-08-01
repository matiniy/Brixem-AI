# Brixem AI

<!-- Trigger deployment for domain connection fix -->
<!-- Trigger deployment -->
<!-- Force fresh deployment -->
<!-- Trigger deployment for subdomain test -->
<!-- Trigger deployment for TypeScript fixes -->

A modern AI-powered construction management platform.

## AI Integration Setup

### 1. Get OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Copy the API key (keep it secure!)

### 2. Configure Environment Variables

**Option A: Use the setup script (Recommended)**
```bash
npm run setup-ai
```

**Option B: Manual setup**
1. Copy `env.example` to `.env.local`
2. Replace `your_openai_api_key_here` with your actual OpenAI API key
3. Optionally adjust other settings:
   - `OPENAI_MODEL`: AI model to use (default: gpt-4o-mini)
   - `OPENAI_MAX_TOKENS`: Maximum response length (default: 1000)
   - `OPENAI_TEMPERATURE`: Response creativity (0.0-2.0, default: 0.7)

### 3. Test the Integration
1. Start the development server: `npm run dev`
2. Open the dashboard
3. Try chatting with the AI assistant
4. Test task creation: "Create task: Install new kitchen cabinets"

### Security Notes
- Never commit your `.env.local` file to version control
- The API key is stored securely on the server side
- All AI requests go through Next.js API routes for security
- Environment variables are automatically ignored by git

## Features
- **AI Chat**: Intelligent conversation about construction projects
- **Task Creation**: Natural language task creation via AI
- **Project Context**: AI understands your specific project details
- **Error Handling**: Graceful fallbacks when AI is unavailable

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
