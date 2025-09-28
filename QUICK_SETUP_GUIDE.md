# 🚀 Brixem AI - Quick Setup Guide (5 Minutes to 75%+ Health)

## Current Status: 🔴 25% Health → Target: 🟢 75%+ Health

---

## 📋 **Step 1: Get Supabase Credentials (2 minutes)**

### 1.1 Go to Supabase
- Visit: https://supabase.com/
- Click "Start your project"
- Sign up/Login with GitHub

### 1.2 Create New Project
- Click "New Project"
- Choose your organization
- **Project Name:** `brixem-ai`
- **Database Password:** Create a strong password (save it!)
- **Region:** Choose closest to you
- Click "Create new project"

### 1.3 Get API Keys
- Wait for project to be ready (2-3 minutes)
- Go to **Settings** → **API**
- Copy these values:
  - **Project URL** (starts with `https://`)
  - **anon public** key (starts with `eyJ`)
  - **service_role** key (starts with `eyJ`)

---

## 🤖 **Step 2: Get Groq AI API Key (1 minute)**

### 2.1 Go to Groq
- Visit: https://console.groq.com/
- Sign up/Login with Google/GitHub

### 2.2 Create API Key
- Click "Create API Key"
- **Name:** `brixem-ai`
- Click "Create Key"
- **Copy the key** (starts with `gsk_`)

---

## ⚙️ **Step 3: Update Environment File (1 minute)**

### 3.1 Open .env.local
```bash
notepad .env.local
```

### 3.2 Replace the placeholder values:

```env
# Groq Configuration
GROQ_API_KEY=gsk_your_actual_groq_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MAX_TOKENS=1000
GROQ_TEMPERATURE=0.7

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJ_your_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAT_FIRST=1
```

---

## 🗄️ **Step 4: Set Up Database (1 minute)**

### 4.1 Go to Supabase SQL Editor
- In your Supabase project dashboard
- Click **SQL Editor** in the left sidebar

### 4.2 Run Database Schema
- Click "New Query"
- Copy the entire content from `brixem-ai-complete-schema.sql`
- Paste it into the SQL editor
- Click "Run" (or Ctrl+Enter)

---

## ✅ **Step 5: Test Everything (1 minute)**

### 5.1 Restart Development Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### 5.2 Test API Endpoints
Open these URLs in your browser:
- http://localhost:3000/api/test-env ✅ Should show all variables loaded
- http://localhost:3000/api/test-db ✅ Should connect to database
- http://localhost:3000/api/test-auth ✅ Should authenticate
- http://localhost:3000/api/projects ✅ Should work with projects

---

## 🎯 **Expected Results After Setup**

| Component | Before | After | Status |
|-----------|--------|-------|---------|
| **Environment** | 25% | 100% | ✅ |
| **Database** | 0% | 100% | ✅ |
| **Authentication** | 0% | 100% | ✅ |
| **AI Services** | 0% | 100% | ✅ |
| **Project APIs** | 0% | 100% | ✅ |
| **Overall Health** | 25% | 95% | 🎉 |

---

## 🚨 **Troubleshooting**

### If you get errors:

1. **"Missing Supabase environment variables"**
   - Check your .env.local file has the correct Supabase URL and keys
   - Make sure there are no extra spaces or quotes

2. **"Groq API key not configured"**
   - Check your .env.local file has the correct Groq API key
   - Make sure the key starts with `gsk_`

3. **Database connection errors**
   - Make sure you ran the SQL schema in Supabase
   - Check your Supabase project is active (not paused)

4. **Still getting 500 errors**
   - Restart the development server
   - Check the terminal for specific error messages

---

## 🎉 **Success!**

Once you complete these steps, you should see:
- ✅ All API endpoints returning 200 OK
- ✅ Database connectivity working
- ✅ AI chat responding
- ✅ Project creation working
- ✅ **Overall Health: 95%+**

---

## 📞 **Need Help?**

If you run into any issues:
1. Check the terminal output for specific error messages
2. Verify all environment variables are correct
3. Make sure Supabase project is active
4. Restart the development server

**Total time to 75%+ health: ~5 minutes!** 🚀
