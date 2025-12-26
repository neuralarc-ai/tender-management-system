# Testing Guide - New AI API Implementation

## Quick Start Testing

### Prerequisites
1. Ensure environment variables are set:
   ```env
   AI_API_KEY=he-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AI_API_ENDPOINT=https://api.he2.site/api/v1/public
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Navigate to the AI Proposals page:
   ```
   http://localhost:3000/proposals
   ```

## Test Scenarios

### Scenario 1: Basic Proposal Generation

#### Steps:
1. **Login** to the application
2. **Navigate** to AI Proposals page (`/proposals`)
3. **Select** a tender from the left panel
   - Look for tenders with "Ready for generation" status
   - Match score should be visible
4. **Click** "Generate with AI" button
5. **Observe** the loading state:
   - Should show "⏳ Initiating AI generation..."
   - Then "✅ AI task created successfully"
   - Then "⏳ Waiting for AI to complete execution..."
   - Timer should update every 2 seconds showing elapsed time
6. **Wait** for completion (typically 30-120 seconds)
7. **Verify** the response:
   - AI message bubble appears with formatted content
   - Content has proper headings (bold, larger text)
   - Bullet points are formatted with • symbols
   - Numbered lists show numbers
   - Proper spacing between sections

#### Expected Results:
- ✅ Loading indicator shows progress
- ✅ Content displays with proper markdown formatting
- ✅ Success message shows completion time
- ✅ "Proposal saved successfully" message appears
- ✅ File boxes appear for generated files

### Scenario 2: File Display and Viewing

#### Steps:
1. **After proposal generation**, look for file boxes in the chat
2. **Observe** file box styling:
   - Should have gradient background (blue for images, green for HTML, red for PDF)
   - Shows file icon in a colored circle
   - Displays file name, type, and size
   - Has arrow icon on the right
3. **Hover** over a file box:
   - Should slightly scale up
   - Arrow should change color to passion (pink/red)
4. **Click** on a file box
5. **Verify** modal opens:
   - Shows file name in header
   - Displays file type
   - Shows loading spinner initially
6. **Wait** for file to load
7. **Verify** file content based on type:
   - **Text files**: Should display formatted text
   - **Images**: Should show the image
   - **PDFs**: Should show PDF viewer
   - **HTML**: Should display HTML source code
8. **Click** close button (X) to dismiss modal

#### Expected Results:
- ✅ File boxes are visually appealing and color-coded
- ✅ Hover effects work smoothly
- ✅ Modal opens on click
- ✅ File content loads and displays correctly
- ✅ Modal closes cleanly

### Scenario 3: Content Formatting Verification

#### Create a test message with various markdown:

**Test Content:**
```markdown
# Main Heading

This is a paragraph with normal text.

## Secondary Heading

- First bullet point
- Second bullet point
- Third bullet point

### Tertiary Heading

1. First numbered item
2. Second numbered item
3. Third numbered item

**Bold Text Section**

