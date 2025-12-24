# 🚀 Smart Document Parsing - Quick Reference

## ⚡ TL;DR
Upload tender documents → AI extracts everything → Submit in < 2 minutes!

---

## 📦 Setup (One-Time)

```bash
# 1. Install dependencies
npm install

# Or use automated setup
./setup-smart-parsing.sh

# 2. Get API key from: https://aistudio.google.com/app/apikey

# 3. Add to .env.local
GEMINI_API_KEY=your_api_key_here

# 4. Start server
npm run dev
```

---

## 🎯 How Partners Use It

1. Click **"Post Tender"**
2. Upload documents (PDF, DOC, DOCX, XLS)
3. AI extracts all info (10-30 sec)
4. Review preview
5. Click **"Submit AI-Parsed Tender"**

**Time: < 2 minutes** (was 15+ minutes)

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `lib/geminiDocumentParser.ts` | AI parsing service |
| `app/api/tenders/parse-documents/route.ts` | API endpoint |
| `components/client/NewTenderModal.tsx` | Smart form UI |
| `docs/SMART_DOCUMENT_PARSING_GUIDE.md` | Full documentation |
| `QUICK_START_SMART_PARSING.md` | User guide |

---

## 🔧 API Quick Reference

**Model:** `gemini-3-pro-preview` ([Docs](https://ai.google.dev/gemini-api/docs/gemini-3))

```typescript
POST /api/tenders/parse-documents

Request:
{
  documents: [{ url, name, size }]
}

Response:
{
  success: true,
  data: {
    title: string,
    description: string,
    scopeOfWork: string,
    technicalRequirements: string,
    functionalRequirements: string,
    eligibilityCriteria: string,
    submissionDeadline: string,
    confidence: number,
    warnings: string[]
  }
}
```

---

## ✅ Supported Files

- ✅ PDF (.pdf)
- ✅ Word (.doc, .docx)
- ✅ Excel (.xls, .xlsx)
- ✅ Text (.txt)
- ✅ Images (.jpg, .png)

**Max size:** 10MB per file

---

## 🚨 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| "Service not configured" | Add `GEMINI_API_KEY` to `.env.local` |
| Low confidence score | Use "Review & Edit" to correct |
| Deadline not found | Enter manually (other fields stay auto-filled) |
| Parsing fails | Check file format, size, or network |

---

## 📊 What Gets Extracted

✅ Project title  
✅ Full description  
✅ Scope of work  
✅ Technical requirements  
✅ Functional requirements  
✅ Eligibility criteria  
✅ Submission deadline  
✅ Budget, timeline, deliverables  

---

## 🎯 Time Savings

| Task | Before | After |
|------|--------|-------|
| Form filling | 15 min | 0 min |
| Total | 17 min | 2 min |

**90% faster!** ⚡

---

## 📚 Documentation Links

- **Technical Guide:** `docs/SMART_DOCUMENT_PARSING_GUIDE.md`
- **User Guide:** `QUICK_START_SMART_PARSING.md`
- **Implementation Summary:** `SMART_PARSING_IMPLEMENTATION_COMPLETE.md`
- **Gemini API Docs:** https://ai.google.dev/docs

---

## 🔑 Environment Variables

```bash
# Required for parsing
GEMINI_API_KEY=your_gemini_api_key

# Existing (required for app)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
AI_API_KEY=your_helium_api_key
AI_API_ENDPOINT=https://api.he2.site/api/v1/public
```

---

## ✨ Key Features

✅ Single & multi-document parsing  
✅ Intelligent information merging  
✅ Confidence scoring  
✅ Warning system  
✅ Review & edit mode  
✅ Real-time status updates  
✅ Graceful error handling  
✅ Type-safe implementation  

---

## 🎓 Training Materials

**For Partners:**
- Share `QUICK_START_SMART_PARSING.md`
- Demo the 2-minute workflow
- Show example documents

**For Admins:**
- Review `docs/SMART_DOCUMENT_PARSING_GUIDE.md`
- Test with various document types
- Monitor API usage

---

## 🆘 Need Help?

1. Check troubleshooting sections in docs
2. Review browser console for errors
3. Check `.env.local` configuration
4. Verify API key is valid
5. Test with simple document first

---

**Status:** ✅ Production Ready  
**Version:** 1.0.0  
**Last Updated:** Dec 23, 2025

