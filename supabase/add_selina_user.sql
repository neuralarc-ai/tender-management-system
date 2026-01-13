-- =====================================================
-- ADD NEW USER: Selina Bieber - GoDaddy
-- Description: Add new client user without affecting existing data
-- Date: January 13, 2026
-- =====================================================

-- Add Selina Bieber as new user
-- PIN: 8642 (bcrypt hash: $2b$10$kBnhFI7407CwD6o4Tcj55.fmEM/HQ.wkqlmPpOZqmKfuvKC5b6nbq)
INSERT INTO users (id, email, role, organization_name, full_name, pin_hash, is_active, created_at) VALUES
    ('33333333-3333-3333-3333-333333333333', 'selina@godaddy.com', 'client', 'GoDaddy', 'Selina Bieber', '$2b$10$kBnhFI7407CwD6o4Tcj55.fmEM/HQ.wkqlmPpOZqmKfuvKC5b6nbq', TRUE, NOW());

-- Add user settings for Selina
INSERT INTO user_settings (user_id, email_notifications, desktop_alerts, weekly_reports, sms_updates, timezone) VALUES
    ('33333333-3333-3333-3333-333333333333', TRUE, TRUE, FALSE, FALSE, 'America/Phoenix');

-- Verify the new user was added
SELECT 'SUCCESS: Selina Bieber added successfully!' as status;
SELECT COUNT(*) as total_users FROM users;
SELECT email, role, organization_name, full_name FROM users ORDER BY created_at;

-- =====================================================
-- NEW USER CREDENTIALS:
-- Name: Selina Bieber
-- Organization: GoDaddy  
-- Email: selina@godaddy.com
-- PIN: 8642
-- Role: client
-- =====================================================
