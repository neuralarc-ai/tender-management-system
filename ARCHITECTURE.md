# Tender Management System - Architecture

## System Overview
A dual-portal tender management system with AI-assisted proposal generation.

## Data Models

### Tender
```javascript
{
  id: string (UUID),
  title: string,
  description: string,
  scopeOfWork: string,
  technicalRequirements: string,
  functionalRequirements: string,
  submissionDeadline: ISO date string,
  eligibilityCriteria: string,
  documents: [{ name: string, url: string, size: number }],
  status: 'open' | 'closed' | 'awarded',
  createdAt: ISO date string,
  createdBy: 'client',
  aiAnalysis: {
    status: 'pending' | 'analyzing' | 'completed',
    relevanceScore: number (0-100),
    feasibilityScore: number (0-100),
    overallScore: number (0-100),
    canDeliver: number (percentage),
    partialDeliver: number (percentage),
    outOfScope: number (percentage),
    gaps: [string],
    risks: [string],
    assumptions: [string],
    completedAt: ISO date string
  },
  proposal: {
    status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected',
    executiveSummary: string,
    requirementsUnderstanding: string,
    technicalApproach: string,
    scopeCoverage: string,
    exclusions: string,
    assumptions: string,
    timeline: string,
    commercialDetails: string,
    documents: [{ name: string, url: string }],
    submittedAt: ISO date string,
    reviewedAt: ISO date string,
    feedback: string
  }
}
```

## System Architecture

### Backend (Node.js/Express)
- RESTful API endpoints
- JSON file-based storage
- Polling mechanism for real-time sync (every 2 seconds)
- AI analysis engine with simulated processing time
- Proposal generation system

### Frontend (Vanilla HTML/CSS/JS)
- Client Portal (TCS/DCS)
- Admin Portal (Neural Arc Inc)
- Real-time updates via polling
- Role-based access control

### Key Features
1. **Instant Synchronization**: Changes appear in both portals within 2 seconds
2. **AI Analysis Workflow**: Automatic trigger on tender submission
3. **Countdown Timers**: Live deadline tracking
4. **Proposal Generation**: AI-assisted draft creation
5. **Status Tracking**: Real-time proposal status updates

## API Endpoints

### Tenders
- GET /api/tenders - List all tenders
- GET /api/tenders/:id - Get tender details
- POST /api/tenders - Create new tender (client only)
- PUT /api/tenders/:id - Update tender

### AI Analysis
- POST /api/tenders/:id/analyze - Trigger AI analysis (auto-triggered)
- GET /api/tenders/:id/analysis - Get analysis results

### Proposals
- POST /api/tenders/:id/proposal - Create/update proposal draft
- POST /api/tenders/:id/proposal/submit - Submit final proposal
- PUT /api/tenders/:id/proposal/review - Update proposal status (client)

### File Uploads
- POST /api/upload - Upload documents