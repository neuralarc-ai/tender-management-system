# 🔗 Supabase Connection Checklist

## ✅ **Step-by-Step Verification**

### **1. Check .env.local file exists**
```bash
# Create if it doesn't exist
cp env.example .env.local
```

### **2. Verify environment variables format**

Your `.env.local` should look like this:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

**Important:**
- ✅ URLs should start with `https://`
- ✅ Keys are very long JWT tokens
- ✅ NO quotes around values
- ✅ NO trailing spaces
- ✅ NO extra lines between variables

### **3. Get credentials from Supabase**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → **anon/public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Project API keys** → **service_role** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Secret!)

### **4. Test connection**

```bash
# Restart your dev server to load new env vars
npm run dev
```

Then check the browser console for any Supabase errors.

### **5. Run connection test (optional)**

```bash
# Create a test page
node -e "require('./lib/test-supabase-connection.ts').testSupabaseConnection()"
```

---

## 🔍 **Common Issues:**

### **❌ "Missing Supabase environment variables"**
- Check `.env.local` exists in project root
- Restart dev server (`npm run dev`)
- Verify no typos in variable names

### **❌ "Invalid API key"**
- Ensure you copied the FULL key (very long)
- No extra spaces or line breaks
- Make sure you're using the correct project

### **❌ "Failed to fetch"**
- Check your Supabase project is not paused
- Verify migrations 001-004 ran successfully
- Check internet connection

### **❌ RLS blocking queries**
- Ensure you're authenticated
- Check RLS policies are correct
- Verify user role matches policy requirements

---

## 📋 **Quick Verification Checklist:**

- [ ] `.env.local` file exists in project root
- [ ] All 3 environment variables are set
- [ ] Keys are copied completely (no truncation)
- [ ] Dev server restarted after adding env vars
- [ ] All 4 migrations ran successfully in Supabase
- [ ] Demo users exist (check Supabase Table Editor → users)
- [ ] RLS is enabled (check Supabase → Database → Tables)

---

## 🧪 **Manual Test in Supabase:**

```sql
-- Check demo users exist
SELECT email, role, organization_name FROM users;

-- Should return 2 users:
-- partner@dcs.com (client)
-- admin@neuralarc.com (admin)
```

---

## ✅ **Next Steps:**

Once `.env.local` is configured:
1. Restart dev server
2. Login with PIN 1111 or 2222
3. App should connect to Supabase automatically
4. Check browser console for connection logs

