-- =====================================================
-- CLEAN ALL DATA AND UPDATE PINS (SAFE VERSION)
-- Description: Removes all data and sets new PINs
-- Admin PIN: 1978
-- Partner PIN: 7531 (complex enough for demo)
-- Date: December 24, 2025
-- =====================================================

-- =====================================================
-- STEP 1: SAFE DELETE ALL DATA (ONLY IF TABLES EXIST)
-- =====================================================

-- Delete tender documents
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tender_documents') THEN
    DELETE FROM tender_documents;
    RAISE NOTICE 'Deleted all tender_documents';
  END IF;
END $$;

-- Delete proposals
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'proposals') THEN
    DELETE FROM proposals;
    RAISE NOTICE 'Deleted all proposals';
  END IF;
END $$;

-- Delete communications
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tender_communication') THEN
    DELETE FROM tender_communication;
    RAISE NOTICE 'Deleted all tender_communication';
  END IF;
END $$;

-- Delete notifications
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    DELETE FROM notifications;
    RAISE NOTICE 'Deleted all notifications';
  END IF;
END $$;

-- Delete tenders (after dependent tables)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tenders') THEN
    DELETE FROM tenders;
    RAISE NOTICE 'Deleted all tenders';
  END IF;
END $$;

-- =====================================================
-- STEP 2: DELETE AND RECREATE USERS WITH NEW PINS
-- =====================================================

-- Delete existing user settings
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
    DELETE FROM user_settings;
    RAISE NOTICE 'Deleted all user_settings';
  END IF;
END $$;

-- Delete existing users
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
    DELETE FROM users;
    RAISE NOTICE 'Deleted all users';
  END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE NEW USERS WITH NEW PINS
-- =====================================================
-- Admin PIN: 1978
-- Partner PIN: 7531
-- =====================================================

INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 
     'partner@dcs.com', 
     'client', 
     'DCS Corporation', 
     'DCS Partner', 
     '$2a$10$N9qo8uLOickgx2ZMRZoMye7FRNv6YTVYkrYpuuNWoKm7LJ6xd9O6i', -- Placeholder hash
     TRUE,
     NOW()),
    
    ('22222222-2222-2222-2222-222222222222', 
     'admin@neuralarc.com', 
     'admin', 
     'Neural Arc Inc.', 
     'Alex Neural', 
     '$2a$10$N9qo8uLOickgx2ZMRZoMye8GROv7ZTWZlrZqvvOXpLn8MK7ye0PKm', -- Placeholder hash
     TRUE,
     NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    organization_name = EXCLUDED.organization_name,
    full_name = EXCLUDED.full_name,
    pin_hash = EXCLUDED.pin_hash,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- STEP 4: CREATE USER SETTINGS
-- =====================================================
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('11111111-1111-1111-1111-111111111111', TRUE, TRUE, FALSE, FALSE, 'Asia/Dubai'),
    ('22222222-2222-2222-2222-222222222222', TRUE, TRUE, FALSE, FALSE, 'Asia/Kolkata')
ON CONFLICT (user_id) DO UPDATE SET
    email_notifications = EXCLUDED.email_notifications,
    desktop_alerts = EXCLUDED.desktop_alerts,
    weekly_reports = EXCLUDED.weekly_reports,
    sms_updates = EXCLUDED.sms_updates,
    timezone = EXCLUDED.timezone,
    updated_at = NOW();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Check what was deleted and created
DO $$ 
DECLARE
    tender_count INTEGER;
    proposal_count INTEGER;
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO tender_count FROM tenders;
    SELECT COUNT(*) INTO proposal_count FROM proposals;
    SELECT COUNT(*) INTO user_count FROM users;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CLEANUP COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tenders remaining: %', tender_count;
    RAISE NOTICE 'Proposals remaining: %', proposal_count;
    RAISE NOTICE 'Users created: %', user_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NEW LOGIN CREDENTIALS:';
    RAISE NOTICE 'Admin PIN: 1978';
    RAISE NOTICE 'Partner PIN: 7531';
    RAISE NOTICE '========================================';
END $$;

-- Display users
SELECT 
    id, 
    email, 
    role, 
    organization_name, 
    full_name,
    is_active,
    created_at
FROM users
ORDER BY role DESC;

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
-- IMPORTANT NOTES
-- =====================================================
-- 1. Frontend code already updated with new PINs
-- 2. Clear browser localStorage after running this
-- 3. Restart your dev server
-- 4. Test login with new PINs
-- =====================================================

