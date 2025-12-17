export interface UploadedFile {
  name: string;
  url: string;
  size: number;
}

export interface AIAnalysis {
  status: 'pending' | 'analyzing' | 'completed';
  relevanceScore: number;
  feasibilityScore: number;
  overallScore: number;
  canDeliver: number;
  partialDeliver: number;
  outOfScope: number;
  gaps: string[];
  risks: string[];
  assumptions: string[];
  completedAt: string | null;
}

export interface Proposal {
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  executiveSummary: string;
  requirementsUnderstanding: string;
  technicalApproach: string;
  scopeCoverage: string;
  exclusions: string;
  assumptions: string;
  timeline: string;
  commercialDetails: string;
  documents: UploadedFile[];
  submittedAt: string | null;
  reviewedAt: string | null;
  feedback: string;
}

export interface Tender {
  id: string;
  title: string;
  description: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
  submissionDeadline: string;
  eligibilityCriteria: string;
  documents: UploadedFile[];
  status: 'open' | 'closed' | 'awarded';
  createdAt: string;
  createdBy: string;
  aiAnalysis: AIAnalysis;
  proposal: Proposal;
}

export interface TenderData {
  tenders: Tender[];
}

