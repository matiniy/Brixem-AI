# 🔐 Supabase Authentication Setup Guide

## Required Configuration in Supabase Dashboard

### 1. **Enable Email Authentication**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Email** provider
4. Configure email settings:
   - **Enable email confirmations**: ✅ (Recommended for security)
   - **Enable email change confirmations**: ✅
   - **Enable phone confirmations**: ❌ (Not needed for this app)

### 2. **Configure Email Templates**
1. Go to **Authentication** → **Email Templates**
2. Customize the following templates:
   - **Confirm signup** (for new user verification)
   - **Reset password** (for password recovery)
   - **Magic Link** (if using magic link auth)

### 3. **Set Up Site URL and Redirects**
1. Go to **Authentication** → **URL Configuration**
2. Set the following URLs:
   - **Site URL**: `https://www.brixem.com`
   - **Redirect URLs**: 
     - `https://www.brixem.com/auth/callback`
     - `https://www.brixem.com/auth/confirm`
     - `https://www.brixem.com/dashboard/homeowner`

### 4. **Configure User Management**
1. Go to **Authentication** → **Users**
2. Enable **Enable email confirmations**
3. Set **JWT expiry** to 3600 seconds (1 hour)
4. Enable **Enable refresh token rotation**

### 5. **Optional: Enable Social Providers**
If you want to add social login later:
1. Go to **Authentication** → **Providers**
2. Enable desired providers:
   - **Google** (recommended)
   - **GitHub** (for developers)
   - **Facebook** (for broader reach)

### 6. **Test Authentication**
1. Go to **Authentication** → **Users**
2. Try creating a test user manually
3. Check that the user appears in the `profiles` table

## 🚀 **After Configuration**

Once configured, your app will have:
- ✅ **Email/password signup** with email verification
- ✅ **Secure password reset** functionality
- ✅ **Automatic profile creation** when users sign up
- ✅ **Row Level Security** protecting user data
- ✅ **Session management** with automatic refresh

## 🔧 **Environment Variables Already Set**

Your `.env.local` already has the correct Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL` ✅
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
- `SUPABASE_SERVICE_ROLE_KEY` ✅

## 📝 **Next Steps**

1. **Configure the settings above** in your Supabase dashboard
2. **Test signup/signin** on your production site
3. **Verify email confirmations** work
4. **Check that profiles are created** automatically

## 🎯 **Expected Behavior**

After setup:
- Users can sign up with email/password
- They receive email confirmation
- Clicking confirmation link creates their profile
- They're redirected to the homeowner dashboard
- All their data is protected by RLS policies

---

**Note**: Supabase handles most authentication automatically. You just need to configure the settings above in the dashboard.
