# Quick Start Guide - AI Proposal Generation

## Setup (One-Time)

1. **Add API Key to Environment:**
   ```bash
   # Create/edit .env.local
   AI_API_KEY=he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AI_API_ENDPOINT=https://api.he2.site/api/v1/public
   ```

2. **Restart Development Server:**
   ```bash
   npm run dev
   ```

## How to Use

### Step 1: Navigate to Proposals
```
http://localhost:3000/proposals
```

### Step 2: Select a Tender
- Left sidebar shows tenders ready for AI generation
- Click on a tender to select it
- Only tenders with completed AI analysis appear

### Step 3: Generate Proposal
- Click the **"Generate with AI"** button (top right)
- Watch the real-time streaming output
- AI generates the proposal in 30-120 seconds

### Step 4: View Results
- **View Website:** Click to see HTML proposal
- **Download PDF:** Click to download PDF version
- Content automatically saved to database

## What Happens Behind the Scenes

1. **Quick Action API Call:**
   - POST to `/api/tenders/[id]/generate-proposal`
   - Helium API creates AI task
   - Returns: `project_id`, `thread_id`, `agent_run_id`

2. **Streaming Connection:**
   - GET to `/api/ai/stream-response?thread_id=xxx&project_id=xxx`
   - Server-Sent Events (SSE) stream
   - Real-time content chunks displayed in UI

3. **Content Processing:**
   - AI generates proposal sections
   - System parses markdown structure
   - Extracts: Executive Summary, Technical Approach, Timeline, etc.

4. **Auto-Save:**
   - POST to `/api/tenders/[id]/save-proposal`
   - Saves all sections to database
   - Generates website and PDF versions

## API Endpoints Created

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tenders/[id]/generate-proposal` | POST | Start AI generation |
| `/api/ai/stream-response` | GET | Stream AI responses |
| `/api/tenders/[id]/save-proposal` | POST | Save completed proposal |

## Stream Event Types

| Event Type | Description |
|------------|-------------|
| `connected` | Stream connection established |
| `status` | AI status update (running/completed/failed) |
| `content` | Real-time content chunk |
| `error` | Error occurred |
| `stream_closed` | Stream ended |

## Example Stream Output

```
✅ AI task created successfully
🔗 Connecting to real-time stream...
🌊 Stream connected - receiving AI response...
🤖 AI is generating... (10s)
📝 [Content streams in real-time...]
✅ Generation completed in 45s
💾 Parsing and saving proposal...
✅ Proposal saved successfully
🌐 View Proposal Website
📄 Download Proposal PDF
```

## Generated Proposal Sections

The AI generates 6 main sections:

1. **Executive Summary** - Compelling introduction
2. **Requirements Understanding** - Client needs analysis
3. **Technical Approach** - Technology stack & methodology
4. **Scope & Deliverables** - Project phases breakdown
5. **Timeline** - 12-16 week project schedule
6. **Commercial Details** - Investment breakdown ($180K-$280K)

## Prompt Customization

The prompt sent to Helium AI includes:

```typescript
- Tender title, description
- Scope of work
- Technical requirements
- Functional requirements
- Client information
- Budget and deadline
```

Location: `app/api/tenders/[id]/generate-proposal/route.ts`
Function: `buildProposalPrompt()`

## Troubleshooting

### Issue: "AI service not configured"
**Solution:** Add `AI_API_KEY` to `.env.local` and restart server

### Issue: Stream not connecting
**Solution:** Check browser console, verify API key is valid

### Issue: No content received
**Solution:** Wait longer (can take 60-120s), check Helium API status

### Issue: Proposal not saving
**Solution:** Check database connectivity, review server logs

## Testing Checklist

- [ ] Environment variables configured
- [ ] Development server running
- [ ] Tender created with AI analysis complete
- [ ] "Generate with AI" button clicked
- [ ] Streaming content visible in chat
- [ ] "Generation completed" message appears
- [ ] Proposal sections saved to database
- [ ] Website link opens HTML proposal
- [ ] PDF link downloads proposal

## File Structure

```
app/
├── api/
│   ├── tenders/[id]/
│   │   ├── generate-proposal/route.ts    ← Initiate generation
│   │   └── save-proposal/route.ts        ← Save completed
│   └── ai/
│       └── stream-response/route.ts      ← Streaming proxy
└── proposals/
    └── page.tsx                          ← UI with streaming

docs/
└── AI_STREAMING_IMPLEMENTATION.md        ← Full documentation
```

## Next Steps

1. **Test the implementation** with a real tender
2. **Monitor streaming output** in browser console
3. **Verify proposal quality** in database
4. **Customize prompt** if needed for better results
5. **Add error handling** for production deployment

## Important Notes

- ⚠️ Helium API key required (get from https://he2.site)
- ⏱️ Generation takes 30-120 seconds typically
- 💰 API calls consume Helium credits
- 🔒 API key never exposed to client
- 📊 All events logged to server console

## Support

Need help? Check:
1. Browser console for client errors
2. Server terminal for API logs
3. `AI_STREAMING_IMPLEMENTATION.md` for details
4. Helium API docs in `refrence-doc/`

---

**Ready to test!** Navigate to `/proposals` and click "Generate with AI" 🚀



