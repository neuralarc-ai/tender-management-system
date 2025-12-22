-- =====================================================
-- MIGRATION 002: Row Level Security (RLS) Policies
-- Description: Security policies for multi-tenant access control
-- Author: System
-- Date: 2025-12-22
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE uploaded_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: users
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_select_admin" ON users;

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "users_select_admin" ON users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES: tenders
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "tenders_select_own_client" ON tenders;
DROP POLICY IF EXISTS "tenders_insert_client" ON tenders;
DROP POLICY IF EXISTS "tenders_update_own_client" ON tenders;
DROP POLICY IF EXISTS "tenders_select_admin" ON tenders;
DROP POLICY IF EXISTS "tenders_update_admin" ON tenders;

-- Clients can view their own tenders
CREATE POLICY "tenders_select_own_client" ON tenders
    FOR SELECT
    USING (created_by = auth.uid());

-- Clients can create tenders
CREATE POLICY "tenders_insert_client" ON tenders
    FOR INSERT
    WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'client'
        )
    );

-- Clients can update their own open tenders
CREATE POLICY "tenders_update_own_client" ON tenders
    FOR UPDATE
    USING (created_by = auth.uid() AND status = 'open');

-- Admins can view all tenders
CREATE POLICY "tenders_select_admin" ON tenders
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can update tender status
CREATE POLICY "tenders_update_admin" ON tenders
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES: uploaded_files
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "files_select_own_tender" ON uploaded_files;
DROP POLICY IF EXISTS "files_select_admin" ON uploaded_files;
DROP POLICY IF EXISTS "files_insert_own" ON uploaded_files;

-- Users can view files from their own tenders
CREATE POLICY "files_select_own_tender" ON uploaded_files
    FOR SELECT
    USING (
        uploaded_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM tenders
            WHERE tenders.id = uploaded_files.tender_id
            AND tenders.created_by = auth.uid()
        )
    );

-- Admins can view all files
CREATE POLICY "files_select_admin" ON uploaded_files
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can upload files to their own tenders
CREATE POLICY "files_insert_own" ON uploaded_files
    FOR INSERT
    WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM tenders
            WHERE tenders.id = uploaded_files.tender_id
            AND tenders.created_by = auth.uid()
        )
    );

-- =====================================================
-- RLS POLICIES: ai_analysis
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "ai_analysis_select_admin" ON ai_analysis;
DROP POLICY IF EXISTS "ai_analysis_insert_admin" ON ai_analysis;
DROP POLICY IF EXISTS "ai_analysis_update_admin" ON ai_analysis;

-- Admins can view all AI analysis
CREATE POLICY "ai_analysis_select_admin" ON ai_analysis
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can create/update AI analysis
CREATE POLICY "ai_analysis_insert_admin" ON ai_analysis
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "ai_analysis_update_admin" ON ai_analysis
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- RLS POLICIES: proposals
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "proposals_select_client" ON proposals;
DROP POLICY IF EXISTS "proposals_select_admin" ON proposals;
DROP POLICY IF EXISTS "proposals_insert_admin" ON proposals;
DROP POLICY IF EXISTS "proposals_update_admin" ON proposals;
DROP POLICY IF EXISTS "proposals_update_status_client" ON proposals;

-- Clients can view proposals for their tenders
CREATE POLICY "proposals_select_client" ON proposals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tenders
            WHERE tenders.id = proposals.tender_id
            AND tenders.created_by = auth.uid()
        )
    );

-- Admins can view all proposals
CREATE POLICY "proposals_select_admin" ON proposals
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can create/update proposals
CREATE POLICY "proposals_insert_admin" ON proposals
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "proposals_update_admin" ON proposals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Clients can update proposal status (accept/reject)
CREATE POLICY "proposals_update_status_client" ON proposals
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM tenders
            WHERE tenders.id = proposals.tender_id
            AND tenders.created_by = auth.uid()
        )
    )
    WITH CHECK (
        status IN ('accepted', 'rejected')
    );

-- =====================================================
-- RLS POLICIES: notifications
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "notifications_select_by_role" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON notifications;
DROP POLICY IF EXISTS "notifications_update_read" ON notifications;

-- Users can view notifications targeted to their role
CREATE POLICY "notifications_select_by_role" ON notifications
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND users.role = ANY(notifications.target_roles)
        )
    );

-- System can create notifications (service account)
CREATE POLICY "notifications_insert_system" ON notifications
    FOR INSERT
    WITH CHECK (TRUE); -- Will be handled by service role

-- Users can update their read status
CREATE POLICY "notifications_update_read" ON notifications
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND users.role = ANY(notifications.target_roles)
        )
    );

-- =====================================================
-- RLS POLICIES: user_settings
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "settings_select_own" ON user_settings;
DROP POLICY IF EXISTS "settings_insert_own" ON user_settings;
DROP POLICY IF EXISTS "settings_update_own" ON user_settings;

-- Users can view their own settings
CREATE POLICY "settings_select_own" ON user_settings
    FOR SELECT
    USING (user_id = auth.uid());

-- Users can create their own settings
CREATE POLICY "settings_insert_own" ON user_settings
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own settings
CREATE POLICY "settings_update_own" ON user_settings
    FOR UPDATE
    USING (user_id = auth.uid());

-- =====================================================
-- Grant permissions to authenticated users
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

