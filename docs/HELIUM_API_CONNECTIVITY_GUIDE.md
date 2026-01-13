# Helium API Connectivity Guide

## Overview

This guide provides comprehensive information about connecting to and troubleshooting the Helium AI API integration in the Tender Management System.

## Quick Start

### 1. Configuration

Create or update `.env.local` file:

```bash
AI_API_KEY=he-your-actual-key-here
AI_API_ENDPOINT=https://api.he2.site/api/v1/public
```

**Important:**
- The API key MUST start with `he-`
- Keep the endpoint as shown above (default value)
- Never commit `.env.local` to version control

### 2. Test Connection

#### Option A: Web Interface
1. Start the dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/test-api`
3. Click "Test Connection" button
4. Review results

#### Option B: CLI Test
```bash
npx ts-node test-helium-connection.ts
```

#### Option C: API Endpoint
```bash
curl http://localhost:3000/api/ai/test-connection
```

## Connection Tests Explained

### Test 1: Environment Configuration
**Purpose:** Validates that API credentials are properly configured

**Checks:**
- ✅ API key is present
- ✅ API key format is valid (starts with `he-`)
- ✅ API endpoint is configured
- ✅ Environment variables are loaded

**Common Issues:**
- ❌ API key not found → Create `.env.local` file
- ⚠️ Invalid format → Ensure key starts with `he-`

### Test 2: Network Connectivity
**Purpose:** Ensures server can reach Helium API

**Checks:**
- ✅ Can reach `https://api.he2.site`
- ✅ Network latency is acceptable
- ✅ No firewall blocking

**Common Issues:**
- ❌ Network unreachable → Check internet connection
- ❌ Timeout → Check firewall/VPN settings
- ⚠️ High latency → May impact performance

### Test 3: API Key Validation
**Purpose:** Verifies API key is valid and authorized

**Checks:**
- ✅ API accepts the key
- ✅ Can create quick-action task
- ✅ Receives project_id and thread_id

**Common Issues:**
- ❌ 401 Unauthorized → Invalid API key
- ❌ 403 Forbidden → Key lacks permissions
- ❌ 429 Too Many Requests → Rate limited

### Test 4: Response Polling
**Purpose:** Tests ability to retrieve AI responses

**Checks:**
- ✅ Can poll for task status
- ✅ Receives status updates
- ✅ Can detect completion

**Common Issues:**
- ⚠️ SSE format received → API sends server-sent events
- ⚠️ Timeout → Task still processing
- ❌ Parse error → Response format unexpected

### Test 5: SSE Streaming
**Purpose:** Tests real-time streaming capabilities

**Checks:**
- ✅ Streaming endpoint accessible
- ✅ Can handle SSE format
- ✅ Real-time updates work

**Common Issues:**
- ⚠️ Not supported → Use standard polling
- ⚠️ Connection drops → Implement retry logic

### Test 6: Files Endpoint
**Purpose:** Verifies file retrieval functionality

**Checks:**
- ✅ Files endpoint accessible
- ✅ Can list workspace files
- ✅ Can download files

**Common Issues:**
- ⚠️ No files → Normal for test requests
- ❌ Access denied → Check permissions

## API Response Formats

The Helium API can return responses in two formats:

### JSON Format (Preferred)
```json
{
  "success": true,
  "thread_id": "uuid",
  "project_id": "uuid",
  "status": "completed",
  "response": {
    "content": "AI response text"
  },
  "has_files": false,
  "has_code": false
}
```

### SSE Format (Streaming)
```
data: {"message": "Processing...", "status": "running"}

data: {"message": "Complete", "status": "completed", "content": "..."}
```

## Common Issues & Solutions

### Issue: "Unexpected token 'd', "data: {"me"... is not valid JSON"

**Cause:** API is returning SSE format but code is trying to parse as JSON

**Solution:**
```typescript
// ✅ Good - Handle both formats
const contentType = response.headers.get('content-type');
if (contentType?.includes('application/json')) {
  data = await response.json();
} else if (contentType?.includes('text/event-stream')) {
  const text = await response.text();
  const lines = text.split('\n').filter(line => line.startsWith('data: '));
  const jsonStr = lines[lines.length - 1].substring(6);
  data = JSON.parse(jsonStr);
}
```

