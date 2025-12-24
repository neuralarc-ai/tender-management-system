# 🔧 FIX: Auto-Generation Not Working

## 🔍 Root Cause

The error `axios is not defined` on line 895 shows that:
1. ✅ Axios import was added to the file
2. ❌ But server hasn't reloaded the new code yet
3. ❌ Tender creation is crashing before auto-generation runs

---

## ✅ Solution: Restart Server

### The server needs a full restart to pick up the axios import:

```bash
# Stop the current server
# Press Ctrl + C in terminal

# Clear Next.js cache (optional but recommended)
rm -rf .next

# Start fresh
npm run dev
```

---

## 🧪 After Restarting - Test This

### Step 1: Verify Server Started
Look for:
```
✓ Ready on http://localhost:3000
✓ Compiled successfully
```

### Step 2: Submit New Tender
1. Go to Partner Portal
2. Click "Post Tender"
3. Fill form (or upload document)
4. Click "Submit Tender"

### Step 3: Watch Terminal
You should see:
```
POST /api/tenders → 201 Created
POST /api/tenders/[tender-id]/generate-document → 200 OK
✓ Document generation started
```

**If you see these** → It's working!

### Step 4: Check UI
1. Go to "Intelligence" screen (admin)
2. Should see: "Currently Generating (1)"
3. Progress bar showing
4. After ~60 seconds: "Ready to Download (1)"

**OR**

1. Go to tender → "Generated Documents" tab
2. Should see document with progress bar
3. Status updates as it generates

---

## 🚨 If Still Not Working After Restart

### Check #1: Database Table Exists?

**The `tender_documents` table must exist!**

Run in Supabase SQL Editor:
```sql
-- Check if table exists
SELECT * FROM tender_documents LIMIT 1;
```

**If error "table doesn't exist":**
→ Run migration 009 and 010 in Supabase

### Check #2: GEMINI_API_KEY Set?

```bash
# Check if key is in .env.local
grep GEMINI_API_KEY .env.local
```

**If not found:**
→ Add `GEMINI_API_KEY=your_key_here` to `.env.local`

### Check #3: API Endpoint Working?

Test manually:
```bash
# After creating a tender, try:
curl -X POST http://localhost:3000/api/tenders/[tender-id]/generate-document \
  -H "Content-Type: application/json" \
  -d '{"documentType":"full"}'
```

**Should return:**
```json
{
  "documentId": "...",
  "status": "generating",
  "message": "Document generation started"
}
```

---

## 📋 Complete Checklist

Before testing again:

- [x] axios imported in `/app/api/tenders/route.ts`
- [ ] Server restarted (Ctrl+C then `npm run dev`)
- [ ] `.env.local` has `GEMINI_API_KEY`
- [ ] Migration 009 run in Supabase
- [ ] Migration 010 run in Supabase
- [ ] Browser refreshed
- [ ] Submit NEW tender (not old one)

---

## 🎯 Most Likely Issue

**Server hasn't restarted yet** with the new axios import.

**Solution:**
```bash
# Stop server (Ctrl + C)
npm run dev
# Wait for "Ready on http://localhost:3000"
# Submit NEW tender
# Watch it work! ✨
```

---

## ✅ Expected Behavior After Restart

```
Submit Tender
    ↓
✓ Success message (2 seconds)
    ↓
Go to Intelligence screen
    ↓
See: "Currently Generating (1)"
    ↓
Progress: 0% → 30% → 60% → 100%
    ↓
✓ Document Complete!
    Status: Pending Approval
```

---

**Restart server and try again!** 🚀

