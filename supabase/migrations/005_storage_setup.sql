-- =====================================================
-- MIGRATION 005: Supabase Storage Setup
-- Description: Create storage buckets for file uploads
-- Author: System
-- Date: 2025-12-22
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKET: tender-files
-- Description: Store tender documents and attachments
-- =====================================================

-- Create bucket (run this in Supabase Dashboard → Storage → New bucket)
-- Bucket name: tender-files
-- Public: false (files should be access-controlled)

-- OR use SQL to create bucket:
INSERT INTO storage.buckets (id, name, public)
VALUES ('tender-files', 'tender-files', false)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES: tender-files bucket
-- =====================================================

-- Allow authenticated users to upload files
CREATE POLICY "authenticated_users_upload" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tender-files' AND
  (storage.foldername(name))[1] = 'tender-documents'
);

-- Allow users to read files they uploaded
CREATE POLICY "users_read_own_files" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tender-files' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- Allow admins to read all files
CREATE POLICY "admins_read_all_files" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'tender-files' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- Allow users to delete their own files
CREATE POLICY "users_delete_own_files" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'tender-files' AND
  auth.uid()::text = (storage.foldername(name))[2]
);

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
-- If the bucket creation fails via SQL, create it manually:
-- 1. Go to Supabase Dashboard
-- 2. Click Storage in sidebar
-- 3. Click "New bucket"
-- 4. Name: tender-files
-- 5. Public: OFF (uncheck)
-- 6. Click "Create bucket"
-- 
-- Then run the storage policies above in SQL Editor