### Issue: "Status completed but no content"

**Cause:** AI hasn't finished generating content yet

**Solutions:**
1. Continue polling (content arrives later)
2. Check `has_files` and `has_code` flags
3. Use `/threads/{id}/files` endpoint
4. Increase poll interval

**Example:**
```typescript
if (response.status === 'completed') {
  // Check multiple content sources
  const content = response.response?.content || 
                 response.content || 
                 response.message;
                 
  if (!content && response.has_files) {
    // Fetch files separately
    const files = await fetchWorkspaceFiles(threadId, projectId);
  }
}
```

### Issue: API Key Invalid

**Symptoms:**
- 401 Unauthorized
- 403 Forbidden
- "Invalid API key" error

**Solutions:**
1. Verify key format: `he-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
2. Check for extra spaces/newlines
3. Ensure key is active (not expired)
4. Regenerate key from Helium dashboard
5. Verify environment file is loaded:
   ```bash
   node -e "require('dotenv').config({path:'.env.local'}); console.log(process.env.AI_API_KEY)"
   ```

### Issue: Long Polling Times

**Symptoms:**
- Takes 10+ minutes to get response
- Multiple "Status completed but no content" messages

**Explanations:**
- AI model is still generating (normal for complex tasks)
- Large outputs take time to process
- Network latency affecting timing

**Solutions:**
1. Increase timeout values
2. Use infinite polling loop (not time-limited)
3. Implement progress indicators
4. Use SSE streaming for real-time updates

### Issue: Network Errors

**Symptoms:**
- "fetch failed"
- "ENOTFOUND" errors
- Connection timeouts

**Solutions:**
1. Check internet connection
2. Verify DNS resolution: `nslookup api.he2.site`
3. Test direct connection: `curl https://api.he2.site/health`
4. Check firewall/proxy settings
5. Try different network (VPN off/on)

## Best Practices

### 1. Error Handling
```typescript
try {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000) // 30s timeout
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HTTP ${response.status}: ${error}`);
  }
  
  // Handle both JSON and SSE
  const contentType = response.headers.get('content-type');
  // ... parse accordingly
  
} catch (error: any) {
  if (error.name === 'AbortError') {
    console.error('Request timeout');
  } else if (error.message.includes('JSON')) {
    console.error('Parse error - may be SSE format');
  } else {
    console.error('Network error:', error.message);
  }
}
```

### 2. Polling Strategy
```typescript
// ✅ Infinite polling with backoff
let attempts = 0;
while (true) {
  attempts++;
  
  try {
    const data = await pollStatus();
    
    if (data.status === 'completed' && hasContent(data)) {
      return data;
    }
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(1.5, attempts), 30000);
    await sleep(delay);
    
  } catch (error) {
    // Log error but continue
    console.warn(`Attempt ${attempts} failed, retrying...`);
    await sleep(10000);
  }
}
```

### 3. Content Extraction
```typescript
function extractContent(apiResponse: any): string {
  // Try multiple sources
  const sources = [
    apiResponse.response?.content,
    apiResponse.content,
    apiResponse.message,
    extractFromCodeBlocks(apiResponse.code_blocks),
    extractFromFiles(apiResponse.files)
  ];
  
  return sources.find(s => s && s.length > 0) || '';
}
```

### 4. Logging
```typescript
// ✅ Structured logging with context
console.log('📡 API Request', {
  endpoint: url,
  method: 'GET',
  threadId,
  projectId,
  attempt: attempts
});

console.log('📥 API Response', {
  status: data.status,
  hasContent: !!data.response?.content,
  hasFiles: data.has_files,
  hasCode: data.has_code,
  waited: data.waited_seconds
});
```

## Monitoring & Debugging

### Enable Debug Mode
```bash
# .env.local
DEBUG=helium:*
LOG_LEVEL=debug
```

### Check Request/Response
```typescript
// Log full request
console.log('Request:', {
  url,
  headers: { 'X-API-Key': apiKey.substring(0, 10) + '...' },
  body: formData.get('prompt')
});

