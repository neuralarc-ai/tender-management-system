-- =====================================================
-- MIGRATION 004: Functions and Stored Procedures
-- Description: Helper functions for business logic
-- Author: System
-- Date: 2025-12-22
-- =====================================================

-- =====================================================
-- FUNCTION: Get tenders with full details
-- Description: Returns tenders with AI analysis and proposals joined
-- =====================================================
CREATE OR REPLACE FUNCTION get_tenders_with_details(user_role TEXT, user_id_param UUID)
RETURNS TABLE (
    tender_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'description', t.description,
        'scopeOfWork', t.scope_of_work,
        'technicalRequirements', t.technical_requirements,
        'functionalRequirements', t.functional_requirements,
        'eligibilityCriteria', t.eligibility_criteria,
        'submissionDeadline', t.submission_deadline,
        'status', t.status,
        'createdAt', t.created_at,
        'createdBy', u.email,
        'aiAnalysis', jsonb_build_object(
            'status', COALESCE(a.status, 'pending'),
            'relevanceScore', COALESCE(a.relevance_score, 0),
            'feasibilityScore', COALESCE(a.feasibility_score, 0),
            'overallScore', COALESCE(a.overall_score, 0),
            'canDeliver', COALESCE(a.can_deliver, 0),
            'partialDeliver', COALESCE(a.partial_deliver, 0),
            'outOfScope', COALESCE(a.out_of_scope, 0),
            'gaps', COALESCE(a.gaps, ARRAY[]::TEXT[]),
            'risks', COALESCE(a.risks, ARRAY[]::TEXT[]),
            'assumptions', COALESCE(a.assumptions, ARRAY[]::TEXT[]),
            'completedAt', a.completed_at
        ),
        'proposal', jsonb_build_object(
            'status', COALESCE(p.status, 'draft'),
            'executiveSummary', COALESCE(p.executive_summary, ''),
            'requirementsUnderstanding', COALESCE(p.requirements_understanding, ''),
            'technicalApproach', COALESCE(p.technical_approach, ''),
            'scopeCoverage', COALESCE(p.scope_coverage, ''),
            'exclusions', COALESCE(p.exclusions, ''),
            'assumptions', COALESCE(p.assumptions, ''),
            'timeline', COALESCE(p.timeline, ''),
            'commercialDetails', COALESCE(p.commercial_details, ''),
            'submittedAt', p.submitted_at,
            'reviewedAt', p.reviewed_at,
            'feedback', COALESCE(p.feedback, '')
        ),
        'documents', COALESCE((
            SELECT jsonb_agg(jsonb_build_object(
                'name', f.file_name,
                'url', f.file_url,
                'size', f.file_size
            ))
            FROM uploaded_files f
            WHERE f.tender_id = t.id
        ), '[]'::jsonb)
    ) AS tender_data
    FROM tenders t
    LEFT JOIN users u ON t.created_by = u.id
    LEFT JOIN ai_analysis a ON t.id = a.tender_id
    LEFT JOIN proposals p ON t.id = p.tender_id
    WHERE (user_role = 'admin' OR t.created_by = user_id_param)
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Create notification
-- Description: Helper to create notifications with validation
-- =====================================================
CREATE OR REPLACE FUNCTION create_notification(
    p_type VARCHAR(50),
    p_title VARCHAR(500),
    p_message TEXT,
    p_tender_id UUID,
    p_created_by VARCHAR(20),
    p_target_roles VARCHAR(20)[]
)
RETURNS UUID AS $$
DECLARE
    new_notification_id UUID;
BEGIN
    INSERT INTO notifications (
        type,
        title,
        message,
        tender_id,
        created_by,
        target_roles
    ) VALUES (
        p_type,
        p_title,
        p_message,
        p_tender_id,
        p_created_by,
        p_target_roles
    )
    RETURNING id INTO new_notification_id;
    
    RETURN new_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Mark notification as read
-- Description: Add role to read_by array
-- =====================================================
CREATE OR REPLACE FUNCTION mark_notification_read(
    p_notification_id UUID,
    p_role VARCHAR(20)
)
RETURNS VOID AS $$
BEGIN
    UPDATE notifications
    SET read_by = array_append(read_by, p_role)
    WHERE id = p_notification_id
    AND NOT (p_role = ANY(read_by)); -- Only add if not already read
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Get unread notification count
-- Description: Count unread notifications for a role
-- =====================================================
CREATE OR REPLACE FUNCTION get_unread_count(p_role VARCHAR(20))
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO count
    FROM notifications
    WHERE p_role = ANY(target_roles)
    AND NOT (p_role = ANY(read_by));
    
    RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNCTION: Clean old notifications
-- Description: Archive notifications older than 30 days
-- =====================================================
CREATE OR REPLACE FUNCTION clean_old_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE created_at < NOW() - INTERVAL '30 days'
    RETURNING COUNT(*) INTO deleted_count;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGER: Auto-create AI analysis on tender creation
-- =====================================================
CREATE OR REPLACE FUNCTION create_ai_analysis_on_tender()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ai_analysis (tender_id, status)
    VALUES (NEW.id, 'pending');
    
    INSERT INTO proposals (tender_id, status)
    VALUES (NEW.id, 'draft');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_ai_analysis
    AFTER INSERT ON tenders
    FOR EACH ROW
    EXECUTE FUNCTION create_ai_analysis_on_tender();

-- =====================================================
-- Grant execute permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION get_tenders_with_details TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
GRANT EXECUTE ON FUNCTION clean_old_notifications TO service_role;

