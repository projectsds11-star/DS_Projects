-- 008_daily_work_reports.sql
-- Migration for daily candidate Excel field work reports

CREATE TABLE IF NOT EXISTS public.daily_work_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(50) UNIQUE NOT NULL,
  employee_id VARCHAR(50) NOT NULL,
  employee_name VARCHAR(150),
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  district VARCHAR(100),
  mandal VARCHAR(100),
  total_enterprises INTEGER DEFAULT 0,
  records JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary_notes TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size VARCHAR(50),
  status VARCHAR(50) NOT NULL DEFAULT 'Submitted',
  admin_remarks TEXT,
  verified_by VARCHAR(100),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_daily_work_reports_emp ON public.daily_work_reports(employee_id);
CREATE INDEX IF NOT EXISTS idx_daily_work_reports_date ON public.daily_work_reports(work_date);
CREATE INDEX IF NOT EXISTS idx_daily_work_reports_status ON public.daily_work_reports(status);

-- Enable Row Level Security
ALTER TABLE public.daily_work_reports ENABLE ROW LEVEL SECURITY;

-- Allow service role full management
DROP POLICY IF EXISTS "service_role_daily_work_reports" ON public.daily_work_reports;
CREATE POLICY "service_role_daily_work_reports"
  ON public.daily_work_reports FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Allow authenticated and anon full read/write for field candidates & admin dashboard
DROP POLICY IF EXISTS "anon_daily_work_reports_all" ON public.daily_work_reports;
CREATE POLICY "anon_daily_work_reports_all"
  ON public.daily_work_reports FOR ALL TO anon, authenticated
  USING (true) WITH CHECK (true);
