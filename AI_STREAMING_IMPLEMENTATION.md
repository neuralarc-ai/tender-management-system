# AI Proposal Generation with Real-Time Streaming

## Overview

This implementation integrates Helium AI's public API to generate comprehensive proposals with real-time streaming capabilities. When you click "Generate with AI" in the `/proposals` page, the system:

1. Calls Helium's **Quick Action API** to initiate proposal generation
2. Receives `project_id`, `thread_id`, and `agent_run_id`
3. Connects to Helium's **streaming endpoint** with `realtime=true`
4. Displays AI-generated content in real-time as it streams
5. Parses and saves the completed proposal to the database

## Architecture

```
User clicks "Generate with AI"
         ↓
POST /api/tenders/[id]/generate-proposal
         ↓
Helium Quick Action API (Form-Data)
         ↓
Returns: { project_id, thread_id, agent_run_id }
         ↓
GET /api/ai/stream-response?thread_id=xxx&project_id=xxx
         ↓
Helium Streaming API (realtime=true)
         ↓
Server-Sent Events (SSE) → Client UI
         ↓
Parse & Save → POST /api/tenders/[id]/save-proposal
```

## API Endpoints

### 1. Generate Proposal (Initiate)
**Endpoint:** `POST /api/tenders/[id]/generate-proposal`

**Purpose:** Calls Helium Quick Action API to start AI generation

**Request:** No body required (uses tender data from database)

**Response:**
```json
{
  "success": true,
  "message": "AI generation started successfully",
  "project_id": "proj_123",
  "thread_id": "thread_456",
  "agent_run_id": "run_789"
}
```

**Implementation:** `/app/api/tenders/[id]/generate-proposal/route.ts`

### 2. Stream Response (Real-Time)
**Endpoint:** `GET /api/ai/stream-response?thread_id=xxx&project_id=xxx`

**Purpose:** Proxies Helium's streaming API to client

**Response Type:** `text/event-stream` (Server-Sent Events)

**Event Types:**
```typescript
// Connection established
{ type: 'connected', message: 'Stream connected' }

// AI status updates
{ type: 'status', status: 'running', elapsed: 10 }
{ type: 'status', status: 'completed', elapsed: 45 }

// Content chunks (real-time)
{ type: 'content', content: 'Executive Summary...', chunk_id: 1 }
{ type: 'content', content: 'more content...', chunk_id: 2 }

// Errors
{ type: 'error', message: 'Error description' }

// Stream closed
{ type: 'stream_closed', message: 'Stream completed' }
```

**Implementation:** `/app/api/ai/stream-response/route.ts`

### 3. Save Proposal (Finalize)
**Endpoint:** `POST /api/tenders/[id]/save-proposal`

**Purpose:** Saves parsed proposal sections to database

**Request Body:**
```json
{
  "executiveSummary": "...",
  "requirementsUnderstanding": "...",
  "technicalApproach": "...",
  "scopeCoverage": "...",
  "timeline": "...",
  "commercialDetails": "...",
  "websiteHtml": "...",
  "pdfContent": "..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Proposal saved successfully"
}
```

**Implementation:** `/app/api/tenders/[id]/save-proposal/route.ts`

## Frontend Implementation

### Proposals Page (`/app/proposals/page.tsx`)

**Key Features:**

1. **Tender Selection:** Choose from analyzed tenders
2. **Generate Button:** Initiates AI generation with streaming
3. **Real-Time Display:** Shows content as it streams from AI
4. **Auto-Save:** Parses and saves completed proposal
5. **File Links:** Provides download links for website/PDF

**Stream Event Handling:**

```typescript
const eventSource = new EventSource(streamUrl);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'connected':
      // Stream established
      break;
      
    case 'status':
      // AI status (running/completed/failed)
      if (data.status === 'completed') {
        // Save proposal
        await parseAndSaveProposal(...);
      }
      break;
      
    case 'content':
      // Real-time content chunk
      accumulatedContent += data.content;
      // Update UI with streaming message
      break;
      
    case 'error':
      // Handle errors
      break;
  }
};
```

**Content Parsing:**

The system extracts proposal sections from markdown:
- Executive Summary
- Requirements Understanding
- Technical Approach
- Scope & Deliverables
- Timeline
- Commercial Details

HTML code blocks are also extracted for website generation.

## Environment Configuration

Required environment variables in `.env.local`:

```bash
# Helium AI API Configuration
AI_API_KEY=he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AI_API_ENDPOINT=https://api.he2.site/api/v1/public
```

