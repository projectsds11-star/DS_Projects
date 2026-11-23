-- ==============================================================================
-- DS PROJECTS — JOB APPLICATIONS MODULE MIGRATION (007)
-- Position: MSME ZED Certification Field Work & General Careers
-- Run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. APPLICATION NUMBER SEQUENCE
CREATE SEQUENCE IF NOT EXISTS job_application_seq START 1;

-- Generator function for Application Number (e.g., APP-2026-0001)
CREATE OR REPLACE FUNCTION generate_application_no() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  v BIGINT;
  current_yr TEXT;
  r TEXT;
BEGIN
  v := nextval('job_application_seq');
  current_yr := TO_CHAR(CURRENT_DATE, 'YYYY');
  r := 'APP-' || current_yr || '-' || LPAD(v::TEXT, 4, '0');
  RETURN r;
END;
$$;

-- 2. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_no TEXT UNIQUE NOT NULL,
  position_applied_for TEXT NOT NULL DEFAULT 'MSME ZED Certification Field Work',
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Section 1: Personal Details
  full_name TEXT NOT NULL,
  father_or_guardian_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE NULL,
  gender TEXT NOT NULL DEFAULT 'Male' CHECK (gender IN ('Male', 'Female', 'Other')),
  mobile_number TEXT NOT NULL,
  alternate_mobile TEXT DEFAULT '',
  email TEXT NOT NULL,
  marital_status TEXT NOT NULL DEFAULT 'Single' CHECK (marital_status IN ('Single', 'Married')),
  aadhaar_or_id_number TEXT NOT NULL DEFAULT '',
  two_wheeler_and_license BOOLEAN NOT NULL DEFAULT false,
  present_address TEXT NOT NULL DEFAULT '',
  permanent_address TEXT NOT NULL DEFAULT '',
  candidate_photo_url TEXT DEFAULT '',

  -- Section 2: Educational Qualifications (JSON array of education records)
  qualifications JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Section 3: Work Experience & Field Readiness
  work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages_known JSONB NOT NULL DEFAULT '["Telugu"]'::jsonb,
  languages_other TEXT DEFAULT '',
  willing_to_travel BOOLEAN NOT NULL DEFAULT true,
  preferred_area TEXT NOT NULL DEFAULT '',

  -- Section 4: Declaration & Sign-off
  place TEXT NOT NULL DEFAULT '',
  declaration_accepted BOOLEAN NOT NULL DEFAULT true,
  signature_url TEXT DEFAULT '',
  resume_url TEXT DEFAULT '',

  -- Section 5: For Office Use Only (DSPROJECTS, Ongole)
  interview_date DATE NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'selected', 'hold', 'rejected')),
  authorized_signatory TEXT DEFAULT '',
  office_notes TEXT DEFAULT '',

  -- Audit Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- 3. INDEXES FOR PERFORMANCE & SEARCH
CREATE INDEX IF NOT EXISTS idx_job_applications_app_no ON public.job_applications(application_no);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(email);
CREATE INDEX IF NOT EXISTS idx_job_applications_mobile ON public.job_applications(mobile_number);
CREATE INDEX IF NOT EXISTS idx_job_applications_created ON public.job_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_deleted ON public.job_applications(deleted_at);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Service Role has unrestricted access
DROP POLICY IF EXISTS "service_role_all_job_applications" ON public.job_applications;
CREATE POLICY "service_role_all_job_applications"
  ON public.job_applications FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public can submit new job applications (INSERT)
DROP POLICY IF EXISTS "public_insert_job_applications" ON public.job_applications;
CREATE POLICY "public_insert_job_applications"
  ON public.job_applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Public / Authenticated read access for non-deleted records
DROP POLICY IF EXISTS "public_select_job_applications" ON public.job_applications;
CREATE POLICY "public_select_job_applications"
  ON public.job_applications FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- Authenticated / Admin can update applications
DROP POLICY IF EXISTS "admin_update_job_applications" ON public.job_applications;
CREATE POLICY "admin_update_job_applications"
  ON public.job_applications FOR UPDATE TO anon, authenticated
  USING (true) WITH CHECK (true);
