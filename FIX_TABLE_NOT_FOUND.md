# ⚡ QUICK FIX: Create tender_documents Table

## 🔍 The Error

```
Could not find the table 'public.tender_documents' in the schema cache
```

**Cause:** The table doesn't exist yet in your Supabase database.

---

## ✅ Solution: Run the Migration

### Method 1: Supabase Dashboard (Easiest) ⭐

**Step 1:** Open Supabase SQL Editor
- Go to your Supabase dashboard
- Click **"SQL Editor"** in the left menu
- Or visit: `your-project.supabase.co/project/_/sql`

**Step 2:** Create New Query
- Click **"New Query"** button

**Step 3:** Copy and Paste
- Open: `supabase/migrations/009_ai_document_generation.sql`
- Copy ALL the SQL content
- Paste into the SQL editor

**Step 4:** Run the Query
- Click **"Run"** button
- Wait for success message: ✅ "Success. No rows returned"

**Step 5:** Restart Server
```bash
# Stop server (Ctrl + C)
npm run dev
```

**Done!** ✅

---

### Method 2: Using Helper Script

```bash
./run-document-migration.sh
```

This will:
- Show your Supabase URL
- Display the SQL to run
- Give you step-by-step instructions

---

### Method 3: Command Line (If you have psql)

```bash
# Get your database URL from Supabase dashboard
# Settings → Database → Connection string

psql "your_postgres_connection_string" < supabase/migrations/009_ai_document_generation.sql
```

---

## 📋 What the Migration Creates

### tender_documents Table

**Columns:**
- `id` - Document UUID
- `tender_id` - Link to tender
- `document_type` - 'full', 'summary', or 'rfp'
- `title` - Document title
- `content` - Markdown content
- `status` - 'generating', 'completed', 'failed'
- `generation_progress` - 0-100%
- `page_count` - Number of pages
- `word_count` - Word count
- `generated_by` - User who generated
- `version` - Version number
- `metadata` - Additional JSON data
- `created_at` - Timestamp
- `updated_at` - Auto-updated timestamp

**Also Creates:**
- ✅ Performance indexes
- ✅ Auto-update trigger
- ✅ Row Level Security policies
- ✅ Proper constraints

---

## 🧪 Verify It Worked

### Check in Supabase:

1. Go to **Table Editor**
2. Look for **tender_documents** table
3. Should see the table with all columns

### Test in App:

1. Refresh browser
2. Go to **Intelligence** screen
3. Click **"Generate Document"**
4. Should work now! ✅

---

## 🚨 If Still Not Working

### Clear Supabase Cache:

Sometimes Supabase needs to refresh its schema cache:

1. Go to Supabase Dashboard
2. Settings → API
3. Click **"Restart API"** or wait a few minutes
4. Retry in your app

---

## ✅ After Migration Succeeds

You'll be able to:
- ✅ Generate tender documents
- ✅ Track generation progress
- ✅ Preview documents
- ✅ Download documents
- ✅ See document history

---

## 📊 Quick Checklist

- [ ] Open Supabase SQL Editor
- [ ] Copy SQL from `006_tender_documents.sql`
- [ ] Paste and run in SQL Editor
- [ ] See success message
- [ ] Verify table created
- [ ] Restart dev server
- [ ] Test document generation
- [ ] ✅ Success!

---

**Estimated Time:** 2 minutes  
**Difficulty:** Easy  
**Impact:** Enables entire Document Generation Center! 🚀

---

## 🎯 Next Steps After Migration

1. ✅ Table created
2. ✅ Restart server
3. ✅ Test Intelligence screen
4. ✅ Generate your first document!

**The Document Generation Center will be fully functional!** 🎉

