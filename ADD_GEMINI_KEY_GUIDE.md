# 🔑 Adding Gemini API Key to .env.local

## Option 1: Automated Script (Recommended)

Run this command:
```bash
./add-gemini-key.sh
```

It will:
1. Prompt you for your API key
2. Add it to `.env.local` automatically
3. Show next steps

## Option 2: Manual Steps

### Step 1: Get Your API Key

1. Visit: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"** button
4. Select or create a Google Cloud project
5. Copy the generated API key (looks like: `AIzaSy...`)

### Step 2: Add to .env.local

Open `.env.local` in your editor and add:

```bash
# Gemini AI Configuration (REQUIRED for document parsing)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Replace** `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your actual API key.

### Step 3: Verify Your .env.local

Your `.env.local` should now contain:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI API Configuration (Helium - for proposals)
AI_API_KEY=your_helium_api_key
AI_API_ENDPOINT=https://api.he2.site/api/v1/public

# Gemini AI Configuration (for document parsing)
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 4: Restart Development Server

```bash
# Stop current server (Ctrl + C)
# Start fresh
npm run dev
```

## Step 5: Test It!

1. Open: **http://localhost:3000/client**
2. Login with PIN: **1111**
3. Click **"Post Tender"** button
4. Upload a tender document (PDF, DOC, DOCX, etc.)
5. Watch AI extract everything automatically! ✨

---

## 🔍 How to Verify It's Working

### Success Indicators:
- ✅ After uploading: "✨ Gemini AI is Analyzing Documents" appears
- ✅ Progress indicator shows for 10-30 seconds
- ✅ "AI Extraction Complete" with confidence score
- ✅ Form fields auto-filled with extracted data

### Error Indicators:
- ❌ "Document parsing service not configured" → API key not set
- ❌ "Failed to parse documents" → Check API key validity
- ❌ No parsing animation → Check browser console

---

## 🚨 Troubleshooting

### Issue: "Document parsing service not configured"

**Cause:** GEMINI_API_KEY not found in environment

**Solution:**
1. Check `.env.local` file exists
2. Verify `GEMINI_API_KEY=` line is present
3. Ensure no spaces around `=`
4. Restart dev server: `npm run dev`

### Issue: "Invalid API key"

**Cause:** API key is incorrect or expired

**Solution:**
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Update `.env.local` with new key
4. Restart server

### Issue: API key not being read

**Cause:** Environment variables not loaded

**Solution:**
1. Stop server (Ctrl + C)
2. Verify `.env.local` is in root directory
3. Restart: `npm run dev`
4. Check terminal for any .env errors

---

## 📊 About the Model

### Current Implementation: `gemini-3-pro-preview`

According to [Google's official documentation](https://ai.google.dev/gemini-api/docs/gemini-3), **Gemini 3 Pro** is the most intelligent model to date, perfect for:
- ✅ Complex tender documents with advanced reasoning
- ✅ Multi-page PDFs with state-of-the-art understanding
- ✅ Technical specifications requiring deep analysis
- ✅ Detailed requirements extraction
- ✅ 1M token context window (massive documents)
- ✅ Dynamic thinking for maximum accuracy

**Key Features:**
- **Knowledge Cutoff:** January 2025 (latest!)
- **Context Window:** 1M tokens input / 64k tokens output
- **Thinking Level:** High (for maximum reasoning depth)
- **Pricing:** $2 per 1M input tokens / $12 per 1M output tokens

### Alternative Models (if needed)

If you want to change the model, edit: `lib/geminiDocumentParser.ts`

```typescript
// Current: Gemini 3 Pro (BEST for complex documents)
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-3-pro-preview',
  generationConfig: {
    thinkingConfig: { thinkingLevel: 'high' }
  }
});

// For faster, cheaper parsing (still excellent quality):
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-3-flash-preview' 
});

// Previous generation (still good):
this.model = this.genAI.getGenerativeModel({ 
  model: 'gemini-1.5-pro' 
});
```

**Recommendation:** Stick with `gemini-3-pro-preview` for best results with tender documents.

---

## 💰 API Pricing (as of Dec 2024)

### Gemini 3 Pro Preview
- **Input:** $2 per 1M tokens (< 200k tokens)
- **Output:** $12 per 1M tokens (< 200k tokens)
- **Input:** $4 per 1M tokens (> 200k tokens)
- **Output:** $18 per 1M tokens (> 200k tokens)
- **Free tier:** Available in Google AI Studio

### Gemini 3 Flash Preview (Alternative)
- **Input:** $0.50 per 1M tokens
- **Output:** $3 per 1M tokens
- **Free tier:** Yes (in Gemini API)

### Typical Usage per Tender
- Average document: ~5,000-10,000 tokens
- Response: ~1,000-2,000 tokens
- **Cost per tender with Gemini 3 Pro:** $0.03-0.14 (3-14 cents)
- **Cost per tender with Gemini 3 Flash:** $0.005-0.05 (0.5-5 cents)

**Extremely affordable for the massive time savings!** 🚀

Source: [Gemini 3 Pricing](https://ai.google.dev/gemini-api/docs/gemini-3)

---

## 🔒 Security Best Practices

✅ **Never commit** `.env.local` to git (already in .gitignore)  
✅ **Rotate keys** periodically for security  
✅ **Restrict key** to specific domains in production  
✅ **Monitor usage** in Google Cloud Console  
✅ **Set quotas** to prevent unexpected costs  

---

## ✅ Quick Checklist

- [ ] Get API key from Google AI Studio
- [ ] Add `GEMINI_API_KEY` to `.env.local`
- [ ] Restart development server
- [ ] Test with document upload
- [ ] Verify AI extraction works
- [ ] Ready to use! 🚀

---

**Need Help?** Check the comprehensive guide: `docs/SMART_DOCUMENT_PARSING_GUIDE.md`

