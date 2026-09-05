-- ============================================================
-- DS PROJECTS Employee Module Production Migration
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. EMPLOYEE ID SEQUENCE
CREATE SEQUENCE IF NOT EXISTS employee_id_seq START 1;

-- Sync sequence to existing data
DO $$
DECLARE max_num INT;
BEGIN
  SELECT COALESCE(MAX(CASE WHEN employee_id ~ '^DS-[0-9]+$' THEN CAST(SUBSTRING(employee_id FROM 4) AS INT) ELSE 0 END), 0)
  INTO max_num FROM public.employees;
  IF max_num > 0 THEN PERFORM setval('employee_id_seq', max_num, true); END IF;
END;
$$;

-- Atomic generator (called server-side only)
CREATE OR REPLACE FUNCTION generate_employee_id() RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE v BIGINT; r TEXT;
BEGIN
  v := nextval('employee_id_seq');
  r := CASE WHEN v < 1000 THEN 'DS-' || LPAD(v::TEXT,3,'0') ELSE 'DS-' || v::TEXT END;
  RETURN r;
END;
$$;

-- Peek function (read-only preview for UI)
CREATE OR REPLACE FUNCTION peek_next_employee_id() RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v BIGINT; r TEXT;
BEGIN
  SELECT last_value + CASE WHEN is_called THEN 1 ELSE 0 END INTO v FROM employee_id_seq;
  r := CASE WHEN v < 1000 THEN 'DS-' || LPAD(v::TEXT,3,'0') ELSE 'DS-' || v::TEXT END;
  RETURN r;
END;
$$;

-- 2. EMPLOYEES TABLE (idempotent)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE NOT NULL DEFAULT '',
  candidate_photo_path TEXT,
  qualification TEXT NOT NULL DEFAULT '',
  course TEXT NOT NULL DEFAULT '',
  university TEXT NOT NULL DEFAULT '',
  year_of_passing TEXT NOT NULL DEFAULT '',
  aadhaar_number TEXT NOT NULL DEFAULT '',
  aadhaar_document_path TEXT,
  pan_number TEXT NOT NULL DEFAULT '',
  pan_document_path TEXT,
  bank_passbook_path TEXT,
  account_holder_name TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  account_number TEXT NOT NULL DEFAULT '',
  ifsc_code TEXT NOT NULL DEFAULT '',
  branch_name TEXT NOT NULL DEFAULT '',
  reference_mobile TEXT NOT NULL DEFAULT '',
  reference_person_name TEXT NOT NULL DEFAULT '',
  reference_relationship TEXT NOT NULL DEFAULT '',
  state_id TEXT NOT NULL DEFAULT '',
  district_id TEXT NOT NULL DEFAULT '',
  mandal_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','onboarding')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ NULL
);

-- 3. ADD MISSING COLUMNS (safe if already exist)
ALTER TABLE public.employees
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS qualification TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS course TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS university TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS year_of_passing TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS aadhaar_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS aadhaar_document_path TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pan_document_path TEXT,
  ADD COLUMN IF NOT EXISTS bank_passbook_path TEXT,
  ADD COLUMN IF NOT EXISTS account_holder_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS bank_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS account_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS ifsc_code TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS branch_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_mobile TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_person_name TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reference_relationship TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS state_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS district_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS mandal_id TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate full_name -> name (preserve existing data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='employees' AND column_name='full_name' AND table_schema='public'
  ) THEN
    UPDATE public.employees
    SET name = full_name
    WHERE (name IS NULL OR name = '') AND full_name IS NOT NULL AND full_name <> '';
  END IF;
END;
$$;

-- Normalize status to lowercase
UPDATE public.employees SET status = LOWER(status) WHERE status ~ '[A-Z]';

-- Add status check constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'employees_status_check' AND conrelid = 'public.employees'::regclass
  ) THEN
    ALTER TABLE public.employees
    ADD CONSTRAINT employees_status_check CHECK (status IN ('active','inactive','onboarding'));
  END IF;
END;
$$;

-- 4. AUTO-UPDATE updated_at TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.employees;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. INDEXES
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email       ON public.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_phone       ON public.employees(phone);
CREATE INDEX IF NOT EXISTS idx_employees_status      ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_district_id ON public.employees(district_id);
CREATE INDEX IF NOT EXISTS idx_employees_mandal_id   ON public.employees(mandal_id);
CREATE INDEX IF NOT EXISTS idx_employees_deleted_at  ON public.employees(deleted_at);

-- 6. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL DEFAULT 'WELCOME_EMPLOYEE',
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('SENT','FAILED','PENDING')),
  error_message TEXT NULL,
  sent_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_employee_id ON public.email_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status      ON public.email_logs(status);

-- 7. ROW LEVEL SECURITY
ALTER TABLE public.employees  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_employees"  ON public.employees;
DROP POLICY IF EXISTS "anon_read_employees"     ON public.employees;
DROP POLICY IF EXISTS "service_role_email_logs" ON public.email_logs;

CREATE POLICY "service_role_employees"
  ON public.employees FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_read_employees"
  ON public.employees FOR SELECT TO anon
  USING (deleted_at IS NULL);

CREATE POLICY "service_role_email_logs"
  ON public.email_logs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 8. FUNCTION PERMISSIONS
GRANT EXECUTE ON FUNCTION peek_next_employee_id() TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION generate_employee_id() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION generate_employee_id() TO service_role;

-- ============================================================
-- DONE.
-- Next steps:
--   1. Create storage bucket "employee-photos"    (Private)
--   2. Create storage bucket "employee-documents" (Private)
--   3. Add SUPABASE_SERVICE_ROLE_KEY to server .env
-- ============================================================
