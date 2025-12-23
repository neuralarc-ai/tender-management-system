-- =====================================================
-- TENDER COMMUNICATION FEATURE
-- Description: Add messaging, file sharing, and AI logs
-- Date: December 23, 2025
-- =====================================================

-- Drop existing tables if they exist (for clean re-run)
DROP TABLE IF EXISTS tender_message_attachments CASCADE;
DROP TABLE IF EXISTS tender_messages CASCADE;
DROP TABLE IF EXISTS ai_regeneration_logs CASCADE;

-- =====================================================
-- TABLE: tender_messages
-- Purpose: Store messages between client and admin
-- =====================================================
CREATE TABLE tender_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'system')),
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Create indexes for performance
CREATE INDEX idx_tender_messages_tender_id ON tender_messages(tender_id);
CREATE INDEX idx_tender_messages_created_at ON tender_messages(created_at DESC);
CREATE INDEX idx_tender_messages_sender_id ON tender_messages(sender_id);

-- =====================================================
-- TABLE: tender_message_attachments
-- Purpose: Store file attachments for messages
-- =====================================================
CREATE TABLE tender_message_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES tender_messages(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_attachments_message_id ON tender_message_attachments(message_id);

-- =====================================================
-- TABLE: ai_regeneration_logs
-- Purpose: Track AI proposal regeneration history
-- =====================================================
CREATE TABLE ai_regeneration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    regenerated_by UUID NOT NULL REFERENCES users(id),
    reason TEXT,
    old_proposal_snapshot JSONB,
    new_proposal_snapshot JSONB,
    helium_thread_id VARCHAR(255),
    helium_project_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_logs_tender_id ON ai_regeneration_logs(tender_id);
CREATE INDEX idx_ai_logs_created_at ON ai_regeneration_logs(created_at DESC);

-- =====================================================
-- TRIGGER: Update updated_at on messages
-- =====================================================
CREATE OR REPLACE FUNCTION update_tender_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_tender_messages_updated_at ON tender_messages;
CREATE TRIGGER trigger_update_tender_messages_updated_at
    BEFORE UPDATE ON tender_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_tender_messages_updated_at();

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE tender_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_regeneration_logs ENABLE ROW LEVEL SECURITY;

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages for their tenders" ON tender_messages;
CREATE POLICY "Users can view messages for their tenders" ON tender_messages
    FOR SELECT USING (
        tender_id IN (
            SELECT id FROM tenders WHERE created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Users can send messages for their tenders" ON tender_messages;
CREATE POLICY "Users can send messages for their tenders" ON tender_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND (
            tender_id IN (
                SELECT id FROM tenders WHERE created_by = auth.uid()
            )
            OR EXISTS (
                SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
            )
        )
    );

-- Attachments policies (same as messages)
DROP POLICY IF EXISTS "Users can view attachments" ON tender_message_attachments;
CREATE POLICY "Users can view attachments" ON tender_message_attachments
    FOR SELECT USING (
        message_id IN (
            SELECT id FROM tender_messages WHERE sender_id = auth.uid()
            OR tender_id IN (
                SELECT id FROM tenders WHERE created_by = auth.uid()
                OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
            )
        )
    );

DROP POLICY IF EXISTS "Users can create attachments" ON tender_message_attachments;
CREATE POLICY "Users can create attachments" ON tender_message_attachments
    FOR INSERT WITH CHECK (
        message_id IN (
            SELECT id FROM tender_messages WHERE sender_id = auth.uid()
        )
    );

-- AI logs policies
DROP POLICY IF EXISTS "Users can view AI logs for their tenders" ON ai_regeneration_logs;
CREATE POLICY "Users can view AI logs for their tenders" ON ai_regeneration_logs
    FOR SELECT USING (
        tender_id IN (
            SELECT id FROM tenders WHERE created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Admins can create AI logs" ON ai_regeneration_logs;
CREATE POLICY "Admins can create AI logs" ON ai_regeneration_logs
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- FUNCTION: Get messages with attachments
-- =====================================================
CREATE OR REPLACE FUNCTION get_tender_messages(
    p_tender_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_user_role TEXT DEFAULT 'admin'
)
RETURNS TABLE (
    message_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', tm.id,
        'tender_id', tm.tender_id,
        'sender_id', tm.sender_id,
        'sender_name', u.full_name,
        'sender_role', u.role,
        'message_type', tm.message_type,
        'content', tm.content,
        'created_at', tm.created_at,
        'is_read', tm.is_read,
        'attachments', COALESCE(
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', tma.id,
                        'file_name', tma.file_name,
                        'file_url', tma.file_url,
                        'file_size', tma.file_size,
                        'file_type', tma.file_type
                    )
                )
                FROM tender_message_attachments tma
                WHERE tma.message_id = tm.id
            ),
            '[]'::jsonb
        )
    ) as message_data
    FROM tender_messages tm
    JOIN users u ON tm.sender_id = u.id
    WHERE tm.tender_id = p_tender_id
    ORDER BY tm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get AI regeneration logs
-- =====================================================
CREATE OR REPLACE FUNCTION get_ai_regeneration_logs(
    p_tender_id UUID
)
RETURNS TABLE (
    log_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', arl.id,
        'tender_id', arl.tender_id,
        'regenerated_by', arl.regenerated_by,
        'regenerated_by_name', u.full_name,
        'reason', arl.reason,
        'status', arl.status,
        'error_message', arl.error_message,
        'helium_thread_id', arl.helium_thread_id,
        'helium_project_id', arl.helium_project_id,
        'created_at', arl.created_at,
        'completed_at', arl.completed_at
    ) as log_data
    FROM ai_regeneration_logs arl
    JOIN users u ON arl.regenerated_by = u.id
    WHERE arl.tender_id = p_tender_id
    ORDER BY arl.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Mark messages as read
-- =====================================================
CREATE OR REPLACE FUNCTION mark_messages_read(
    p_tender_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE tender_messages
    SET is_read = TRUE
    WHERE tender_id = p_tender_id
    AND sender_id != p_user_id
    AND is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETE
-- =====================================================
-- All communication features added successfully
-- Tables: tender_messages, tender_message_attachments, ai_regeneration_logs
-- RLS policies enabled for security
-- Helper functions created for easy data access
-- =====================================================

