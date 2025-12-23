# AI Streaming Flow Diagram

## Complete Request Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          USER INTERACTION                                     │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                        User clicks "Generate with AI"
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 1: INITIATE GENERATION                              │
│                                                                              │
│  Frontend (proposals/page.tsx)                                              │
│  ─────────────────────────────                                              │
│  generateProposal(tenderId)                                                 │
│         │                                                                    │
│         ▼                                                                    │
│  POST /api/tenders/[id]/generate-proposal                                   │
│         │                                                                    │
│         ▼                                                                    │
│  Backend (generate-proposal/route.ts)                                       │
│  ─────────────────────────────────────                                      │
│  1. Fetch tender from database                                              │
│  2. Build comprehensive prompt                                              │
│  3. Create FormData with prompt                                             │
│         │                                                                    │
│         ▼                                                                    │
│  POST https://api.he2.site/api/v1/public/quick-action                       │
│  Headers: X-API-Key: he-xxxxxxx                                             │
│  Body: FormData {                                                           │
│    prompt: "Create proposal for...",                                        │
│    source: "tender-management-system",                                      │
│    enable_thinking: true,                                                   │
│    reasoning_effort: "medium"                                               │
│  }                                                                           │
│         │                                                                    │
│         ▼                                                                    │
│  Response: {                                                                │
│    success: true,                                                           │
│    project_id: "proj_123",      ◄─── SAVE THESE                            │
│    thread_id: "thread_456",     ◄─── SAVE THESE                            │
│    agent_run_id: "run_789"      ◄─── SAVE THESE                            │
│  }                                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 2: ESTABLISH STREAM                                 │
│                                                                              │
│  Frontend receives { project_id, thread_id, agent_run_id }                 │
│         │                                                                    │
│         ▼                                                                    │
│  const streamUrl = `/api/ai/stream-response                                 │
│    ?thread_id=${thread_id}&project_id=${project_id}`                       │
│         │                                                                    │
│         ▼                                                                    │
│  const eventSource = new EventSource(streamUrl)                             │
│         │                                                                    │
│         ▼                                                                    │
│  Backend (stream-response/route.ts)                                         │
│  ───────────────────────────────────                                        │
│  GET /api/ai/stream-response?thread_id=xxx&project_id=xxx                   │
│         │                                                                    │
│         ▼                                                                    │
│  Proxy to Helium:                                                           │
│  GET https://api.he2.site/api/v1/public/threads/{thread_id}/response       │
│    ?project_id={project_id}&realtime=true&include_file_content=true        │
│  Headers:                                                                   │
│    X-API-Key: he-xxxxxxx                                                    │
│    Accept: text/event-stream                                                │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 3: STREAMING DATA FLOW                              │
│                                                                              │
│  Helium API ──────► Backend Proxy ──────► Frontend UI                       │
│                                                                              │
│  Event Stream Format (Server-Sent Events):                                  │
│  ─────────────────────────────────────────                                  │
│                                                                              │
│  data: {"type": "connected", "message": "Stream connected"}                 │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "status", "status": "running", "elapsed": 0}                │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "content", "content": "# Executive Summary\n...", "ch..."}  │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "content", "content": "Our analysis shows...", "chunk..."}  │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "content", "content": "## Technical Approach\n...", "c..."}│
│         │                                                                    │
│         ▼                                                                    │
│  ... (many more content chunks) ...                                         │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "status", "status": "completed", "elapsed": 45.3}           │
│         │                                                                    │
│         ▼                                                                    │
│  data: {"type": "stream_closed", "message": "Stream completed"}             │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 4: CONTENT ACCUMULATION                             │
│                                                                              │
│  Frontend (eventSource.onmessage handler)                                   │
│  ─────────────────────────────────────────                                  │
│                                                                              │
│  let accumulatedContent = ''                                                │
│  let streamingMessageId = null                                              │
│                                                                              │
│  switch (data.type) {                                                       │
│    case 'connected':                                                        │
│      → Show "Stream connected" message                                      │
│                                                                              │
│    case 'status' (running):                                                 │
│      → Show "AI is generating... (Xs)"                                      │
│                                                                              │
│    case 'content':                                                          │
│      → accumulatedContent += data.content                                   │
│      → Update streaming message bubble with new content                     │
│      → Show typing indicator animation                                      │
│                                                                              │
│    case 'status' (completed):                                               │
│      → Finalize streaming message                                           │
│      → Call parseAndSaveProposal()                                          │
│      → Show "Generation completed" message                                  │
│      → Close EventSource                                                    │
│  }                                                                           │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 5: PARSE & SAVE                                     │
│                                                                              │
│  parseAndSaveProposal(tenderId, accumulatedContent, thread_id, project_id) │
│  ────────────────────────────────────────────────────────────────────────   │
│                                                                              │
│  1. Extract sections using regex:                                           │
│     ┌─────────────────────────────────────────────────┐                    │
│     │ ## Executive Summary        → executiveSummary  │                    │
│     │ ## Requirements             → requirements...   │                    │
│     │ ## Technical Approach       → technicalApproach│                    │
│     │ ## Scope & Deliverables     → scopeCoverage    │                    │
│     │ ## Timeline                 → timeline         │                    │
│     │ ## Investment               → commercialDetails│                    │
│     └─────────────────────────────────────────────────┘                    │
│                                                                              │
│  2. Extract HTML if present:                                                │
│     const htmlMatch = content.match(/```html\s*([\s\S]*?)```/i)            │
│     const websiteHtml = htmlMatch ? htmlMatch[1] : null                     │
│                                                                              │
│  3. Save to database:                                                       │
│     POST /api/tenders/[id]/save-proposal                                    │
│     Body: {                                                                 │
│       executiveSummary: "...",                                              │
│       requirementsUnderstanding: "...",                                     │
│       technicalApproach: "...",                                             │
│       scopeCoverage: "...",                                                 │
│       timeline: "...",                                                      │
│       commercialDetails: "...",                                             │
│       websiteHtml: "...",                                                   │
│       metadata: { threadId, projectId, generatedAt }                        │
│     }                                                                        │
│                                                                              │
│  4. Backend saves to Supabase:                                              │
│     supabaseTenderService.updateProposal(tenderId, sections)                │
└──────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                     STEP 6: DISPLAY RESULTS                                  │
│                                                                              │
│  Frontend shows:                                                            │
│  ───────────────                                                            │
│                                                                              │
│  ✅ Proposal saved successfully                                             │
│  🌐 View Proposal Website                                                   │
│  📄 Download Proposal PDF                                                   │
│                                                                              │
│  User can:                                                                  │
│  • Click "View Website" → /api/tenders/[id]/proposal-website               │
│  • Click "Download PDF" → /api/tenders/[id]/proposal-pdf                   │
│  • Continue chat for modifications                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Visualization

