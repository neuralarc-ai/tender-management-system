# 🔄 Clean Data & Update PINs - Complete Guide

## ✅ What's Being Changed

### **New PINs:**
- **Admin PIN:** `1978` (was `2222`)
- **Partner PIN:** `7531` (was `1111`) - more secure/complex

### **Data Cleaned:**
- All tenders deleted
- All proposals deleted
- All AI analyses deleted
- All documents deleted
- All communications deleted
- All notifications deleted
- Users recreated with fresh data

---

## 🚀 Quick Start (3 Steps)

### **Step 1: Run Database Cleanup**

Open Supabase SQL Editor and run:

```bash
# Go to your Supabase project → SQL Editor → New query
# Copy and paste the entire file: supabase/clean_data_and_update_pins.sql
# Click "Run"
```

Or from command line:
```bash
cd supabase
psql [YOUR_DATABASE_URL] < clean_data_and_update_pins.sql
```

### **Step 2: Clear Browser Data**

**Option A - Browser Console:**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Option B - Manual:**
- Open DevTools (F12)
- Application → Local Storage → Clear All
- Application → Session Storage → Clear All
- Refresh page

**Option C - Incognito:**
- Just open new incognito/private window
- Old data won't interfere

### **Step 3: Test New PINs**

1. Go to: `http://localhost:3000/auth/pin`
2. **Admin Login:** Enter `1978`
3. **Partner Login:** Enter `7531`

---

## 📋 Detailed Steps

### **1. Database Cleanup SQL**

The SQL script does the following:

```sql
-- Delete all data
DELETE FROM tender_documents;
DELETE FROM proposals;
DELETE FROM ai_analyses;
DELETE FROM tender_communication;
DELETE FROM tenders;
DELETE FROM notifications;

-- Recreate users
DELETE FROM user_settings;
DELETE FROM users;

INSERT INTO users (...) VALUES
  ('11111111-1111-1111-1111-111111111111', 'partner@dcs.com', ...),
  ('22222222-2222-2222-2222-222222222222', 'admin@neuralarc.com', ...);
```

### **2. Frontend Changes Applied**

#### **File: `app/auth/pin/page.tsx`**

**BEFORE:**
```typescript
if (pinString === '1111') {
  login('client', ...);
} else if (pinString === '2222') {
  login('admin', ...);
}
```

**AFTER:**
```typescript
if (pinString === '7531') {
  login('client', ...);
} else if (pinString === '1978') {
  login('admin', ...);
}
```

#### **File: `app/api/auth/verify-pin/route.ts`**

**BEFORE:**
```typescript
const isMatch = (pin === '1111' && user.role === 'client') || 
                (pin === '2222' && user.role === 'admin');
```

**AFTER:**
```typescript
const isMatch = (pin === '7531' && user.role === 'client') || 
                (pin === '1978' && user.role === 'admin');
```

---

## 🔐 New Credentials

### **Admin Account (Neural Arc)**
```
Email: admin@neuralarc.com
PIN: 1978
Role: admin
Organization: Neural Arc Inc.
User ID: 22222222-2222-2222-2222-222222222222
```

### **Partner Account (DCS)**
```
Email: partner@dcs.com
PIN: 7531
Role: client
Organization: DCS Corporation
User ID: 11111111-1111-1111-1111-111111111111
```

---

## 🧪 Testing Checklist

### **After Running SQL:**

- [ ] Open Supabase → SQL Editor
- [ ] Run verification queries:

```sql
-- Should return 0
SELECT COUNT(*) FROM tenders;
SELECT COUNT(*) FROM proposals;
SELECT COUNT(*) FROM tender_documents;

-- Should return 2
SELECT COUNT(*) FROM users;

-- Should show both users
SELECT email, role, organization_name FROM users;
```

### **After Updating Code:**

- [ ] Restart dev server (`npm run dev`)
- [ ] Clear browser localStorage
- [ ] Go to PIN login page
- [ ] Test admin PIN: `1978` → Should go to admin dashboard
- [ ] Logout
- [ ] Test partner PIN: `7531` → Should go to client dashboard

### **Fresh Start:**

- [ ] No tenders visible (clean database)
- [ ] Partner can create new tender
- [ ] Admin can see submitted tenders
- [ ] All features work with fresh data

