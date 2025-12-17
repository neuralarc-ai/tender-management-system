# AI-Assisted Tender Intake and Proposal Submission System

A comprehensive dual-portal tender management system with AI-powered analysis and automated proposal generation.

## 🚀 Live Application

**Access the system here:** https://3000-017f88a4-2036-4cba-aff0-7bbec7716255.proxy.daytona.works/

### Portal Access

- **Landing Page:** https://3000-017f88a4-2036-4cba-aff0-7bbec7716255.proxy.daytona.works/
- **Client Portal (TCS/DCS):** https://3000-017f88a4-2036-4cba-aff0-7bbec7716255.proxy.daytona.works/client
- **Admin Portal (Neural Arc Inc):** https://3000-017f88a4-2036-4cba-aff0-7bbec7716255.proxy.daytona.works/admin

## 📋 System Overview

This system provides a complete tender management workflow with two role-based portals:

### Client Portal (TCS/DCS - Tender Issuer)
- Submit tender requirements with comprehensive details
- Upload supporting documents
- Track submission deadlines with live countdown timers
- Review submitted proposals
- Accept or reject proposals with feedback

### Admin Portal (Neural Arc Inc - Tender Applicant)
- View all available tenders in real-time
- Automatic AI analysis of tender requirements
- AI-generated proposal drafts
- Edit and customize proposals
- Submit proposals to clients
- Track proposal status

## ✨ Key Features

### 1. Real-Time Synchronization
- Changes appear in both portals within 2 seconds
- Live countdown timers for submission deadlines
- Instant status updates across portals

### 2. AI Analysis Engine
- **Relevance Score:** Measures alignment with Neural Arc's capabilities
- **Feasibility Score:** Assesses project deliverability
- **Overall Score:** Combined assessment metric
- **Delivery Breakdown:**
  - Fully Deliverable (%)
  - Partially Deliverable (%)
  - Out of Scope (%)
- **Insights:**
  - Identified gaps in requirements
  - Potential risks
  - Key assumptions

### 3. Automated Proposal Generation
- AI-generated proposal drafts based on tender analysis
- Includes:
  - Executive Summary
  - Understanding of Requirements
  - Technical Approach
  - Scope Coverage
  - Exclusions
  - Assumptions
  - Delivery Timeline
- Fully editable before submission

### 4. Complete Workflow
```
Client Submits Tender
    ↓
AI Analysis Begins (5-10 seconds demo time)
    ↓
Proposal Draft Generated
    ↓
Admin Reviews & Edits
    ↓
Admin Submits Proposal
    ↓
Client Reviews Proposal
    ↓
Client Accepts/Rejects
```

## 🎯 How to Use

### For Clients (TCS/DCS)

1. **Access Client Portal**
   - Navigate to the Client Portal URL
   - Click "Submit New Tender"

2. **Fill Tender Form**
   - **Title:** Project name
   - **Description:** Comprehensive project overview
   - **Scope of Work:** Detailed deliverables and boundaries
   - **Technical Requirements:** Technologies, integrations, specifications
   - **Functional Requirements:** Features, capabilities, workflows
   - **Submission Deadline:** Set deadline for proposals
   - **Eligibility Criteria:** Vendor qualifications
   - **Documents:** Upload supporting files (optional)

3. **Submit Tender**
   - Click "Submit Tender"
   - Tender appears instantly in both portals
   - AI analysis begins automatically

4. **Review Proposals**
   - Wait for Neural Arc to submit proposal
   - Review proposal details
   - Click "Review Proposal"
   - Accept or reject with optional feedback

### For Admins (Neural Arc Inc)

1. **Access Admin Portal**
   - Navigate to the Admin Portal URL
   - View list of available tenders

2. **Select Tender**
   - Click on any tender from the sidebar
   - View tender details in Overview tab

3. **Monitor AI Analysis**
   - Switch to "AI Analysis" tab
   - Wait for analysis to complete (5-10 seconds)
   - Review:
     - Relevance, Feasibility, and Overall scores
     - Delivery capability breakdown
     - Gaps, risks, and assumptions

4. **Edit Proposal**
   - Switch to "Proposal Draft" tab
   - Review AI-generated content
   - Edit any section as needed
   - Add commercial details (pricing, payment terms)
   - Click "Save Draft" to save changes

5. **Submit Proposal**
   - Click "Submit Proposal to Client"
   - Confirm submission
   - Proposal appears instantly in client portal

## 🏗️ Technical Architecture

### Backend
- **Framework:** Node.js with Express
- **Storage:** JSON file-based database
- **API:** RESTful endpoints
- **Sync:** Polling mechanism (2-second intervals)

### Frontend
- **Technology:** Vanilla HTML, CSS, JavaScript
- **Icons:** Lucide Icons
- **Design:** Modern, responsive UI with gradient themes
- **Real-time Updates:** Automatic polling

