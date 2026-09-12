-- ============================================================
-- DS PROJECTS — Migration 002
-- Change email_logs.employee_id FK from ON DELETE SET NULL
-- to ON DELETE CASCADE so email logs are auto-deleted
-- when an employee is deleted at the database level.
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Drop the old FK constraint
ALTER TABLE public.email_logs
  DROP CONSTRAINT IF EXISTS email_logs_employee_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE public.email_logs
  ADD CONSTRAINT email_logs_employee_id_fkey
  FOREIGN KEY (employee_id)
  REFERENCES public.employees(id)
  ON DELETE CASCADE;

-- ============================================================
-- DONE. email_logs rows are now auto-deleted with the employee.
-- ============================================================
