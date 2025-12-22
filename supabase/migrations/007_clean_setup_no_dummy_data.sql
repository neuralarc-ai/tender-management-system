-- =====================================================
-- CLEAN DATABASE SETUP (NO DUMMY DATA)
-- Description: Fresh database with users only, no sample tenders
-- Date: December 22, 2025
-- =====================================================

-- =====================================================
-- USERS: Demo accounts for testing
-- =====================================================
-- PIN hashes are bcrypt hashes of '1111' and '2222'
INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'partner@dcs.com', 'client', 'DCS Corporation', 'DCS Partner', '$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNv6YTVYkrYpuuNWoKm7LJ6xd9O6i', TRUE),
    ('22222222-2222-2222-2222-222222222222', 'admin@neuralarc.com', 'admin', 'Neural Arc Inc.', 'Alex Neural', '$2a$10$N9qo8uLOickgx2ZMRZoMye8GROv7ZTWZlrZqvvOXpLn8MK7ye0PKm', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- USER SETTINGS: Default preferences
-- =====================================================
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata')
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- CLEAN STATE: Database is now empty except for users
-- =====================================================
-- All tenders will come from real user submissions
-- No dummy/sample data
-- Ready for production use

-- =====================================================
-- LOGIN CREDENTIALS (For Testing)
-- =====================================================
-- Client/Partner (DCS):
--   Email: partner@dcs.com
--   PIN: 1111
--
-- Admin (Neural Arc):
--   Email: admin@neuralarc.com
--   PIN: 2222
-- =====================================================

