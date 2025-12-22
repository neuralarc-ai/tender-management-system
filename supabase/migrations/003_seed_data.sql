-- =====================================================
-- MIGRATION 003: Seed Data
-- Description: Initial demo users and sample data
-- Author: System
-- Date: 2025-12-22
-- =====================================================

-- =====================================================
-- SEED: Demo Users
-- =====================================================
-- Note: PIN hashes are bcrypt hashes of '1111' and '2222'
INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'partner@dcs.com', 'client', 'DCS Corporation', 'DCS Partner', '$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNv6YTVYkrYpuuNWoKm7LJ6xd9O6i', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'admin@neuralarc.com', 'admin', 'Neural Arc Inc.', 'Alex Neural', '$2a$10$N9qo8uLOickgx2ZMRZoMye8GROv7ZTWZlrZqvvOXpLn8MK7ye0PKm', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED: User Settings (Default preferences)
-- =====================================================
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata')
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- SEED: Sample Tenders
-- =====================================================
INSERT INTO tenders (
    id, 
    title, 
    description, 
    scope_of_work, 
    technical_requirements, 
    functional_requirements, 
    eligibility_criteria, 
    submission_deadline, 
    status, 
    created_by, 
    created_at
) VALUES
(
    '00000001-0000-0000-0000-000000000001',
    'Enterprise Cloud Migration Strategy',
    'Comprehensive migration of on-premise infrastructure to AWS cloud environment including legacy application modernization.',
    'Assessment of current infrastructure, migration planning, execution of lift-and-shift and refactoring phases, post-migration support.',
    'AWS Solutions Architect Professional certification required. Experience with Docker, Kubernetes, and Terraform.',
    'Zero downtime during business hours. 99.99% availability post-migration.',
    'Minimum 5 years experience in enterprise cloud migrations.',
    '2025-12-31 23:59:00+00',
    'open',
    '11111111-1111-1111-1111-111111111111',
    '2025-12-20 10:00:00+00'
),
(
    '00000005-0000-0000-0000-000000000005',
    'Employee Wellness Mobile App',
    'Internal application for tracking wellness activities and rewards program.',
    'iOS and Android app development, backend API, admin portal.',
    'React Native or Flutter, Node.js backend.',
    'Integration with Apple Health and Google Fit. SSO login.',
    'Portfolio of consumer-facing mobile apps.',
    '2025-12-25 17:00:00+00',
    'open',
    '11111111-1111-1111-1111-111111111111',
    '2025-12-21 14:00:00+00'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED: AI Analysis
-- =====================================================
INSERT INTO ai_analysis (
    tender_id,
    status,
    relevance_score,
    feasibility_score,
    overall_score,
    can_deliver,
    partial_deliver,
    out_of_scope,
    gaps,
    risks,
    assumptions,
    completed_at
) VALUES
(
    '00000001-0000-0000-0000-000000000001',
    'completed',
    95,
    88,
    92,
    90,
    10,
    0,
    ARRAY['No significant gaps identified'],
    ARRAY['Legacy database compatibility issues'],
    ARRAY['Client provides full access to current infrastructure'],
    '2025-12-20 10:05:00+00'
),
(
    '00000005-0000-0000-0000-000000000005',
    'completed',
    95,
    95,
    95,
    91,
    9,
    0,
    ARRAY['Security requirements need clarification', 'Infrastructure and hosting details not specified'],
    ARRAY['Third-party dependencies may affect timeline'],
    ARRAY['Client will provide timely feedback and approvals', 'All necessary access and credentials will be provided'],
    '2025-12-21 14:06:00+00'
)
ON CONFLICT (tender_id) DO NOTHING;

-- =====================================================
-- SEED: Proposals
-- =====================================================
INSERT INTO proposals (
    tender_id,
    status,
    executive_summary,
    requirements_understanding,
    technical_approach,
    scope_coverage,
    exclusions,
    assumptions,
    timeline,
    submitted_at
) VALUES
(
    '00000001-0000-0000-0000-000000000001',
    'draft',
    'Neural Arc Inc is pleased to submit this proposal for "Enterprise Cloud Migration Strategy". With our extensive experience in AI-driven solutions and software development, we are confident in delivering a solution that meets your requirements. Our analysis indicates a 92% alignment with your needs.',
    'Based on our thorough review, we understand you require comprehensive AWS cloud migration with zero downtime and 99.99% availability.',
    'Our proposed technical approach leverages industry best practices:\n\n1. Architecture Design: Scalable, modular architecture\n2. Technology Stack: AWS, Docker, Kubernetes, Terraform\n3. Development Methodology: Agile with bi-weekly sprints\n4. Quality Assurance: Comprehensive testing strategy\n5. Security: Industry-standard security practices',
    'Fully Deliverable (90%): Core requirements including cloud migration, user management, and primary features.',
    'Third-party licensing costs, Hardware procurement, Post-deployment maintenance beyond warranty period',
    'Client will provide timely feedback and approvals, All necessary access and credentials will be provided',
    'Phase 1 - Requirements & Design (2-3 weeks)\nPhase 2 - Development & Testing (6-8 weeks)\nPhase 3 - Deployment & Training (1-2 weeks)\nTotal: 10-14 weeks',
    NULL
),
(
    '00000005-0000-0000-0000-000000000005',
    'draft',
    'Neural Arc Inc is pleased to submit this proposal for "Employee Wellness Mobile App". With our extensive experience in AI-driven solutions and software development, we are confident in delivering a solution that meets your requirements. Our analysis indicates a 95% alignment with your needs.',
    'Based on our thorough review, we understand you require iOS and Android app with backend API and admin portal.',
    'Our proposed technical approach leverages industry best practices:\n\n1. Architecture Design: Scalable, modular architecture\n2. Technology Stack: React Native, Node.js, PostgreSQL\n3. Development Methodology: Agile with bi-weekly sprints\n4. Quality Assurance: Comprehensive testing strategy\n5. Security: Industry-standard security practices',
    'Fully Deliverable (91%): Core requirements including mobile app, user management, and primary features.',
    'Third-party licensing costs, Hardware procurement, Post-deployment maintenance beyond warranty period',
    'Client will provide timely feedback and approvals, All necessary access and credentials will be provided',
    'Phase 1 - Requirements & Design (2-3 weeks)\nPhase 2 - Development & Testing (6-8 weeks)\nPhase 3 - Deployment & Training (1-2 weeks)\nTotal: 10-14 weeks',
    NULL
)
ON CONFLICT (tender_id) DO NOTHING;

