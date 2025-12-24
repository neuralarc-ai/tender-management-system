-- =====================================================
-- CLEAN ALL DATA AND UPDATE PINS
-- Description: Removes all data and sets new PINs
-- Admin PIN: 1978
-- Partner PIN: 7531
-- Date: December 24, 2025
-- =====================================================

-- =====================================================
-- STEP 1: DELETE ALL DATA (IN CORRECT ORDER)
-- =====================================================

-- Delete in order (respecting foreign key constraints)
DELETE FROM tender_documents;
DELETE FROM proposals;
DELETE FROM tender_communication;
DELETE FROM notifications;
DELETE FROM tenders;

-- =====================================================
-- STEP 2: DELETE AND RECREATE USERS
-- =====================================================

DELETE FROM user_settings;
DELETE FROM users;

-- =====================================================
-- STEP 3: CREATE NEW USERS WITH NEW PINS
-- =====================================================
-- Admin PIN: 1978
-- Partner PIN: 7531
-- Note: pin_hash values are placeholders for demo
-- Frontend handles PIN validation directly
-- =====================================================

INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 
     'partner@dcs.com', 
     'client', 
     'DCS Corporation', 
     'DCS Partner', 
     '$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNv6YTVYkrYpuuNWoKm7LJ6xd9O6i',
     TRUE,
     NOW()),
    
    ('22222222-2222-2222-2222-222222222222', 
     'admin@neuralarc.com', 
     'admin', 
     'Neural Arc Inc.', 
     'Alex Neural', 
     '$2a$10$N9qo8uLOickgx2ZMRZoMye8GROv7ZTWZlrZqvvOXpLn8MK7ye0PKm',
     TRUE,
     NOW());

-- =====================================================
-- STEP 4: CREATE USER SETTINGS
-- =====================================================
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata');

-- =====================================================
-- VERIFICATION - Run these after cleanup
-- =====================================================
SELECT COUNT(*) as tender_count FROM tenders;  -- Should be 0
SELECT COUNT(*) as proposal_count FROM proposals;  -- Should be 0
SELECT COUNT(*) as user_count FROM users;  -- Should be 2

-- Display users
SELECT id, email, role, organization_name, is_active FROM users;

-- =====================================================
-- NEW LOGIN CREDENTIALS
-- =====================================================
-- Admin (Neural Arc):
--   Email: admin@neuralarc.com
--   PIN: 1978
--
-- Partner (DCS):
--   Email: partner@dcs.com
--   PIN: 7531
-- =====================================================

-- =====================================================
-- NEXT STEPS
-- =====================================================
-- 1. Clear browser localStorage: localStorage.clear()
-- 2. Restart dev server
-- 3. Test login with new PINs (1978 for admin, 7531 for partner)
-- =====================================================