// Log full response
const text = await response.text();
console.log('Response:', {
  status: response.status,
  headers: Object.fromEntries(response.headers),
  body: text
});
```

### Browser DevTools
1. Open Network tab
2. Filter by "api.he2.site"
3. Check request headers (API key present?)
4. Check response (status code, content-type)
5. Look for CORS errors

### Server Logs
```bash
# Watch logs in real-time
npm run dev | grep -E "(API|Helium|📡|✅|❌)"
```

## API Endpoints Reference

### Quick Action (Create Task)
```bash
POST https://api.he2.site/api/v1/public/quick-action
Headers:
  X-API-Key: he-your-key-here
Body (FormData):
  prompt: "Your task description"
  source: "app-name"
  enable_thinking: "true" (optional)
  reasoning_effort: "high" (optional)

Response:
{
  "success": true,
  "project_id": "uuid",
  "thread_id": "uuid",
  "agent_run_id": "uuid",
  "message": "Task created and execution started"
}
```

### Get Response (Polling)
```bash
GET https://api.he2.site/api/v1/public/threads/{thread_id}/response
Query Params:
  project_id: "uuid" (required)
  timeout: 30 (optional, seconds)
  include_file_content: true (optional)
Headers:
  X-API-Key: he-your-key-here
  Accept: application/json

Response:
{
  "success": true,
  "status": "completed|running|failed",
  "response": {
    "content": "AI response"
  },
  "has_files": false,
  "has_code": false,
  "waited_seconds": 45
}
```

### List Files
```bash
GET https://api.he2.site/api/v1/public/threads/{thread_id}/files
Query Params:
  project_id: "uuid" (required)
Headers:
  X-API-Key: he-your-key-here

Response:
{
  "success": true,
  "files": [
    {
      "file_id": "uuid",
      "file_name": "output.html",
      "file_size": 12345,
      "file_type": "text/html"
    }
  ]
}
```

### Download File
```bash
GET https://api.he2.site/api/v1/public/files/{file_id}
Query Params:
  project_id: "uuid" (required)
  thread_id: "uuid" (required)
Headers:
  X-API-Key: he-your-key-here

Response:
{
  "success": true,
  "file": {
    "file_name": "output.html",
    "content": "<!DOCTYPE html>...",
    "file_size": 12345,
    "file_type": "text/html"
  }
}
```

## Rate Limits

The Helium API implements rate limiting:

- **Quick Action:** ~10 requests/minute per key
- **Polling:** Unlimited (recommended: 5-10s intervals)
- **File Downloads:** ~100 requests/minute

If you hit rate limits:
- Implement exponential backoff
- Cache responses when possible
- Use webhooks instead of polling (if available)

## Security Best Practices

1. **Never expose API key:**
   ```typescript
   // ❌ Bad
   const apiKey = 'he-abc123...';
   
   // ✅ Good
   const apiKey = process.env.AI_API_KEY!;
   ```

2. **Server-side only:**
   - Never send API key to frontend
   - All API calls from backend/server routes
   - Use session tokens for client auth

3. **Validate responses:**
   ```typescript
   // Validate before using
   if (!data || !data.success) {
     throw new Error('Invalid API response');
   }
   ```

4. **Sanitize outputs:**
   ```typescript
   // Clean AI-generated content
   const sanitized = DOMPurify.sanitize(aiContent);
   ```

## Getting Help

### Check Documentation
- [Helium AI Docs](https://api.he2.site/docs)
- [API Reference](../refrence-doc/COMPREHENSIVE_API_DOCUMENTATION.md)
- [Complete Guide](../refrence-doc/Helium_AI_Complete_Documentation.md)

### Debug Checklist
- [ ] API key is set in `.env.local`
- [ ] API key starts with `he-`
- [ ] Server is running (`npm run dev`)
- [ ] Can reach `https://api.he2.site`
- [ ] Network/firewall allows HTTPS
- [ ] Request headers include `X-API-Key`
- [ ] Response parsing handles both JSON and SSE

### Contact Support
If all else fails:
1. Run full diagnostic: `npx ts-node test-helium-connection.ts`
2. Check browser console and server logs
3. Contact Helium support with error details
4. Include: API key prefix, error message, timestamp

---

**Last Updated:** 2024-12-23



