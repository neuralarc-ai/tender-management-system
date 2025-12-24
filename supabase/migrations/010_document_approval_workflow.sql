-- Migration 010: Document Approval Workflow
-- Adds approval system for AI-generated tender documents
-- Enables admin to review and approve documents before partners use them
--
-- Features:
-- - Approval status tracking (pending, approved, rejected)
-- - Admin approval tracking (who approved, when)
-- - Rejection reasons
-- - Notification integration
--
-- Created: December 24, 2025
-- Run this AFTER 009_ai_document_generation.sql

-- Add approval workflow columns to tender_documents
ALTER TABLE tender_documents 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE tender_documents 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

ALTER TABLE tender_documents 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE tender_documents 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for approval queries
CREATE INDEX IF NOT EXISTS idx_tender_documents_approval_status 
  ON tender_documents(approval_status);

-- Create index for approved_by queries
CREATE INDEX IF NOT EXISTS idx_tender_documents_approved_by 
  ON tender_documents(approved_by);

-- Add comment
COMMENT ON COLUMN tender_documents.approval_status IS 'Document approval status: pending (default), approved (by admin), rejected (with reason)';
COMMENT ON COLUMN tender_documents.approved_by IS 'Admin user who approved/rejected the document';
COMMENT ON COLUMN tender_documents.approved_at IS 'Timestamp when document was approved/rejected';
COMMENT ON COLUMN tender_documents.rejection_reason IS 'Reason for rejection (if applicable)';

