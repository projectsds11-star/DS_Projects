-- ==============================================================================
-- DS PROJECTS HRMS — EMPLOYEE PORTAL PASSWORD & CREDENTIALS SCHEMA
-- Run this script in the Supabase SQL Editor to enable persistent password storage
-- ==============================================================================

-- 1. Add `password` column to the `employees` table (if not exists)
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 2. Add `password` column to the `job_offers` table (for onboarding offers)
ALTER TABLE public.job_offers 
ADD COLUMN IF NOT EXISTS password TEXT;

-- 3. Create dedicated `employee_credentials` table (Recommended for Auth)
CREATE TABLE IF NOT EXISTS public.employee_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT employee_credentials_email_key UNIQUE (email)
);

-- 4. Enable Row Level Security (RLS) and grant permissions
ALTER TABLE public.employee_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access" ON public.employee_credentials;
CREATE POLICY "Allow service role full access" 
ON public.employee_credentials 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Helpful index for rapid email & employee_id lookup
CREATE INDEX IF NOT EXISTS idx_employee_credentials_email ON public.employee_credentials(email);
CREATE INDEX IF NOT EXISTS idx_employee_credentials_emp_id ON public.employee_credentials(employee_id);
