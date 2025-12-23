# 🚨 Experiencing "Error submitting tender" ?

**Quick Fix:** Your Supabase database connection is not configured correctly.

## 🔧 Fix It Now (2 Options):

### Option 1: Run Diagnostic (Recommended)
```bash
npm run diagnose
```

This will tell you exactly what's wrong and how to fix it!

### Option 2: Manual Fix
1. Open **`FIX_TENDER_ERROR.md`** - Complete step-by-step guide
2. Follow the instructions to set up Supabase
3. Update your `.env.local` file
4. Restart the dev server

---

## Common Errors & Quick Solutions

| Error | Solution |
|-------|----------|
| `ENOTFOUND xxx.supabase.co` | Invalid Supabase URL - see `FIX_TENDER_ERROR.md` |
| `Missing Supabase environment variables` | Create `.env.local` file - see `fix-env-template.txt` |
| `Table 'tenders' does not exist` | Run database migrations - see `supabase/SETUP_GUIDE.md` |

---

## What You Need

To fix this, you'll need:
1. **Supabase Account** (free) - [Sign up here](https://supabase.com)
2. **15 minutes** of time
3. **Follow** `FIX_TENDER_ERROR.md`

---

## Quick Commands

```bash
# Check what's wrong
npm run diagnose

# After fixing, start the app
npm run dev

# Test at
http://localhost:3000
```

---

**💡 Pro Tip:** The diagnostic tool (`npm run diagnose`) will guide you through the fix automatically!

