-- ==============================================================================
-- DS PROJECTS — AGENCIES MODULE MIGRATION (005)
-- Run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS public.agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  state_id TEXT NOT NULL DEFAULT 'AP-STATE-01',
  state_name TEXT NOT NULL DEFAULT 'Andhra Pradesh',
  district_id TEXT NOT NULL DEFAULT '',
  district_name TEXT NOT NULL DEFAULT '',
  mandal_id TEXT NOT NULL DEFAULT '',
  mandal_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  pincode TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- 2. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_agencies_status ON public.agencies(status);
CREATE INDEX IF NOT EXISTS idx_agencies_district ON public.agencies(district_name);
CREATE INDEX IF NOT EXISTS idx_agencies_deleted_at ON public.agencies(deleted_at);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

-- Service role full access
DROP POLICY IF EXISTS "service_role_agencies" ON public.agencies;
CREATE POLICY "service_role_agencies"
  ON public.agencies FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public / Authenticated read access
DROP POLICY IF EXISTS "anon_read_agencies" ON public.agencies;
CREATE POLICY "anon_read_agencies"
  ON public.agencies FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);

-- Public / Authenticated insert / update access for admin console
DROP POLICY IF EXISTS "anon_all_agencies" ON public.agencies;
CREATE POLICY "anon_all_agencies"
  ON public.agencies FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);

-- 4. SEED SAMPLE AGENCY IF EMPTY
INSERT INTO public.agencies (
  agency_code, name, contact_person, phone, email,
  state_id, state_name, district_id, district_name, mandal_id, mandal_name,
  address, pincode, status, notes
)
SELECT
  'AG-001', 'Apex Tech Solutions & Operations', 'Ramesh Varma', '9876543210', 'contact@apextech.in',
  'AP-STATE-01', 'Andhra Pradesh', 'AP-DIS-21', 'NTR', 'AP-NTR-M01', 'Vijayawada Rural',
  'D.No 40-1-28, MG Road, Benz Circle', '520010', 'active', 'Primary field operations and logistics coordination partner.'
WHERE NOT EXISTS (SELECT 1 FROM public.agencies LIMIT 1);
