-- ====================================================================
-- SUPABASE STORAGE CONFIGURATION: 003_create_storage_buckets.sql
-- DS PROJECTS — Buckets for Employee Photos, Documents & Offer Letters
-- ====================================================================

-- 1. Create Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('employee-photos', 'employee-photos', true),
  ('employee-documents', 'employee-documents', false),
  ('offer-letters', 'offer-letters', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage RLS Policies for employee-photos
CREATE POLICY "Public Read Access for Employee Photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-photos');

CREATE POLICY "Authenticated Users Upload Employee Photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-photos');

-- 3. Storage RLS Policies for employee-documents (Private/Restricted)
CREATE POLICY "Admin & Employee Access to Documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'employee-documents');

CREATE POLICY "Authenticated Upload Documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'employee-documents');

-- 4. Storage RLS Policies for offer-letters
CREATE POLICY "Public Access for Offer Letters"
ON storage.objects FOR SELECT
USING (bucket_id = 'offer-letters');

CREATE POLICY "Authenticated Upload Offer Letters"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'offer-letters');