Regular paragraph after bold.
```

#### Steps:
1. Verify headings render with different sizes
2. Check bullet points have • symbols
3. Verify numbered lists show numbers
4. Confirm bold text is properly emphasized
5. Check spacing between elements

#### Expected Results:
- ✅ H1: Largest, bold, with margin
- ✅ H2: Medium, bold, with margin
- ✅ H3: Smaller, bold, with margin
- ✅ Bullets: • symbol in passion color
- ✅ Numbers: Colored and aligned
- ✅ Proper vertical spacing throughout

### Scenario 4: Error Handling

#### Test 1: Invalid Thread ID
```javascript
// Manually test by modifying URL or state
// Expected: Clear error message
```

#### Test 2: Timeout
- Set a very short timeout (if testing manually)
- Expected: Timeout message appears

#### Test 3: Network Error
- Disconnect network mid-request
- Expected: Error message with retry suggestion

#### Expected Results:
- ✅ All errors show user-friendly messages
- ✅ No crashes or white screens
- ✅ Loading state properly cleared on error
- ✅ Can retry after error

### Scenario 5: Follow-up Chat

#### Steps:
1. **After initial proposal generation**, type a message in the chat input
   - Example: "Make the executive summary shorter"
   - Example: "Add more technical details"
2. **Press Enter** or click send button
3. **Observe** loading state
4. **Wait** for AI response
5. **Verify** response appears with proper formatting

#### Expected Results:
- ✅ Message sends successfully
- ✅ Loading indicator shows
- ✅ Response arrives with formatted content
- ✅ Chat history maintained
- ✅ New files appear if generated

## API Endpoint Testing

### Test API Routes Directly

#### 1. Test Generate Proposal
```bash
curl -X POST "http://localhost:3000/api/tenders/TENDER_ID/generate-proposal" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "AI generation started successfully",
  "project_id": "proj_xxx",
  "thread_id": "thread_xxx",
  "agent_run_id": "run_xxx"
}
```

#### 2. Test Get Response
```bash
curl -X GET "http://localhost:3000/api/ai/get-response?thread_id=THREAD_ID&project_id=PROJECT_ID&timeout=300"
```

**Expected Response:**
```json
{
  "success": true,
  "thread_id": "thread_xxx",
  "project_id": "proj_xxx",
  "status": "completed",
  "response": {
    "role": "assistant",
    "content": "Generated proposal content...",
    "message_id": "msg_xxx",
    "created_at": "2024-01-01T10:00:30Z"
  },
  "has_files": true,
  "files": [
    {
      "file_id": "file_xxx",
      "file_name": "proposal.txt",
      "file_type": "text/plain",
      "file_size": 1024
    }
  ],
  "waited_seconds": 45.5
}
```

#### 3. Test Get File
```bash
curl -X GET "http://localhost:3000/api/ai/get-file?file_id=FILE_ID&project_id=PROJECT_ID&thread_id=THREAD_ID"
```

**Expected Response:**
```json
{
  "success": true,
  "file": {
    "file_id": "file_xxx",
    "file_name": "proposal.txt",
    "file_type": "text/plain",
    "file_size": 1024,
    "content": "File content here...",
    "encoding": "utf-8",
    "included_inline": true
  }
}
```

## Browser Console Verification

### Check for these logs:

#### During Generation:
```
📤 Calling Quick Action API...
✅ AI generation started: { project_id, thread_id, agent_run_id }
📡 Polling for response: /api/ai/get-response?...
✅ Response received: { status, hasContent, hasFiles, filesCount, waitedSeconds }
💾 Parsing and saving proposal...
✅ Proposal saved successfully
```

#### During File Viewing:
```
📁 Fetching file: { fileId, fileName, fileType }
✅ File data received: { fileName, fileType, hasContent, includedInline }
```

#### Errors:
```
❌ Generation error: [error message]
❌ Error loading file: [error message]
```

## Performance Benchmarks

### Expected Timings:
- **Quick Action API**: < 2 seconds
- **Get Response (waiting)**: 30-300 seconds (depends on AI processing)
- **File Fetch**: < 1 second per file
- **UI Rendering**: < 100ms per message

### Monitoring:
1. Open DevTools Network tab
2. Monitor API calls
3. Check response times
4. Verify no failed requests

## Common Issues and Solutions

### Issue: "Missing thread or project ID"
**Cause**: State not properly set after Quick Action
**Solution**: Ensure Quick Action response is successful before polling

### Issue: "Timeout waiting for response"
**Cause**: AI processing takes longer than timeout
**Solution**: Increase timeout parameter or optimize prompt

### Issue: "File content not displaying"
**Cause**: File encoding or type mismatch
**Solution**: Check file type and encoding in response

### Issue: "Content not formatted"
**Cause**: Markdown parsing issue
**Solution**: Verify content has proper markdown syntax

## Regression Testing

### Before Release:
- [ ] All existing tenders can be selected
- [ ] Generate button is enabled for ready tenders
- [ ] Loading states work correctly
- [ ] Content formats properly
- [ ] Files display with correct icons
- [ ] File viewer opens and works
- [ ] Chat follow-up still works
- [ ] No console errors
- [ ] No visual glitches
- [ ] Mobile responsive (if applicable)

## Automated Testing (Future)

### Unit Tests to Add:
```typescript
describe('AI Proposal Generation', () => {
  test('should poll for response after quick action', async () => {
    // Test implementation
  });
  
  test('should format markdown content', () => {
    // Test implementation
  });
  
  test('should display file boxes', () => {
    // Test implementation
  });
  
  test('should fetch and display file content', async () => {
    // Test implementation
  });
});
```

## Success Criteria

### Must Pass:
- ✅ Generate proposal completes successfully
- ✅ Content displays with proper formatting
- ✅ Files are clickable and viewable
- ✅ No console errors
- ✅ Loading states work correctly
- ✅ Error messages are user-friendly

### Nice to Have:
- ✅ Smooth animations
- ✅ Fast response times
- ✅ Beautiful UI
- ✅ Intuitive interactions

## Sign-off Checklist

- [ ] All test scenarios passed
- [ ] API endpoints respond correctly
- [ ] UI/UX is polished
- [ ] Error handling is robust
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Code is clean and maintainable
- [ ] Ready for production

---

**Testing Date**: _____________  
**Tested By**: _____________  
**Environment**: _____________  
**Result**: ☐ PASS ☐ FAIL ☐ NEEDS REVIEW  
**Notes**: _____________________________________________


