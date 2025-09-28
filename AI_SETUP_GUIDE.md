# 🤖 AI Provider Setup Guide - Brixem AI

## 🚀 **Quick Setup (Choose One)**

### **Option 1: OpenAI API (Recommended - Easiest)**
**Free Tier:** $5 free credits monthly
**Setup Time:** 2 minutes

#### Step 1: Get API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up/Login with your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

#### Step 2: Add to Environment
```bash
# Add to your .env.local file
AI_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

#### Step 3: Test
```bash
npm run dev
# Visit: http://localhost:3000/dashboard/homeowner/guided-project
```

---

### **Option 2: Google Gemini API (Free Tier)**
**Free Tier:** 15 requests/minute, 1M tokens/day
**Setup Time:** 3 minutes

#### Step 1: Get API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

#### Step 2: Add to Environment
```bash
# Add to your .env.local file
AI_PROVIDER=google
GOOGLE_API_KEY=your-key-here
```

---

### **Option 3: Anthropic Claude API**
**Free Tier:** $5 free credits monthly
**Setup Time:** 2 minutes

#### Step 1: Get API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up/Login
3. Go to "API Keys" section
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)

#### Step 2: Add to Environment
```bash
# Add to your .env.local file
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

---

### **Option 4: Hugging Face API (Free)**
**Free Tier:** 1000 requests/month
**Setup Time:** 5 minutes

#### Step 1: Get API Key
1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Sign up/Login
3. Click "New token"
4. Select "Read" access
5. Copy the token

#### Step 2: Add to Environment
```bash
# Add to your .env.local file
AI_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your-token-here
```

---

## 🔧 **Complete Setup Instructions**

### **Step 1: Update Your .env.local File**
```bash
# Choose your AI provider (uncomment one)
AI_PROVIDER=openai
# AI_PROVIDER=google
# AI_PROVIDER=anthropic
# AI_PROVIDER=huggingface
# AI_PROVIDER=groq

# Add your API key (replace with your actual key)
OPENAI_API_KEY=sk-your-openai-key-here
GOOGLE_API_KEY=your-google-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
HUGGINGFACE_API_KEY=hf_your-huggingface-token-here
GROQ_API_KEY=gsk_your-groq-key-here

# Keep your existing Supabase keys
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-key
```

### **Step 2: Update the Chat API**
The chat API has been updated to use the new flexible provider system. No code changes needed!

### **Step 3: Test the Setup**
```bash
# Start the development server
npm run dev

# Test the chat
# Visit: http://localhost:3000/dashboard/homeowner/guided-project
# Try: "I want to create a kitchen renovation project"
```

---

## 🎯 **Provider Comparison**

| Provider | Free Tier | Speed | Quality | Setup |
|----------|-----------|-------|---------|-------|
| **OpenAI** | $5/month | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Google Gemini** | 1M tokens/day | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Anthropic Claude** | $5/month | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Hugging Face** | 1000 req/month | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **Groq** | Free tier | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🚀 **Quick Start (Recommended)**

### **For Immediate Testing:**
1. **Get OpenAI API Key** (2 minutes)
2. **Add to .env.local:**
   ```bash
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key-here
   ```
3. **Test:**
   ```bash
   npm run dev
   ```

### **For Production:**
1. **Use OpenAI** for reliability
2. **Add Google Gemini** as backup
3. **Monitor usage** and costs

---

## 🔧 **Advanced Configuration**

### **Custom Model Selection**
```bash
# In .env.local, you can override models
OPENAI_MODEL=gpt-4
ANTHROPIC_MODEL=claude-3-sonnet-20240229
GOOGLE_MODEL=gemini-pro
```

### **Fallback Providers**
The system automatically falls back to the next available provider if one fails.

### **Rate Limiting**
Each provider has built-in rate limiting and retry logic.

---

## 🎉 **Ready to Go!**

Once you've added your API key to `.env.local`, the AI chat will work immediately!

**Test it now:**
1. Visit: `http://localhost:3000/dashboard/homeowner/guided-project`
2. Type: "I want to create a kitchen renovation project"
3. Watch the AI respond and create your project!

---

## 🆘 **Troubleshooting**

### **"API key not configured" Error**
- Check your `.env.local` file has the correct key
- Restart the development server: `npm run dev`

### **"Provider not found" Error**
- Make sure `AI_PROVIDER` is set correctly
- Check the provider name matches exactly

### **Rate Limit Errors**
- Switch to a different provider
- Wait a few minutes and try again

### **Still Having Issues?**
- Check the console for detailed error messages
- Verify your API key is valid
- Try a different provider

---

**Choose your provider and let's get Brixem AI working! 🚀**
