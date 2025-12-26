# 📋 Screen Content Differences - Tenders vs Proposals

## 🔵 **PARTNER PORTAL**

### **"TENDERS" Tab** (All Their Submissions)
**Purpose:** Track all tender requests submitted to Neural Arc

**Shows:**
- ✅ **ALL tenders created by Partner** (5 tenders)
  - t-001: Cloud Migration (Open, Draft proposal)
  - t-002: AI Chatbot (Open, Submitted proposal)
  - t-005: Wellness App (Open, Submitted proposal)
  - t-007: Healthcare Portal (Open, Pending AI)
  - t-010: Security Audit (Open, Draft ready)

**Stats:**
- Total: 5
- Open: 5
- Closed: 0

**Features:**
- Live countdown timers
- All statuses (pending, analyzing, draft, submitted)
- Full pipeline view

---

### **"PROPOSALS" Tab** (Responses Received)
**Purpose:** Review proposals received from Neural Arc

**Shows:**
- ✅ **Only tenders with submitted/accepted/rejected proposals** (2 tenders)
  - t-002: AI Chatbot (Submitted - awaiting review)
  - t-005: Wellness App (Submitted - awaiting review)

**Hides:**
- ❌ t-001: Cloud Migration (proposal still draft)
- ❌ t-007: Healthcare Portal (no proposal yet)
- ❌ t-010: Security Audit (proposal not submitted)

**Stats:**
- Total: 2
- Submitted: 2
- Accepted: 0
- Rejected: 0

**Features:**
- Card grid layout (visual)
- Focus on proposal actions (Accept/Reject)
- Only shows actionable items

---

## 🔴 **ADMIN PORTAL**

### **"TENDERS" Tab** (Full Pipeline)
**Purpose:** See all incoming opportunities from all clients

**Shows:**
- ✅ **ALL tenders from ALL clients** (10 tenders)
  - From DCS: 5 tenders
  - From Acme Corp: 2 tenders
  - From Globex Finance: 1 tender
  - From Stark Industries: 2 tenders

**Stats:**
- Total: 10
- Open: 7
- Closed: 1
- Awarded: 0

**Features:**
- NEW badges on recent
- Match % color-coded
- Submit buttons (if draft ready)
- Complete pipeline overview

---

### **"PROPOSALS" Tab** (Proposal Workbench)
**Purpose:** Manage proposal creation and submissions

**Shows:**
- ✅ **Only tenders with proposal activity** (6 tenders)
  - **Draft (Ready to Submit)**: 
    - t-001: Cloud Migration (Analysis done ✓)
    - t-004: Data Warehouse (Analysis done ✓)
    - t-010: Security Audit (Analysis done ✓)
  - **Submitted (Awaiting Client)**:
    - t-002: AI Chatbot
    - t-005: Wellness App
    - t-008: E-commerce
  - **Accepted (Won)**:
    - t-009: Real Estate CRM
  - **Rejected (Lost)**:
    - t-003: IoT Network

**Hides:**
- ❌ t-006: Blockchain (AI still analyzing - not ready)
- ❌ t-007: Healthcare Portal (AI pending - not ready)

**Stats:**
- Total: 6
- Draft: 3 (ready to submit)
- Submitted: 3 (awaiting decision)
- Accepted: 1
- Rejected: 1

**Features:**
- Quick Submit buttons on draft cards
- Visual status badges
- Card grid for workflow focus
- Only shows proposals you can act on

---

## 🎯 **Key Differences:**

| Feature | TENDERS Tab | PROPOSALS Tab |
|---------|-------------|---------------|
| **Purpose** | Pipeline View | Proposal Workflow |
| **Layout** | Table (data-heavy) | Cards (visual) |
| **Partner Shows** | All 5 submissions | Only 2 with responses |
| **Admin Shows** | All 10 opportunities | Only 6 with proposals |
| **Focus** | Opportunity tracking | Proposal actions |
| **Actions** | View details | Submit/Review proposals |
| **Stats** | Open/Closed | Draft/Submitted/Accepted |

---

## 💡 **User Workflow:**

### **Partner:**
1. **Tenders Tab** → See all my requests (even if no response yet)
2. **Proposals Tab** → See only requests where Neural Arc replied

### **Admin:**
1. **Tenders Tab** → See all incoming opportunities (prioritize by match %)
2. **Proposals Tab** → See only tenders where analysis is done (work on proposals)

---

**This separation ensures each tab has a distinct purpose and shows only relevant data!** 🎯


