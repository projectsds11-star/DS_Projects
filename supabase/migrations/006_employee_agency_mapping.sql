-- ==============================================================================
-- DS PROJECTS — EMPLOYEE AGENCY MAPPING MIGRATION (006)
-- Run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. ADD AGENCY COLUMNS TO EMPLOYEES TABLE
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS agency_id TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS agency_name TEXT DEFAULT '';

-- 2. CREATE INDEX FOR FAST AGENCY LOOKUP
CREATE INDEX IF NOT EXISTS idx_employees_agency_id ON public.employees(agency_id);
