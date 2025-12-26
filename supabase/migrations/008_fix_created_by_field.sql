-- =====================================================
-- Migration: Fix createdBy field in get_tenders_with_details
-- Description: Return user UUID instead of email for createdBy field
-- Date: 2025-12-23
-- =====================================================

-- Drop and recreate the function with fixed createdBy field
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
        'createdBy', t.created_by::text,
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_tenders_with_details TO authenticated;


