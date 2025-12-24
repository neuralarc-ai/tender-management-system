-- Migration 009: AI-Powered Document Generation System
-- Creates tender_documents table for storing AI-generated tender documents
-- Uses Gemini 3 Pro to automatically generate professional 15-25 page tender documents
-- 
-- Features:
-- - Automatic document generation on tender submission
-- - Real-time progress tracking (0-100%)
-- - Support for multiple document types (full, summary, rfp)
-- - Version control and metadata storage
-- - Row Level Security policies
--
-- Created: December 24, 2025
-- Author: AI Assistant

-- Create tender_documents table
CREATE TABLE IF NOT EXISTS tender_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('full', 'summary', 'rfp')),
  title TEXT NOT NULL,
  content TEXT, -- Markdown content
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  generation_progress INTEGER DEFAULT 0 CHECK (generation_progress >= 0 AND generation_progress <= 100),
  page_count INTEGER,
  word_count INTEGER,
  generated_by UUID REFERENCES users(id),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tender_documents_tender_id ON tender_documents(tender_id);
CREATE INDEX IF NOT EXISTS idx_tender_documents_status ON tender_documents(status);
CREATE INDEX IF NOT EXISTS idx_tender_documents_created_at ON tender_documents(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_tender_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tender_documents_updated_at
  BEFORE UPDATE ON tender_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_tender_documents_updated_at();

-- Add RLS policies
ALTER TABLE tender_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view documents for their tenders
CREATE POLICY "Users can view their tender documents"
  ON tender_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tenders
      WHERE tenders.id = tender_documents.tender_id
      AND tenders.created_by = auth.uid()
    )
  );

-- Policy: System can create documents
CREATE POLICY "System can create tender documents"
  ON tender_documents
  FOR INSERT
  WITH CHECK (true);

-- Policy: System can update documents
CREATE POLICY "System can update tender documents"
  ON tender_documents
  FOR UPDATE
  USING (true);

-- Add comment
COMMENT ON TABLE tender_documents IS 'Stores AI-generated tender documents created by Gemini 3 Pro';

