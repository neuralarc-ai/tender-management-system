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

export interface TenderMessage {
  id: string;
  tender_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'admin' | 'client';
  message_type: 'text' | 'file' | 'system';
  content: string;
  created_at: string;
  is_read: boolean;
  attachments: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
}

export interface AIRegenerationLog {
  id: string;
  tender_id: string;
  regenerated_by: string;
  regenerated_by_name: string;
  reason: string;
  status: 'in_progress' | 'completed' | 'failed';
  error_message?: string;
  helium_thread_id?: string;
  helium_project_id?: string;
  created_at: string;
  completed_at?: string;
}