---

## 📊 What Gets Deleted

| Table | Records Deleted | Why |
|-------|----------------|-----|
| **tenders** | All | Fresh start, no old tenders |
| **proposals** | All | Linked to tenders |
| **ai_analyses** | All | Linked to tenders |
| **tender_documents** | All | Generated documents |
| **tender_communication** | All | Messages between users |
| **notifications** | All | Old notifications |
| **users** | All (recreated) | To update PINs |
| **user_settings** | All (recreated) | Linked to users |

---

## ⚠️ Important Notes

### **What's NOT Deleted:**
- Database schema (tables, columns, constraints)
- RLS policies
- Functions and triggers
- Storage buckets (but files will be orphaned)

### **After Cleanup:**
- System is in fresh state
- Like a new installation
- All features work normally
- Users can start creating tenders from scratch

### **Old PINs Will NOT Work:**
- `1111` ❌ (old partner PIN)
- `2222` ❌ (old admin PIN)
- Only new PINs work:
  - `1978` ✅ (admin)
  - `7531` ✅ (partner)

---

## 🔧 Troubleshooting

### **"Invalid PIN" Error:**

1. Make sure you ran the SQL script
2. Make sure you updated the frontend code
3. Make sure you restarted the dev server
4. Clear browser localStorage
5. Try in incognito mode

### **"No users found" Error:**

The SQL script didn't run properly:
```sql
-- Check if users exist
SELECT * FROM users;

-- If empty, run the INSERT statements again
```

### **Old Data Still Showing:**

1. Verify SQL script ran:
```sql
SELECT COUNT(*) FROM tenders;  -- Should be 0
```

2. If not 0, run DELETE statements again:
```sql
DELETE FROM tenders CASCADE;
```

### **Frontend Still Uses Old PINs:**

1. Check file changes were saved
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)
4. Check terminal for any errors

---

## 📝 Files Modified

### **Created:**
- `supabase/clean_data_and_update_pins.sql` - Database cleanup script

### **Modified:**
- `app/auth/pin/page.tsx` - Frontend PIN check
- `app/api/auth/verify-pin/route.ts` - Backend PIN verification

---

## 🎯 Why These PINs?

### **Admin: 1978**
- Easy to remember for admin
- Year-based (easier to recall)
- Not sequential like 1234

### **Partner: 7531**
- More complex than 1111
- Non-sequential pattern
- Harder to guess
- Still demo-friendly (not too complex)

---

## 🚀 Complete Workflow

```
1. Run SQL Script
   ↓
2. Update Frontend Code (DONE ✅)
   ↓
3. Restart Dev Server
   ↓
4. Clear Browser Cache
   ↓
5. Test Login with New PINs
   ↓
6. Fresh Start with Clean Database!
```

---

## ✅ Success Criteria

After completing all steps:

- [ ] Can login with PIN `1978` as admin
- [ ] Can login with PIN `7531` as partner
- [ ] Old PINs (`1111`, `2222`) don't work
- [ ] No tenders in database
- [ ] No proposals in database
- [ ] Fresh, clean system
- [ ] All features work normally

---

## 📋 Quick Command Reference

### **Run SQL Cleanup:**
```bash
cd supabase
psql $DATABASE_URL -f clean_data_and_update_pins.sql
```

### **Restart Dev Server:**
```bash
npm run dev
```

### **Clear localStorage (Browser Console):**
```javascript
localStorage.clear();
location.reload();
```

### **Verify Cleanup (SQL):**
```sql
SELECT COUNT(*) FROM tenders;  -- Should be 0
SELECT COUNT(*) FROM users;    -- Should be 2
SELECT email, role FROM users; -- Should show both accounts
```

---

## 🎉 Ready to Use!

Once you complete all steps:

1. ✅ Database is clean
2. ✅ New PINs are active
3. ✅ System is ready for fresh demo
4. ✅ All features work perfectly

**New Login Credentials:**
- Admin: `1978`
- Partner: `7531`

Start fresh and enjoy the clean system! 🚀

---

© 2025 Neural Arc Inc. All rights reserved.
**Date**: December 24, 2025
**Version**: Clean Reset