Get your API key from: [Helium AI Console](https://he2.site)

## User Flow

### 1. Select Tender
- Navigate to `/proposals`
- Choose a tender from the left sidebar
- Only tenders with completed AI analysis are shown

### 2. Generate Proposal
- Click "Generate with AI" button
- System shows "Initiating AI generation..."
- Stream connection established

### 3. Watch Real-Time Generation
- Content appears in chat as AI generates it
- Streaming indicator shows AI is actively writing
- Status updates every few seconds

### 4. Completion
- "Generation completed" message appears
- Proposal is automatically parsed and saved
- Download links appear for website and PDF

### 5. View Results
- Click "View Website" to see HTML proposal
- Click "Download PDF" to get PDF version
- Chat history preserved for reference

## Streaming Response Format (Helium API)

According to the Helium API documentation:

### Real-Time Streaming Mode (`realtime=true`)

**Request:**
```bash
curl -X GET "https://api.he2.site/api/v1/public/threads/{thread_id}/response?project_id={project_id}&realtime=true" \
  -H "X-API-Key: he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \
  -H "Accept: text/event-stream"
```

**Response Events:**
```
data: {"type": "status", "status": "running", "agent_run_id": "run_789", "elapsed": 0}
data: {"type": "content", "content": "First chunk...", "chunk_id": 1}
data: {"type": "content", "content": "Second chunk...", "chunk_id": 2}
data: {"type": "status", "status": "completed", "elapsed": 25.3}
```

## Prompt Engineering

The system generates a comprehensive prompt including:

```
- Tender title and description
- Scope of work
- Technical requirements
- Functional requirements
- Client information
- Budget and timeline

Instructions for AI:
1. Executive Summary (3-4 paragraphs)
2. Requirements Understanding
3. Technical Approach (stack, methodology, QA)
4. Scope & Deliverables (phases)
5. Timeline (12-16 weeks breakdown)
6. Investment ($180K-$280K with breakdown)

Portfolio references: ipc.he2.ai, ers.he2.ai
```

## Error Handling

The system handles various error scenarios:

1. **API Key Missing:** Returns 500 with clear message
2. **Helium API Error:** Displays API error details
3. **Stream Connection Lost:** Shows warning and allows retry
4. **Parsing Failure:** Saves raw content, warns user
5. **Save Failure:** Content generated but save failed warning

## Testing

To test the complete flow:

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Configure Environment:**
   - Add `AI_API_KEY` to `.env.local`
   - Ensure Supabase is configured

3. **Create Test Tender:**
   - Navigate to admin dashboard
   - Create a new tender with complete details
   - Wait for AI analysis to complete

4. **Generate Proposal:**
   - Go to `/proposals`
   - Select the tender
   - Click "Generate with AI"
   - Watch the streaming output
   - Verify proposal is saved

5. **Verify Results:**
   - Check that all sections are populated
   - Download PDF and verify formatting
   - View website and verify styling

## Performance Considerations

1. **Stream Buffer Size:** Chunks are accumulated efficiently
2. **UI Updates:** Debounced to prevent excessive re-renders
3. **Connection Timeout:** 5-minute default (adjustable)
4. **Retry Logic:** Automatic reconnection on transient errors
5. **Error Recovery:** Graceful degradation if streaming fails

## Security

1. **API Key Protection:** Never exposed to client
2. **Server-Side Proxy:** All Helium API calls from backend
3. **User Authentication:** Protected routes require login
4. **Input Validation:** All tender data sanitized
5. **CORS Headers:** Proper SSE headers configured

## Future Enhancements

Possible improvements:

1. **Follow-up Chat:** Interactive proposal modifications
2. **Section Regeneration:** Regenerate specific sections only
3. **Template Selection:** Choose from proposal templates
4. **Multi-language:** Generate proposals in multiple languages
5. **Version History:** Track proposal iterations
6. **Collaborative Editing:** Multiple users editing simultaneously

## Troubleshooting

### Stream Not Connecting
- Verify `AI_API_KEY` is set correctly
- Check network connectivity to Helium API
- Inspect browser console for SSE errors

### Content Not Saving
- Check database connectivity
- Verify tender exists in database
- Review server logs for parsing errors

### Slow Generation
- Helium AI typically takes 30-120 seconds
- Complex tenders may take longer
- Check API status at he2.site

### No Content Received
- Verify Helium API subscription is active
- Check API rate limits
- Review Helium dashboard for errors

## Support

- **Helium API Docs:** [COMPREHENSIVE_API_DOCUMENTATION.md](./refrence-doc/COMPREHENSIVE_API_DOCUMENTATION.md)
- **Helium Console:** https://he2.site
- **API Status:** Check Helium dashboard
- **Community:** Helium Discord/Support channels

## Credits

- **AI Provider:** Helium AI (https://he2.site)
- **Streaming Protocol:** Server-Sent Events (SSE)
- **Framework:** Next.js 14 with App Router
- **Database:** Supabase PostgreSQL
- **UI Library:** shadcn/ui + Tailwind CSS

---

**Last Updated:** December 23, 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready

