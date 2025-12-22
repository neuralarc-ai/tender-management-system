-- =====================================================
-- MIGRATION 001: Initial Schema Setup
-- Description: Core tables for tender management system
-- Author: System
-- Date: 2025-12-22
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: users
-- Description: User accounts for both admin and clients
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'client')),
    organization_name VARCHAR(255),
    full_name VARCHAR(255),
    pin_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- =====================================================
-- TABLE: tenders
-- Description: Main tender/RFP submissions
-- =====================================================
CREATE TABLE IF NOT EXISTS tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    scope_of_work TEXT NOT NULL,
    technical_requirements TEXT NOT NULL,
    functional_requirements TEXT NOT NULL,
    eligibility_criteria TEXT NOT NULL,
    submission_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded')),
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT submission_deadline_future CHECK (submission_deadline > created_at)
);

-- =====================================================
-- TABLE: uploaded_files
-- Description: Documents attached to tenders and proposals
-- =====================================================
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100),
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT file_size_check CHECK (file_size > 0 AND file_size <= 10485760) -- Max 10MB
);

-- =====================================================
-- TABLE: ai_analysis
-- Description: AI-generated analysis for each tender
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID UNIQUE NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'analyzing', 'completed')),
    relevance_score INTEGER DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    feasibility_score INTEGER DEFAULT 0 CHECK (feasibility_score >= 0 AND feasibility_score <= 100),
    overall_score INTEGER DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    can_deliver INTEGER DEFAULT 0 CHECK (can_deliver >= 0 AND can_deliver <= 100),
    partial_deliver INTEGER DEFAULT 0 CHECK (partial_deliver >= 0 AND partial_deliver <= 100),
    out_of_scope INTEGER DEFAULT 0 CHECK (out_of_scope >= 0 AND out_of_scope <= 100),
    gaps TEXT[], -- Array of gap descriptions
    risks TEXT[], -- Array of risk descriptions
    assumptions TEXT[], -- Array of assumptions
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: proposals
-- Description: Proposals submitted by admin for tenders
-- =====================================================
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID UNIQUE NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected')),
    executive_summary TEXT,
    requirements_understanding TEXT,
    technical_approach TEXT,
    scope_coverage TEXT,
    exclusions TEXT,
    assumptions TEXT,
    timeline TEXT,
    commercial_details TEXT,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications
-- Description: System notifications for users
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('tender_created', 'proposal_submitted', 'proposal_accepted', 'proposal_rejected', 'tender_updated', 'system_alert')),
    title VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    tender_id UUID REFERENCES tenders(id) ON DELETE CASCADE,
    created_by VARCHAR(20) NOT NULL CHECK (created_by IN ('admin', 'client', 'system')),
    target_roles VARCHAR(20)[] NOT NULL, -- Array of roles who should see this
    read_by VARCHAR(20)[] DEFAULT '{}', -- Array of roles who have read this
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT at_least_one_target CHECK (array_length(target_roles, 1) > 0)
);

-- =====================================================
-- TABLE: user_settings
-- Description: User preferences and settings
-- =====================================================
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    desktop_alerts BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT FALSE,
    sms_updates BOOLEAN DEFAULT FALSE,
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(5) DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES for Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_tenders_status ON tenders(status);
CREATE INDEX IF NOT EXISTS idx_tenders_created_by ON tenders(created_by);
CREATE INDEX IF NOT EXISTS idx_tenders_deadline ON tenders(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_tenders_created_at ON tenders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_tender ON uploaded_files(tender_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_tender ON ai_analysis(tender_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_status ON ai_analysis(status);

CREATE INDEX IF NOT EXISTS idx_proposals_tender ON proposals(tender_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

CREATE INDEX IF NOT EXISTS idx_notifications_target_roles ON notifications USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_notifications_read_by ON notifications USING GIN(read_by);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_tender ON notifications(tender_id);

CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(user_id);

-- =====================================================
-- TRIGGERS for Updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at BEFORE UPDATE ON tenders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_analysis_updated_at BEFORE UPDATE ON ai_analysis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE users IS 'User accounts with role-based access';
COMMENT ON TABLE tenders IS 'Tender/RFP submissions from clients';
COMMENT ON TABLE uploaded_files IS 'File attachments for tenders and proposals';
COMMENT ON TABLE ai_analysis IS 'AI-generated analysis for tenders';
COMMENT ON TABLE proposals IS 'Admin responses to tender requests';
COMMENT ON TABLE notifications IS 'System-wide notification center';
COMMENT ON TABLE user_settings IS 'User preferences and configuration';

