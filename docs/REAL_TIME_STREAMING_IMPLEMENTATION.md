# Real-Time Streaming Implementation

## Overview

This document describes the implementation of real-time AI response streaming using Helium's Public API SSE (Server-Sent Events) capabilities.

## Architecture

### Flow Diagram

```
┌──────────────┐
│   Frontend   │
│  (Browser)   │
└──────┬───────┘
       │
       │ 1. POST /api/tenders/:id/generate-proposal
       ▼
┌────────────────────────────────────┐
│  Next.js API Route                 │
│  (Proposal Generation)             │
│                                    │
│  • Creates quick-action task       │
│  • Returns threadId + projectId    │
└────────────────┬───────────────────┘
                 │
                 │ 2. EventSource connects
                 ▼
┌────────────────────────────────────┐
│  /api/ai/stream/[threadId]         │
│  (SSE Streaming Endpoint)          │
│                                    │
│  • Connects to Helium API          │
│  • Streams events in real-time     │
└────────────────┬───────────────────┘
                 │
                 │ 3. realtime=true SSE stream
                 ▼
┌────────────────────────────────────┐
│  Helium Public API                 │
│  https://api.he2.site              │
│                                    │
│  GET /threads/:id/response         │
│  ?realtime=true                    │
└────────────────────────────────────┘
```

## Implementation Details

### 1. Backend: SSE Streaming Endpoint

**File:** `app/api/ai/stream/[threadId]/route.ts`

#### Key Features:
- **Native SSE Streaming**: Uses Helium's `realtime=true` parameter for Server-Sent Events
- **Real-Time Content Chunks**: Streams AI-generated text as it's produced
- **Status Updates**: Provides real-time status information (running, completed, failed)
- **Error Handling**: Gracefully handles connection errors and parsing issues
- **No Polling**: Direct SSE connection eliminates polling overhead

#### Event Types:

```typescript
// Connection events
{
  type: 'connected',
  message: '✅ Connected to AI stream',
  timestamp: number
}

// Status updates from Helium
{
  type: 'status_update',
  status: 'running' | 'completed' | 'failed',
  elapsed: number,
  agentRunId: string
}

// Real-time content chunks
{
  type: 'content_chunk',
  content: string,
  chunkId: number,
  message: '✍️ Receiving AI response...'
}

// Completion event
{
  type: 'complete',
  content: string,
  totalChunks: number,
  message: '🎉 AI generation complete!'
}

// Error events
{
  type: 'error',
  message: string
}
```

#### Implementation:

```typescript
// Use Helium's realtime SSE streaming
const responseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&realtime=true&include_file_content=true`;

const response = await fetch(responseUrl, {
  headers: { 
    'X-API-Key': AI_API_KEY,
    'Accept': 'text/event-stream' // Request SSE format
  }
});

// Process SSE stream from Helium
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split('\n');
  buffer = lines.pop() || '';

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const eventData = JSON.parse(line.substring(6));
      
      // Forward events to client
      if (eventData.type === 'content') {
        send({ 
          type: 'content_chunk', 
          content: eventData.content,
          chunkId: eventData.chunk_id
        });
      }
    }
  }
}
```

### 2. Backend: Chat Follow-up with Streaming

**File:** `app/api/ai/chat-followup/route.ts`

#### Features:
- **Dual Mode**: Supports both streaming and non-streaming responses
- **SSE Integration**: Processes Helium's SSE stream for follow-up messages
- **Automatic Aggregation**: Collects all content chunks into final response

#### Usage:

```typescript
// Request streaming mode
POST /api/ai/chat-followup
{
  threadId: string,
  projectId: string,
  prompt: string,
  stream: true  // Request streaming mode
}

// Response
{
  success: true,
  streamUrl: '/api/ai/stream/[threadId]?projectId=...',
  agentRunId: string
}
```

### 3. Frontend: Real-Time UI Updates

**File:** `app/proposals/page.tsx`

#### Key Features:
- **Live Content Streaming**: Updates message in real-time as chunks arrive
- **Visual Feedback**: Shows "AI is writing..." indicator during streaming
- **Chunk Aggregation**: Combines all chunks into final message
- **Error Recovery**: Handles connection loss gracefully

#### Implementation:

```typescript
// Track streaming content
let streamingContent = '';
let streamingMessageId: string | null = null;

const eventSource = new EventSource(`/api/ai/stream/${threadId}?projectId=${projectId}`);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'content_chunk':
      // Real-time streaming content chunk
      streamingContent += data.content || '';
      
      // Update or create streaming message
      if (streamingMessageId) {
        // Update existing message
        setChatMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId
            ? { ...msg, content: `✍️ **AI is writing...**\n\n${streamingContent}` }
            : msg
        ));
      } else {
        // Create new streaming message
        const newMsg = {
          id: 'streaming-' + Date.now(),
          type: 'assistant',
          content: `✍️ **AI is writing...**\n\n${streamingContent}`,
          timestamp: new Date()
        };
        streamingMessageId = newMsg.id;
        setChatMessages(prev => [...prev, newMsg]);
      }
      break;
      
    case 'complete':
      // Finalize streaming message
      if (streamingMessageId && streamingContent) {
        setChatMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId
            ? { ...msg, content: streamingContent }
            : msg
        ));
      }
      break;
  }
};
```

## API Endpoints

### 1. Start Generation with Streaming

```http
POST /api/tenders/:id/generate-proposal
Content-Type: application/json