### AI Analysis Engine
- Keyword-based relevance scoring
- Capability matching algorithm
- Risk and gap identification
- Automated proposal generation

## 📊 Data Flow

1. **Tender Submission:**
   ```
   Client Portal → POST /api/tenders → Server → JSON Storage
   ```

2. **AI Analysis:**
   ```
   Server → Analyze Requirements → Calculate Scores → Generate Insights
   ```

3. **Proposal Generation:**
   ```
   AI Analysis Results → Generate Proposal Sections → Store Draft
   ```

4. **Real-time Sync:**
   ```
   Both Portals → Poll GET /api/tenders (every 2s) → Update UI
   ```

## 🎨 UI Features

### Client Portal
- Purple gradient theme (#667eea to #764ba2)
- Tender cards with countdown timers
- Modal forms for tender submission
- File upload with drag-and-drop
- Proposal review interface
- Status badges (Draft, Submitted, Under Review, Accepted, Rejected)

### Admin Portal
- Blue gradient theme (#1e3a8a to #3b82f6)
- Sidebar with tender list
- Three-tab interface (Overview, AI Analysis, Proposal Draft)
- Score cards with color-coded values
- Delivery breakdown with progress bars
- Rich text editor for proposals
- Insight cards for gaps, risks, assumptions

## 🔒 Security & Access Control

- **Role-Based Access:** Separate portals for clients and admins
- **Client Portal:** Can only submit tenders and review proposals
- **Admin Portal:** Can only view tenders and submit proposals
- **Data Isolation:** Each role sees only relevant information

## 📝 Sample Tender

Try submitting this sample tender to see the full workflow:

**Title:** AI-Powered Customer Service Platform

**Description:** We need a comprehensive AI-powered customer service platform that can handle customer inquiries, provide automated responses, and integrate with our existing CRM system.

**Scope of Work:** 
- Design and develop web-based customer service platform
- Implement AI chatbot with natural language processing
- Create admin dashboard for monitoring
- Integrate with Salesforce CRM
- Provide training and documentation

**Technical Requirements:**
- React.js frontend
- Node.js backend
- AI/ML integration for chatbot
- RESTful API
- Cloud deployment (AWS)
- Real-time messaging
- Database: PostgreSQL

**Functional Requirements:**
- Customer chat interface
- AI-powered response generation
- Ticket management system
- Analytics dashboard
- Multi-language support
- Mobile responsive design

**Submission Deadline:** Set to 7 days from now

**Eligibility Criteria:**
- 5+ years of software development experience
- Proven AI/ML project portfolio
- Experience with CRM integrations
- Available for 3-month project timeline

## 🚀 Testing the System

### End-to-End Test Flow

1. **Open Two Browser Windows:**
   - Window 1: Client Portal
   - Window 2: Admin Portal

2. **Submit Tender (Client Portal):**
   - Fill out the tender form
   - Submit
   - Watch it appear in the list

3. **Monitor Admin Portal:**
   - See tender appear instantly
   - Watch AI analysis status change from "Pending" → "Analyzing" → "Completed"
   - Review analysis results

4. **Edit Proposal (Admin Portal):**
   - Switch to Proposal Draft tab
   - Edit sections
   - Add commercial details
   - Submit proposal

5. **Review Proposal (Client Portal):**
   - See proposal status change to "Submitted"
   - Click "Review Proposal"
   - Accept or reject

6. **Verify Sync:**
   - Changes appear in both portals within 2 seconds
   - Status updates reflect across system

## 📈 Performance

- **Real-time Sync:** 2-second polling interval
- **AI Analysis:** 5-10 seconds (simulated processing time)
- **Proposal Generation:** Instant after analysis
- **File Upload:** Supports up to 10MB per file
- **Concurrent Users:** Supports multiple simultaneous users

## 🛠️ Development

### Local Setup
```bash
cd tender-system
npm install
node server.js
```

### File Structure
```
tender-system/
├── server.js              # Express server with API endpoints
├── package.json           # Dependencies
├── public/
│   ├── index.html        # Landing page
│   ├── client.html       # Client portal
│   └── admin.html        # Admin portal
├── data/
│   └── tenders.json      # JSON database
└── uploads/              # Uploaded documents
```

## 🎯 Key Differentiators

1. **Instant Synchronization:** Changes appear in both portals within 2 seconds
2. **AI-Powered Analysis:** Automatic evaluation of tender requirements
3. **Automated Proposals:** AI-generated drafts save hours of work
4. **Live Countdown Timers:** Real-time deadline tracking
5. **Complete Workflow:** End-to-end tender management
6. **Professional UI:** Modern, intuitive interface design
7. **Role-Based Access:** Secure, separate portals for each role

## 📞 Support

For questions or issues, please refer to the system documentation or contact the development team.

---

**Built with ❤️ by Neural Arc Inc**