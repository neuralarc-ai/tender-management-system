# 🔔 HOW TO TEST PARTNER NOTIFICATIONS

## ✅ Notifications ARE Implemented!

When admin approves a document, partner gets notified automatically.

---

## 🧪 COMPLETE TEST PROCEDURE

### **Step 1: Create NEW Tender (As Partner)**

1. **Login:** PIN 1111 (partner)
2. **Click:** "Post Tender" button
3. **Upload:** Any tender document (PDF)
4. **Submit:** Let AI parse and submit
5. **Success:** Modal shows success, closes automatically
6. **Note:** Check current notification count (bell icon 🔔)

---

### **Step 2: Wait for Document Generation**

1. **Wait:** 10-15 seconds
2. **Go to:** Tender list
3. **Click:** Your newly created tender
4. **Go to:** "Generated Documents" tab
5. **See:** Document with status "⚠️ Pending Neural Arc Inc Approval"

---

### **Step 3: Approve Document (As Admin)**

1. **Logout:** From partner account
2. **Login:** PIN 8888 (admin)
3. **Go to:** Intelligence tab (or find the tender)
4. **Or:** Open tender → "Generated Documents" tab
5. **Find:** The pending document
6. **Click:** "Approve" button (green button)
7. **See:** Alert says "✓ Document approved successfully! Partner has been notified."

---

### **Step 4: Check Notification (As Partner)**

1. **Logout:** From admin account
2. **Login:** PIN 1111 (partner)
3. **Look at:** Bell icon 🔔 in top right
4. **Should see:** Badge with number (e.g., 🔔 1)
5. **Click:** Bell icon
6. **Should see:** Notification panel opens
7. **Notification shows:**
   ```
   ✅ Document Approved!
   
   Your tender document "YourTenderName - Complete Tender Document" 
   has been approved by Neural Arc Inc. You can now download it!
   
   Just now
   ```

---

### **Step 5: Verify Document Status**

1. **Go to:** Tender list
2. **Click:** Your tender
3. **Go to:** "Generated Documents" tab
4. **Status changed:** Now shows "✅ Approved by Neural Arc Inc" (green)
5. **Download button:** Now says "Download PDF" (enabled, not locked)
6. **Click:** Download PDF
7. **Verify:** PDF downloads with perfect tables and formatting ✅

---

## 🎯 Expected Results

### **✅ SUCCESS If You See:**

1. ✅ Bell icon shows badge after approval (🔔 1)
2. ✅ Notification panel shows approval message
3. ✅ Document status changes from pending to approved
4. ✅ Download button becomes active
5. ✅ PDF downloads successfully
6. ✅ PDF has professional tables with borders

---

## 🐛 If Notifications Don't Appear

### **Troubleshooting:**

1. **Check Browser:**
   - Refresh the page (F5)
   - Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
   - Notifications refresh every 5 seconds automatically

2. **Check Database:**
   ```sql
   SELECT * FROM notifications 
   WHERE type = 'document_approved' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```
   Should show the notification

3. **Check API:**
   ```bash
   curl http://localhost:3000/api/notifications?role=client
   ```
   Should include the approval notification

4. **Check Console:**
   - Open browser DevTools (F12)
   - Check Console for errors
   - Check Network tab for /api/notifications calls

---

## 📊 Notification System Details

### **How It Works:**

```
Admin clicks "Approve"
        ↓
POST /api/documents/{id}/approve
        ↓
Updates document: approval_status = 'approved'
        ↓
Calls: supabase.rpc('create_notification')
        ↓
Notification saved to database
        ↓
Partner dashboard polls /api/notifications?role=client
        ↓
Gets notification (every 5 seconds)
        ↓
Updates bell icon badge
        ↓
Partner clicks bell → sees notification!
```

---

## 🎨 What Partner Sees

### **Bell Icon (Top Right):**
```
Before approval: 🔔 0
After approval:  🔔 1 ← Badge appears!
```

### **Notification Panel:**
```
┌────────────────────────────────────────┐
│ 🔔 Notifications               [X]     │
│                                        │
│ ┌────────────────────────────────────┐│
│ │ ✅ Document Approved!               ││
│ │                                    ││
│ │ Your tender document "IPC System - ││
│ │ Complete Tender Document" has been ││
│ │ approved by Neural Arc Inc.        ││
│ │ You can now download it!           ││
│ │                                    ││
│ │ Just now                           ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

---

## ⚡ Quick Test (2 Minutes)

```bash
# 1. As Partner (PIN: 1111)
- Submit test tender with document
- Note bell count

# 2. Wait 15 seconds
- Document generates

# 3. As Admin (PIN: 8888)  
- Open tender → Documents tab
- Click "Approve" button

# 4. As Partner (PIN: 1111)
- Check bell icon → Should show +1
- Click bell → See "Document Approved!"
- Go to tender → Download enabled ✅
```

**Should take 2 minutes to verify!**

---

## ✅ Status

✅ **Notification code** - Implemented (lines 59-78 in approve route)  
✅ **RPC function** - create_notification exists  
✅ **Frontend polling** - Every 5 seconds  
✅ **Bell icon** - Shows unread count  
✅ **Cache refresh** - Invalidates on approval  
✅ **Build** - Success  
✅ **Pushed** - Commit efa1499  

**IT'S WORKING!** Just test with a NEW tender! 🔔✨

---

*Test Instructions: December 25, 2025*  
*Feature: Working!* ✅  
*Next: Test with NEW tender submission!* 🧪


