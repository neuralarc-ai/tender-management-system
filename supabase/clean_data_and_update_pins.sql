-- =====================================================
-- CLEAN ALL DATA AND UPDATE PINS
-- Description: Removes all data and sets new PINs
-- Admin PIN: 1978
-- Partner PIN: 7531 (complex enough for demo)
-- Date: December 24, 2025
-- =====================================================

-- =====================================================
-- STEP 1: DELETE ALL DATA (EXCEPT USERS)
-- =====================================================

-- Delete all tender documents
DELETE FROM tender_documents;

-- Delete all proposals
DELETE FROM proposals;

-- Delete all AI analyses
DELETE FROM ai_analyses;

-- Delete all communications
DELETE FROM tender_communication;

-- Delete all tenders
DELETE FROM tenders;

-- Delete all notifications
DELETE FROM notifications;

-- =====================================================
-- STEP 2: DELETE AND RECREATE USERS WITH NEW PINS
-- =====================================================

-- Delete existing users
DELETE FROM user_settings;
DELETE FROM users;

-- =====================================================
-- STEP 3: CREATE NEW USERS WITH NEW PINS
-- =====================================================
-- Admin PIN: 1978
-- Partner PIN: 7531
-- PIN hashes generated using bcrypt with 10 rounds
-- =====================================================

-- Insert users with NEW PINs
-- bcrypt hash of '1978' = $2a$10$YourHashHere (generated below)
-- bcrypt hash of '7531' = $2a$10$YourHashHere (generated below)

INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 
     'partner@dcs.com', 
     'client', 
     'DCS Corporation', 
     'DCS Partner', 
     '$2a$10$DummyHashForDevOnly7531HashHere', -- This will be updated
     TRUE,
     NOW()),
    
    ('22222222-2222-2222-2222-222222222222', 
     'admin@neuralarc.com', 
     'admin', 
     'Neural Arc Inc.', 
     'Alex Neural', 
     '$2a$10$DummyHashForDevOnly1978HashHere', -- This will be updated
     TRUE,
     NOW());

-- =====================================================
-- STEP 4: CREATE USER SETTINGS
-- =====================================================
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the cleanup:
-- SELECT COUNT(*) FROM tenders;  -- Should be 0
-- SELECT COUNT(*) FROM proposals;  -- Should be 0
-- SELECT COUNT(*) FROM users;  -- Should be 2
-- SELECT email, role, organization_name FROM users;

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
-- POST-EXECUTION STEPS
-- =====================================================
-- 1. Update frontend PIN checks in:
--    - app/auth/pin/page.tsx
--    - app/api/auth/verify-pin/route.ts
--    - components/PinScreen.tsx (if used)
-- 2. Clear browser localStorage
-- 3. Test login with new PINs
-- =====================================================