Response:
{
  "success": true,
  "proposal": {
    "metadata": {
      "threadId": "thread_abc123",
      "projectId": "proj_xyz789"
    }
  }
}
```

### 2. Connect to SSE Stream

```http
GET /api/ai/stream/[threadId]?projectId=proj_xyz789
Accept: text/event-stream

Response: (Server-Sent Events stream)
data: {"type":"connected","message":"✅ Connected to AI stream"}

data: {"type":"status_update","status":"running","elapsed":0}

data: {"type":"content_chunk","content":"# Executive Summary\n\n","chunkId":1}

data: {"type":"content_chunk","content":"Neural Arc Inc is pleased...","chunkId":2}

data: {"type":"complete","content":"Full content...","totalChunks":42}
```

### 3. Send Follow-up with Streaming

```http
POST /api/ai/chat-followup
Content-Type: application/json

{
  "threadId": "thread_abc123",
  "projectId": "proj_xyz789",
  "prompt": "Add pricing details",
  "stream": true
}

Response:
{
  "success": true,
  "streamUrl": "/api/ai/stream/thread_abc123?projectId=proj_xyz789",
  "agentRunId": "run_def456"
}
```

## Benefits

### 1. **Instant Feedback**
- Users see AI responses as they're being generated
- No waiting for complete response before seeing anything
- Better perceived performance

### 2. **Real-Time Progress**
- Live status updates show AI is actively working
- Elapsed time tracking provides transparency
- Content appears progressively, like ChatGPT

### 3. **Better UX**
- Visual "AI is writing..." indicator
- Content streams in naturally
- Users can start reading while AI continues generating

### 4. **No Polling Overhead**
- Direct SSE connection eliminates polling
- Lower server load
- Faster response times

### 5. **Error Transparency**
- Real-time error reporting
- Connection status monitoring
- Graceful degradation

## Configuration

### Environment Variables

```env
# Helium API Configuration
AI_API_KEY=he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_API_ENDPOINT=https://api.he2.site/api/v1/public
```

### Next.js Route Configuration

```typescript
// Enable long-running routes for streaming
export const maxDuration = 1800; // 30 minutes
export const dynamic = 'force-dynamic';
```

## Testing

### Test Streaming Endpoint

```bash
# Test SSE stream directly
curl -N -H "Accept: text/event-stream" \
  "http://localhost:3000/api/ai/stream/thread_abc123?projectId=proj_xyz789"
```

### Test in Browser

1. Generate a proposal from the UI
2. Open DevTools Network tab
3. Look for EventSource connection to `/api/ai/stream/[threadId]`
4. Watch real-time events as they arrive

### Expected Behavior

✅ **Correct:**
- Connection established immediately
- Status updates appear every few seconds
- Content chunks stream in real-time
- Message updates as chunks arrive
- Final "complete" event closes stream

❌ **Incorrect:**
- Long delay before first event
- No content chunks (only final response)
- Connection errors or timeouts
- Missing content in final message

## Troubleshooting

### Issue: No Streaming, Only Final Response

**Cause**: Helium API not in realtime mode

**Solution**: Verify `realtime=true` parameter is set

```typescript
const responseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&realtime=true`;
```

### Issue: EventSource Connection Fails

**Cause**: CORS or network configuration

**Solution**: Check headers and NGINX configuration

```typescript
return new Response(stream, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no', // Disable nginx buffering
  },
});
```

### Issue: Content Not Updating in UI

**Cause**: Message ID not matching or state not updating

**Solution**: Verify streamingMessageId is set and used correctly

```typescript
// Create message once
if (!streamingMessageId) {
  const newMsg = { id: 'streaming-' + Date.now(), ... };
  streamingMessageId = newMsg.id;
  setChatMessages(prev => [...prev, newMsg]);
}

// Update same message by ID
setChatMessages(prev => prev.map(msg => 
  msg.id === streamingMessageId ? { ...msg, content: streamingContent } : msg
));
```

### Issue: Parse Errors in Stream

**Cause**: Malformed SSE data or JSON

**Solution**: Add error handling and logging

```typescript
try {
  const eventData = JSON.parse(jsonStr);
  // Process event
} catch (parseError) {
  console.error('Parse error:', parseError.message);
  send({ 
    type: 'parse_error', 
    message: `⚠️ Parse error: ${parseError.message}`,
    rawData: jsonStr.substring(0, 100)
  });
}
```

## Performance Considerations

### 1. **Connection Management**
- One EventSource per generation session
- Properly close connections when complete
- Handle reconnection on network issues

### 2. **Memory Management**
- Aggregate chunks efficiently
- Clear large content after processing
- Limit max message size

### 3. **UI Performance**
- Debounce rapid content updates if needed
- Use React.memo for message components
- Virtualize long message lists

### 4. **Network Efficiency**
- SSE uses single long-lived connection
- No polling overhead
- Efficient binary transfer with TextDecoder

## Security Considerations

1. **API Key Protection**: Never expose API key client-side
2. **Authentication**: Verify user owns tender/thread
3. **Rate Limiting**: Implement per-user rate limits
4. **Input Validation**: Sanitize all user inputs
5. **Content Filtering**: Validate streamed content if needed

## Future Enhancements

1. **Markdown Rendering**: Parse and render markdown in real-time
2. **Code Syntax Highlighting**: Highlight code blocks as they stream
3. **File Preview**: Show file previews as they're generated
4. **Voice Streaming**: Add audio narration of responses
5. **Collaborative Editing**: Multi-user real-time editing

## References

- [Helium Public API Documentation](../refrence-doc/COMPREHENSIVE_API_DOCUMENTATION.md)
- [Server-Sent Events (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [EventSource API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
- [Next.js Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

---

**Last Updated**: December 23, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready



