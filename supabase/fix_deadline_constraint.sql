-- Fix: Allow tenders with recent past deadlines (for demo/testing)
-- This allows deadlines up to 30 days in the past

-- Drop the old constraint
ALTER TABLE tenders DROP CONSTRAINT IF EXISTS submission_deadline_future;

-- Add a more flexible constraint (allow deadlines within last 30 days or future)
ALTER TABLE tenders ADD CONSTRAINT submission_deadline_reasonable 
CHECK (submission_deadline > NOW() - INTERVAL '30 days');

-- OR for production, keep strict but show better error:
-- ALTER TABLE tenders ADD CONSTRAINT submission_deadline_future 
-- CHECK (submission_deadline > NOW());

