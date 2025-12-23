# Restart Instructions - After API Update

## Issue
Getting 404 error on `/api/ai/stream-response` because the endpoint was renamed to `/api/ai/get-response`.

## Root Cause
The browser may be using cached JavaScript bundle from before the code changes were made.

## Solution

### Step 1: Clear Build Cache
The `.next` directory has been cleared automatically.

### Step 2: Restart Development Server

1. **Stop the current dev server** (if running):
   - Press `Ctrl+C` in the terminal running the dev server

2. **Start fresh**:
   ```bash
   cd /Users/apple/Desktop/tender-management-system
   npm run dev
   ```

### Step 3: Clear Browser Cache

**Option A: Hard Refresh** (Recommended)
- **Mac**: `Cmd + Shift + R`
- **Windows/Linux**: `Ctrl + Shift + R`

**Option B: Clear Cache via DevTools**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Option C: Incognito/Private Window**
- Open the app in a new incognito/private window

### Step 4: Verify the Fix

1. Navigate to `/proposals` page
2. Open Browser DevTools → Network tab
3. Click "Generate with AI"
4. Verify you see a request to:
   - ✅ `/api/ai/get-response?thread_id=...&project_id=...&timeout=300`
   - ❌ NOT `/api/ai/stream-response`

## What Changed

### Old Endpoint (Removed)
```
GET /api/ai/stream-response?thread_id=X&project_id=Y
→ SSE streaming endpoint (EventSource)
```

### New Endpoint (Active)
```
GET /api/ai/get-response?thread_id=X&project_id=Y&timeout=300
→ Single HTTP request with long timeout
```

## File Changes Summary

### Renamed
- `/app/api/ai/stream-response/route.ts` → `/app/api/ai/get-response/route.ts`

### Updated
- `/app/proposals/page.tsx` - `generateProposal()` function now uses new endpoint
- `/app/api/ai/get-response/route.ts` - Complete rewrite to use GET thread response

### Unchanged
- `/app/api/ai/get-file/route.ts` - File fetching still works the same
- `/app/api/tenders/[id]/generate-proposal/route.ts` - Quick Action call unchanged

## Quick Test

After restarting, run this in the browser console when on `/proposals`:

```javascript
// Check if the code is updated
console.log('Testing new API endpoint...');
fetch('/api/ai/get-response?thread_id=test&project_id=test&timeout=10')
  .then(r => r.json())
  .then(d => console.log('New endpoint exists!', d))
  .catch(e => console.error('Endpoint issue:', e));
```

You should see a 400 error about "Missing required parameters" which means the endpoint exists (old endpoint would give 404).

## Troubleshooting

### Still Getting 404?

1. **Check if dev server restarted properly**:
   ```bash
   # Kill all node processes
   killall node
   
   # Start fresh
   npm run dev
   ```

2. **Verify the file exists**:
   ```bash
   ls -la app/api/ai/get-response/route.ts
   ```
   Should show the file exists.

3. **Check for TypeScript errors**:
   ```bash
   npm run build
   ```
   Should complete without errors.

4. **Clear browser cache completely**:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Options → Privacy → Clear Data
   - Safari: Develop → Empty Caches

### Network Tab Shows Old Endpoint?

This means the browser is using cached JavaScript:
- Close ALL tabs with the app
- Clear browser cache
- Open in new incognito window
- Try again

### API Returns 400/500 Error?

This is actually progress! The endpoint exists now.
- Check environment variables are set:
  ```bash
  echo $AI_API_KEY
  echo $AI_API_ENDPOINT
  ```
- Verify Helium API credentials are valid
- Check backend logs for detailed error

## Expected Behavior After Fix

### When Generating Proposal:

1. **Initial Call**:
   ```
   POST /api/tenders/[id]/generate-proposal
   → Returns { thread_id, project_id, agent_run_id }
   ```

2. **Polling Call**:
   ```
   GET /api/ai/get-response?thread_id=...&project_id=...&timeout=300
   → Waits up to 300s for AI to complete
   → Returns complete response with content and files
   ```

3. **File Viewing** (if files generated):
   ```
   GET /api/ai/get-file?file_id=...&project_id=...&thread_id=...
   → Returns file content
   ```

### UI Behavior:

1. Click "Generate with AI"
2. See "⏳ Initiating AI generation..."
3. See "✅ AI task created successfully"
4. See "⏳ Waiting for AI to complete execution..."
5. Loading message shows timer: "🤖 AI is generating proposal... (Xs elapsed)"
6. After completion:
   - AI message bubble with formatted content
   - File boxes for any generated files
   - Success message with completion time

## Success Criteria

- ✅ No 404 errors in Network tab
- ✅ `/api/ai/get-response` appears in Network tab
- ✅ Loading indicator shows and updates
- ✅ Content displays with proper formatting
- ✅ Files are clickable
- ✅ File viewer opens correctly

## Need Help?

If still having issues:

1. **Share the Network tab screenshot** showing the failed request
2. **Share browser console errors** (if any)
3. **Share terminal output** from the dev server
4. **Confirm which browser and version** you're using

---

**After following these steps, the app should work correctly with the new API implementation!**

