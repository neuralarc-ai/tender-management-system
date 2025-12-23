# 🚨 TENDER SUBMISSION ERROR - QUICK FIX GUIDE

## Problem
**Error:** "Error submitting tender. Please try again."

**Root Cause:** Your Supabase database connection is failing because:
- The Supabase URL in `.env.local` is incorrect or points to a non-existent project
- Error: `getaddrinfo ENOTFOUND umthrczbigoutepwqang.supabase.co`

---

## 🔧 SOLUTION (Choose One)

### ⚡ OPTION 1: Quick Fix - Create New Supabase Project (15 minutes)

This is the **RECOMMENDED** solution for production use.

#### Step 1: Create Supabase Account & Project

1. **Go to** [supabase.com](https://supabase.com)
2. **Sign up** (it's free - no credit card needed for free tier)
3. **Click** "New Project"
4. **Fill in:**
   - Project Name: `tender-management-system`
   - Database Password: [Create a strong password and SAVE IT]
   - Region: Choose closest to you (e.g., ap-southeast-1 for Asia)
5. **Click** "Create Project"
6. **Wait** 2-3 minutes for project to initialize

#### Step 2: Get Your Credentials

1. **Once project is ready**, click on your project
2. **Go to:** Project Settings (⚙️ icon) → API
3. **Copy these values:**

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3...
```

#### Step 3: Update Environment File

1. **Open** your `.env.local` file
2. **Replace** the old values with your new credentials:

```bash
# Replace these with YOUR actual values from Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# Keep these as-is
AI_API_KEY=your_helium_api_key_here
AI_API_ENDPOINT=https://api.he2.site/api/v1/public
```

3. **Save** the file

#### Step 4: Run Database Migrations

1. **Go to** your Supabase Dashboard
2. **Click** SQL Editor (on the left sidebar)
3. **Click** "New Query"
4. **Open** `/supabase/migrations/007_clean_setup_no_dummy_data.sql` in your project
5. **Copy** the entire contents
6. **Paste** into the SQL Editor
7. **Click** "Run" (or press Ctrl+Enter)
8. **Wait** for success message

#### Step 5: Verify Connection

```bash
# Install dotenv if not already installed
npm install dotenv

# Run diagnostic tool
node diagnose-supabase.js

# You should see:
# ✅ SUPABASE_URL found
# ✅ SUPABASE_ANON_KEY found
# ✅ SUPABASE_SERVICE_KEY found
# ✅ URL format is valid
# ✅ Successfully connected to Supabase!
# ✅ Database tables accessible
```

#### Step 6: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Start fresh
npm run dev
```

#### Step 7: Test Tender Submission

1. **Go to** http://localhost:3000
2. **Login** with PIN `1111` (client) or `2222` (admin)
3. **Try creating a new tender**
4. **Should work now!** ✅

---

### 🎯 OPTION 2: Verify Your Existing Supabase Project (5 minutes)

If you think you already have a valid Supabase project:

1. **Login to** [app.supabase.com](https://app.supabase.com)
2. **Check if** your project `umthrczbigoutepwqang` exists
3. **If it exists:**
   - Check if it's PAUSED (restart it)
   - Verify the URL is correct
   - Get fresh API keys from Project Settings → API
4. **Update** `.env.local` with correct values
5. **Run** diagnostic: `node diagnose-supabase.js`

---

## 🧪 Testing After Fix

### Test 1: Check Logs
```bash
# Your terminal should NOT show these errors anymore:
# ❌ Error: getaddrinfo ENOTFOUND xxx.supabase.co
# ❌ Error fetching tenders

# Instead, you should see:
# ✅ Compiled successfully
# ✅ No database errors
```

### Test 2: Submit a Tender
1. Go to client view (PIN: 1111)
2. Click "New Tender"
3. Fill in all fields
4. Submit
5. **Success!** You should see:
   - ✅ "Success! Your tender has been submitted"
   - No error messages
   - Tender appears in the list

---

## 🔍 Troubleshooting

### Still Getting Errors?

#### Error: "Invalid API key"
```bash
# Solution:
# 1. Go to Supabase Dashboard → Project Settings → API
# 2. Copy FRESH keys (don't reuse old ones)
# 3. Make sure you're copying the FULL key (they're very long!)
# 4. Update .env.local
# 5. Restart: npm run dev
```

#### Error: "Table 'tenders' does not exist"
```bash
# Solution: Run the migration
# 1. Go to Supabase SQL Editor
# 2. Run: supabase/migrations/007_clean_setup_no_dummy_data.sql
# 3. Check Table Editor to verify tables exist
```

#### Error: "Missing Supabase environment variables"
```bash
# Solution:
# 1. Verify .env.local file exists in project root
# 2. Check file has correct variable names (no typos!)
# 3. No spaces around = sign
# 4. No quotes around values
# 5. Restart dev server
```

---

## 📁 Files You May Need

- **Environment Template:** `fix-env-template.txt` (reference)
- **Diagnostic Tool:** `diagnose-supabase.js` (run this to test)
- **Migration File:** `supabase/migrations/007_clean_setup_no_dummy_data.sql`
- **Setup Guide:** `supabase/SETUP_GUIDE.md` (detailed instructions)

---

## ✅ Success Checklist

After fixing, you should be able to:
- [ ] Run `node diagnose-supabase.js` with no errors
- [ ] Start dev server without database errors
- [ ] Login to the app
- [ ] Create a new tender successfully
- [ ] See tender in the list
- [ ] AI analysis generates automatically

---

## 💡 Quick Commands Reference

```bash
# Check connection
node diagnose-supabase.js

# Restart dev server
npm run dev

# Check server logs
# Look at the terminal where npm run dev is running

# Check Supabase project status
# Visit: https://app.supabase.com
```

---

## 🆘 Still Stuck?

1. **Run the diagnostic:**
   ```bash
   node diagnose-supabase.js
   ```
   
2. **Check the output** - it will tell you exactly what's wrong

3. **Common issues:**
   - Forgot to create Supabase project → Go to supabase.com
   - Wrong URL format → Should be `https://xxx.supabase.co` (no trailing slash!)
   - Didn't run migrations → Use SQL Editor in Supabase Dashboard
   - Cached environment → Restart terminal and dev server

4. **For detailed help:**
   - Read: `supabase/SETUP_GUIDE.md`
   - Check: `TROUBLESHOOTING.md`

---

## 🎯 Summary

**The Problem:** Invalid Supabase connection  
**The Solution:** Create new Supabase project + update `.env.local`  
**Time Required:** 15-20 minutes  
**Cost:** FREE (Supabase free tier)  

**After fixing:**
- ✅ Tender submissions work
- ✅ Database queries work  
- ✅ AI analysis works
- ✅ Full system operational

---

**Need immediate help?** Run `node diagnose-supabase.js` - it will guide you! 🚀

