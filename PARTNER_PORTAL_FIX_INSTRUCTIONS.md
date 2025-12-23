# 🔧 Partner Portal Fix Instructions

## Problem Identified

The partner portal (client role, PIN: 1111) was not showing any tenders due to two issues:

1. **Database Function Issue**: The `get_tenders_with_details` function was returning the user's email instead of UUID for the `createdBy` field
2. **Frontend Query Issue**: The frontend wasn't passing the userId parameter to filter tenders properly

## ✅ What Has Been Fixed (Frontend)

The following frontend files have been automatically updated:

1. **`components/dashboard/DashboardView.tsx`**
   - Now passes `userId` and `role` parameters to the API
   - Removed redundant client-side filtering (database handles it now)
   - Tenders are properly filtered based on user role

## 🔴 What You Need To Do (Database)

You need to run the SQL fix in your Supabase database.

### Step-by-Step Instructions:

#### 1. Open Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to **SQL Editor** (left sidebar)

#### 2. Run the SQL Fix
- Open the file: **`FIX_PARTNER_PORTAL.sql`** (in your project root)
- Copy the ENTIRE contents
- Paste into Supabase SQL Editor
- Click **"Run"** button

#### 3. Verify the Fix
After running the SQL, verify by running these test queries in SQL Editor:

```sql
-- Test Partner/Client view (should show only their tenders)
SELECT * FROM get_tenders_with_details('client', '11111111-1111-1111-1111-111111111111'::uuid);

-- Test Admin view (should show all tenders)
SELECT * FROM get_tenders_with_details('admin', '22222222-2222-2222-2222-222222222222'::uuid);
```

#### 4. Test in Browser
1. Restart your Next.js development server (if needed):
   ```bash
   npm run dev
   ```

2. Login to Partner Portal:
   - Go to: http://localhost:3000/auth/pin
   - Enter PIN: **1111**
   - You should now see the tenders created by the partner/client

3. Verify Admin Portal still works:
   - Logout
   - Login with PIN: **2222**
   - Should see ALL tenders

## 📋 What Changed

### Database Function Change
**Before:**
```sql
'createdBy', u.email,  -- Returns "partner@dcs.com"
```

**After:**
```sql
'createdBy', t.created_by::text,  -- Returns "11111111-1111-1111-1111-111111111111"
```

### Frontend API Call Change
**Before:**
```typescript
const response = await axios.get('/api/tenders');
```

**After:**
```typescript
const params = new URLSearchParams();
if (role === 'client' && authState.userId) {
  params.append('userId', authState.userId);
}
params.append('role', role);
const response = await axios.get(`/api/tenders?${params.toString()}`);
```

## 🎯 Expected Behavior After Fix

### Partner Portal (PIN: 1111)
- Shows only tenders created by that partner
- If partner has created tenders, they will appear
- Empty state if no tenders created yet

### Admin Portal (PIN: 2222)
- Shows ALL tenders from all users
- Can see tenders from all partners/clients

## 🐛 Troubleshooting

### Issue: Partner portal still shows no tenders
**Solution:** Make sure you have actually created tenders as the partner user. Try:
1. Login as partner (PIN: 1111)
2. Click the "+" button to create a new tender
3. Fill out the form and submit
4. The tender should appear immediately

### Issue: SQL Error when running fix
**Solution:** 
- Make sure you copied the ENTIRE SQL file content
- Verify you're connected to the correct Supabase project
- Check that previous migrations were run successfully

### Issue: "Function does not exist" error
**Solution:** Run the initial migrations first:
1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/007_clean_setup_no_dummy_data.sql`
4. `supabase/migrations/004_functions.sql`
5. Then run `FIX_PARTNER_PORTAL.sql`

## 📞 Need Help?

If issues persist:
1. Check browser console for errors (F12 → Console tab)
2. Check Supabase logs (Dashboard → Logs → API)
3. Verify user is authenticated (check localStorage.auth in browser console)
4. Verify tenders exist in database (Supabase → Table Editor → tenders)

## ✅ Success Checklist

- [ ] SQL fix run in Supabase without errors
- [ ] Verification queries return results
- [ ] Partner portal shows tenders after login
- [ ] Admin portal shows all tenders
- [ ] Can create new tender as partner and see it immediately
- [ ] No console errors in browser

