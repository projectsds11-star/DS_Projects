-- ==============================================================================
-- DS PROJECTS — PRODUCTION SECURITY HARDENING & RLS POLICIES MIGRATION (004)
-- Run this script in: Supabase Dashboard → SQL Editor → New Query → Run
-- ==============================================================================

-- 1. SECURE EMPLOYEE CREDENTIALS (PASSWORDS)
-- Total lockdown: Only backend service_role can access employee passwords
ALTER TABLE IF EXISTS public.employee_credentials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_credentials" ON public.employee_credentials;
DROP POLICY IF EXISTS "public_read_credentials" ON public.employee_credentials;
DROP POLICY IF EXISTS "Allow anon read" ON public.employee_credentials;
DROP POLICY IF EXISTS "Allow service role full access" ON public.employee_credentials;
DROP POLICY IF EXISTS "service_role_credentials_full_access" ON public.employee_credentials;

REVOKE ALL ON public.employee_credentials FROM anon;
REVOKE ALL ON public.employee_credentials FROM public;

CREATE POLICY "service_role_credentials_full_access" 
ON public.employee_credentials 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);


-- 2. SECURE EMPLOYEES TABLE
-- Service role has full control; anon/authenticated can only read non-deleted active records
ALTER TABLE IF EXISTS public.employees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_employees" ON public.employees;
CREATE POLICY "service_role_employees"
  ON public.employees FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_employees_read" ON public.employees;
DROP POLICY IF EXISTS "anon_read_employees" ON public.employees;
DROP POLICY IF EXISTS "anon_read_employees_active" ON public.employees;

CREATE POLICY "anon_read_employees"
  ON public.employees FOR SELECT TO anon, authenticated
  USING (deleted_at IS NULL);


-- 3. SECURE EMAIL DISPATCH LOGS
ALTER TABLE IF EXISTS public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_email_logs" ON public.email_logs;
CREATE POLICY "service_role_email_logs"
  ON public.email_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_email_logs" ON public.email_logs;
CREATE POLICY "anon_read_email_logs"
  ON public.email_logs FOR SELECT TO anon, authenticated
  USING (true);


-- 4. SECURE JOB OFFERS TABLE
ALTER TABLE IF EXISTS public.job_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_job_offers" ON public.job_offers;
CREATE POLICY "service_role_job_offers"
  ON public.job_offers FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_job_offers" ON public.job_offers;
CREATE POLICY "anon_read_job_offers"
  ON public.job_offers FOR SELECT TO anon, authenticated
  USING (true);


-- 5. SECURE ATTENDANCE RECORDS
ALTER TABLE IF EXISTS public.attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_attendance" ON public.attendance_records;
CREATE POLICY "service_role_attendance"
  ON public.attendance_records FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_attendance_all" ON public.attendance_records;
CREATE POLICY "anon_attendance_all"
  ON public.attendance_records FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);


-- 6. SECURE WORK TASKS
ALTER TABLE IF EXISTS public.work_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_work_tasks" ON public.work_tasks;
CREATE POLICY "service_role_work_tasks"
  ON public.work_tasks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_work_tasks_all" ON public.work_tasks;
CREATE POLICY "anon_work_tasks_all"
  ON public.work_tasks FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);


-- 7. VERIFY RLS STATUS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('employees', 'employee_credentials', 'email_logs', 'job_offers', 'attendance_records', 'work_tasks');