```
┌─────────────┐
│   Browser   │
│   (Client)  │
└──────┬──────┘
       │ 1. POST /api/tenders/[id]/generate-proposal
       ▼
┌─────────────┐
│  Next.js    │
│   Server    │──────► 2. POST Quick Action API
└──────┬──────┘           (with FormData prompt)
       │                          │
       │ 3. { project_id,         │
       │     thread_id,           ▼
       │     agent_run_id }  ┌──────────┐
       │ ◄───────────────────│ Helium   │
       │                     │   AI     │
       │ 4. GET /stream      │   API    │
       ▼                     └─────┬────┘
┌─────────────┐                   │
│  EventSource│                   │
│   (SSE)     │◄──────────────────┘
└──────┬──────┘      5. Real-time chunks
       │             data: { type: "content", ... }
       │             data: { type: "content", ... }
       │             data: { type: "status", ... }
       ▼
┌─────────────┐
│  UI Updates │
│  (Real-time)│
└──────┬──────┘
       │ 6. On completion
       ▼
┌─────────────┐
│  Parse &    │
│   Save      │──────► POST /save-proposal
└──────┬──────┘
       │ 7. Success
       ▼
┌─────────────┐
│  Show Files │
│  Download   │
└─────────────┘
```

## UI State Machine

```
      [IDLE]
         │
         │ Click "Generate with AI"
         ▼
    [INITIATING]
         │
         │ Received { project_id, thread_id }
         ▼
    [CONNECTING]
         │
         │ EventSource opened
         ▼
    [STREAMING]
         │
         ├─► [CONTENT CHUNK] ──► Update UI ──► [STREAMING]
         │
         ├─► [STATUS UPDATE] ──► Show progress ──► [STREAMING]
         │
         │ Status: "completed"
         ▼
     [PARSING]
         │
         │ Parse sections
         ▼
     [SAVING]
         │
         │ POST save-proposal
         ▼
    [COMPLETED]
         │
         ▼
     [DISPLAY FILES]
```

## Error Handling Flow

```
Any Step
   │
   │ Error occurs
   ▼
┌──────────────┐
│ Catch Error  │
└──────┬───────┘
       │
       ├──► API Key Missing ──────► Show "Service not configured"
       │
       ├──► Network Error ─────────► Show "Connection failed" + Retry
       │
       ├──► Stream Error ──────────► Show "Stream lost" + Close
       │
       ├──► Parse Error ───────────► Show "Parse failed" (content still saved)
       │
       └──► Save Error ────────────► Show "Save failed" + Manual retry option
```

## Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Quick Action Caller** | `generate-proposal/route.ts` | Initiates AI task |
| **Stream Proxy** | `stream-response/route.ts` | Proxies SSE stream |
| **Content Parser** | `proposals/page.tsx` | Parses markdown sections |
| **Database Saver** | `save-proposal/route.ts` | Persists to Supabase |
| **UI Handler** | `proposals/page.tsx` | Manages streaming display |

---

**Legend:**
- `→` : Synchronous flow
- `▼` : Sequential step
- `◄─` : Return value
- `─►` : Asynchronous call

