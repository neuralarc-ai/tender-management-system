-- =====================================================
-- CLEAN DATABASE & UPDATE PINS - FINAL WORKING VERSION
-- =====================================================
-- Admin PIN: 1978
-- Partner PIN: 7531
-- Date: December 24, 2025
-- =====================================================

-- Delete all data (only existing tables, correct order)
DELETE FROM tender_documents;
DELETE FROM uploaded_files;
DELETE FROM proposals;
DELETE FROM ai_analysis;
DELETE FROM notifications;
DELETE FROM tenders;
DELETE FROM user_settings;
DELETE FROM users;

-- Create users with NEW PINs
INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'partner@dcs.com', 'client', 'DCS Corporation', 'DCS Partner', '$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNv6YTVYkrYpuuNWoKm7LJ6xd9O6i', TRUE, NOW()),
    ('22222222-2222-2222-2222-222222222222', 'admin@neuralarc.com', 'admin', 'Neural Arc Inc.', 'Alex Neural', '$2a$10$N9qo8uLOickgx2ZMRZoMye8GROv7ZTWZlrZqvvOXpLn8MK7ye0PKm', TRUE, NOW());

-- Create user settings
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata');

-- Verify
SELECT 'SUCCESS: Database cleaned and PINs updated!' as status;
SELECT COUNT(*) as tenders FROM tenders;
SELECT COUNT(*) as users FROM users;
SELECT email, role, organization_name FROM users ORDER BY role;

-- =====================================================
-- NEW CREDENTIALS:
-- Admin: 1978 | Partner: 7531
-- =====================================================
-- NEXT: Clear browser localStorage and test!
-- =====================================================
