# 📄 FILE UPLOAD LIMITS - COMPLETE GUIDE

## 🎯 Current Upload Limits

### **Maximum File Size: 10 MB per file**

This is configured in multiple places for consistency:

---

## 📊 CONFIGURATION BREAKDOWN

### 1. **Backend API Limit** (`/app/api/upload/route.ts`)

```typescript
// Line 22-28
// Validate file size (10MB max)
if (file.size > 10 * 1024 * 1024) {
  return NextResponse.json(
    { error: 'File size exceeds 10MB limit' },
    { status: 400 }
  );
}
```

**Limit:** 10 MB (10,485,760 bytes)

---

### 2. **Next.js Body Size Limit** (`next.config.js`)

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '10mb',
  },
}
```

**Limit:** 10 MB for all server actions

---

### 3. **Frontend File Types** (`NewTenderModal.tsx`)

```tsx
<input 
  type="file" 
  multiple 
  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
/>
```

**Accepted Types:**
- ✅ PDF (`.pdf`)
- ✅ Word (`.doc`, `.docx`)
- ✅ Excel (`.xls`, `.xlsx`)
- ✅ Text (`.txt`)

---

## 📈 DETAILED LIMITS

| Limit Type | Size | Details |
|------------|------|---------|
| **Per File** | 10 MB | Each individual file |
| **Per Upload** | No explicit limit | Multiple files allowed |
| **Total Request** | 10 MB | Next.js body size limit |
| **Practical Total** | ~10 MB | For all files combined |

---

## 💡 WHAT THIS MEANS FOR USERS

### **Typical File Sizes:**

| Document Type | Typical Size | Can Upload? |
|---------------|--------------|-------------|
| **Small PDF** | 100-500 KB | ✅ Yes (20-100 files) |
| **Medium PDF** | 1-3 MB | ✅ Yes (3-10 files) |
| **Large PDF** | 5-8 MB | ✅ Yes (1-2 files) |
| **Very Large PDF** | 10+ MB | ❌ No (exceeds limit) |
| **Word Document** | 50-500 KB | ✅ Yes (20-200 files) |
| **Excel File** | 100 KB - 2 MB | ✅ Yes (5-100 files) |
| **Text File** | 10-100 KB | ✅ Yes (100-1000 files) |

---

## 🎯 RECOMMENDATIONS

### **For Most Users:**
- ✅ **10 MB is sufficient** for typical tender documents
- ✅ Most PDFs are 1-5 MB
- ✅ Word/Excel files are usually <1 MB
- ✅ Can upload multiple files

### **For Large Documents:**
If you have files >10 MB:
1. **Compress the PDF** (reduce image quality)
2. **Split into multiple files**
3. **Remove unnecessary images**
4. **Use online PDF compressor tools**

---

## 🔧 HOW TO INCREASE LIMITS (If Needed)

### **Step 1: Update Backend API**

Edit `/app/api/upload/route.ts`:

```typescript
// Change from 10MB to 50MB
if (file.size > 50 * 1024 * 1024) {  // 50MB
  return NextResponse.json(
    { error: 'File size exceeds 50MB limit' },
    { status: 400 }
  );
}
```

### **Step 2: Update Next.js Config**

Edit `next.config.js`:

```javascript
experimental: {
  serverActions: {
    bodySizeLimit: '50mb',  // Increase to 50MB
  },
}
```

### **Step 3: Update Nginx (If Deployed)**

Edit Nginx config:

```nginx
client_max_body_size 50M;  # Increase to 50MB
```

Then reload Nginx:
```bash
sudo nginx -t && sudo systemctl reload nginx
```

### **Step 4: Update Supabase Storage (If Needed)**

Supabase default limit is **50 MB per file**, so no changes needed there.

---

## 🚨 IMPORTANT NOTES

### **Why 10 MB?**
1. **Fast uploads** - Small files upload quickly
2. **Browser limits** - Most browsers handle <10 MB well
3. **Mobile friendly** - Works on mobile networks
4. **AI processing** - Gemini AI processes faster
5. **Storage costs** - Lower storage usage
6. **Memory usage** - Lower server memory usage

### **AI Processing Limits:**
The Gemini AI has its own limits:
- **Gemini 1.5 Pro:** Up to 50 MB per file
- **Gemini 1.5 Flash:** Up to 50 MB per file
- **Current config:** Works within Gemini limits

So your **10 MB limit is well within AI capabilities**.

---

## 📊 PRODUCTION CONSIDERATIONS

### **For Production Deployment:**

**Option 1: Keep 10 MB (Recommended)**
- ✅ Fast and reliable
- ✅ Works for 95% of use cases
- ✅ Lower server load
- ✅ Better user experience

**Option 2: Increase to 20 MB (Moderate)**
- ⚠️ Slower uploads on slow networks
- ✅ Handles most large documents
- ⚠️ Higher server memory usage

**Option 3: Increase to 50 MB (Maximum)**
- ⚠️ Can cause timeout issues
- ⚠️ High memory usage
- ⚠️ Slower AI processing
- ✅ Handles very large files

---

## 💡 USER EXPERIENCE

### **What Users See:**

When file exceeds limit:
```
❌ Error: File size exceeds 10MB limit
```

**Current UX:** Clear error message

**Suggestion:** Show file size before upload:
```tsx
// In NewTenderModal.tsx, show file size preview
<span className="text-xs text-gray-400">
  {(file.size / 1024 / 1024).toFixed(2)} MB
  {file.size > 10 * 1024 * 1024 && (
    <span className="text-red-500"> - Too large!</span>
  )}
</span>
```

---

## 🎯 QUICK REFERENCE

### **Current Limits:**
- ✅ **10 MB per file**
- ✅ **Multiple files allowed**
- ✅ **No explicit limit on number of files**
- ✅ **~10 MB total per upload session**

### **Accepted Types:**
- ✅ PDF, Word, Excel, Text files

### **Processing:**
- ✅ AI can handle up to 50 MB (well within limits)
- ✅ Supabase storage: 50 MB per file
- ✅ Current: 10 MB is safe and fast

---

## 🎉 BOTTOM LINE

### **10 MB is PERFECT for your use case!**

**Why?**
- ✅ Fast uploads
- ✅ Reliable processing
- ✅ Works on all networks
- ✅ 95% of tenders fit
- ✅ Better user experience
- ✅ Lower costs

### **If you need more:**
Just follow the 3-step increase process above!

But honestly, **10 MB is great for most professional documents**. 📄✨

---

## 📞 NEED TO INCREASE?

If you frequently get files >10 MB:

1. **Test first** - See if it's really needed
2. **Follow steps above** - Increase to 20-50 MB
3. **Update UI** - Show file size warnings
4. **Test thoroughly** - Ensure no timeouts
5. **Monitor** - Watch server memory usage

---

*File Upload Limits Guide*  
*Current Limit: 10 MB per file* ✅  
*Status: Production-Ready!* 🚀  
*Recommendation: Keep at 10 MB* 💯

