-- ==============================================================================
-- DS PROJECTS — PRODUCTION SECURITY HARDENING & RLS POLICIES MIGRATION (004)
-- Run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. SECURE EMPLOYEE CREDENTIALS
-- Revoke all anonymous and public access to employee_credentials
ALTER TABLE IF EXISTS public.employee_credentials ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies
DROP POLICY IF EXISTS "anon_read_credentials" ON public.employee_credentials;
DROP POLICY IF EXISTS "public_read_credentials" ON public.employee_credentials;
DROP POLICY IF EXISTS "Allow anon read" ON public.employee_credentials;
DROP POLICY IF EXISTS "Allow service role full access" ON public.employee_credentials;

-- Explicitly revoke SELECT from anon and authenticated roles on credentials
REVOKE ALL ON public.employee_credentials FROM anon;
REVOKE ALL ON public.employee_credentials FROM public;

-- Grant access ONLY to service_role (backend server with SUPABASE_SERVICE_ROLE_KEY)
CREATE POLICY "service_role_credentials_full_access" 
ON public.employee_credentials 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 2. HARDEN EMPLOYEES TABLE ROW LEVEL SECURITY
-- Prevent anonymous clients from dumping employee PII (Aadhaar, PAN, Bank Accounts, Passwords)
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;

-- Remove broad anon full-table read
DROP POLICY IF EXISTS "anon_read_employees" ON public.employees;

-- Allow service_role full control for backend API operations
DROP POLICY IF EXISTS "service_role_employees" ON public.employees;
CREATE POLICY "service_role_employees"
  ON public.employees FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- For portal read operations: allow read access only for non-deleted active records,
-- while sensitive updates/inserts are reserved for service_role
CREATE POLICY "authenticated_employees_read"
  ON public.employees FOR SELECT TO authenticated
  USING (deleted_at IS NULL);

-- 3. SECURE EMAIL DISPATCH LOGS
ALTER TABLE IF EXISTS public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_email_logs" ON public.email_logs;
DROP POLICY IF EXISTS "anon_read_email_logs" ON public.email_logs;

CREATE POLICY "service_role_email_logs"
  ON public.email_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4. SECURE JOB OFFERS TABLE
ALTER TABLE IF EXISTS public.job_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_job_offers" ON public.job_offers;
CREATE POLICY "service_role_job_offers"
  ON public.job_offers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 5. SECURE ATTENDANCE & WORK TASKS
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.work_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_attendance" ON public.attendance_records;
CREATE POLICY "service_role_attendance"
  ON public.attendance_records FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_work_tasks" ON public.work_tasks;
CREATE POLICY "service_role_work_tasks"
  ON public.work_tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 6. VERIFY RLS STATUS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('employees', 'employee_credentials', 'email_logs', 'job_offers', 'attendance_records', 'work_tasks');
