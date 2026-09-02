-- =========================================================================
-- DS PROJECTS — ENTERPRISE HRMS & WORKFORCE MANAGEMENT SYSTEM
-- COMPLETE DATABASE SCHEMA MIGRATION SCRIPT
-- =========================================================================
-- Safe to execute repeatedly in Supabase SQL Editor.
-- Handles existing tables cleanly by adding any missing columns before indexes.
-- =========================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =========================================================================
-- 1. EMPLOYEES TABLE (Staff Directory, Workforce & Profile Management)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    gender TEXT DEFAULT 'Male',
    date_of_birth DATE,
    father_name TEXT,
    blood_group TEXT,
    marital_status TEXT DEFAULT 'Single',
    district TEXT DEFAULT 'Nellore',
    mandal TEXT DEFAULT 'Kavali',
    qualification TEXT DEFAULT 'Graduate',
    designation TEXT DEFAULT 'Mandal Co-ordinator',
    department TEXT DEFAULT 'Field Operations',
    experience_years TEXT,
    aadhaar_number TEXT,
    pan_number TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    present_address TEXT,
    permanent_address TEXT,
    status TEXT DEFAULT 'Onboarding',                 -- 'Active', 'Inactive', 'Onboarding', 'Draft'
    onboarding_status TEXT DEFAULT 'Pending Offer',   -- 'Pending Offer', 'Offer Sent', 'Offer Accepted', 'Completed'
    joining_date TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'Male',
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS blood_group TEXT,
ADD COLUMN IF NOT EXISTS marital_status TEXT DEFAULT 'Single',
ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Nellore',
ADD COLUMN IF NOT EXISTS mandal TEXT DEFAULT 'Kavali',
ADD COLUMN IF NOT EXISTS qualification TEXT DEFAULT 'Graduate',
ADD COLUMN IF NOT EXISTS designation TEXT DEFAULT 'Mandal Co-ordinator',
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Field Operations',
ADD COLUMN IF NOT EXISTS experience_years TEXT,
ADD COLUMN IF NOT EXISTS aadhaar_number TEXT,
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
ADD COLUMN IF NOT EXISTS present_address TEXT,
ADD COLUMN IF NOT EXISTS permanent_address TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Onboarding',
ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'Pending Offer',
ADD COLUMN IF NOT EXISTS joining_date TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_onboarding_status ON public.employees(onboarding_status);
CREATE INDEX IF NOT EXISTS idx_employees_district ON public.employees(district);
CREATE INDEX IF NOT EXISTS idx_employees_mandal ON public.employees(mandal);


-- =========================================================================
-- 2. JOB OFFERS TABLE (Onboarding, Offer Letters & Digital Appointment Contracts)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id TEXT,
    employee_id TEXT,
    candidate_name TEXT,
    candidate_email TEXT,
    candidate_phone TEXT,
    position TEXT DEFAULT 'ZED Implementation Co-ordinator',
    department TEXT DEFAULT 'Quality & Assessment',
    employment_type TEXT DEFAULT 'Full Time',
    work_location TEXT DEFAULT 'Field',
    district TEXT DEFAULT 'Nellore',
    mandal TEXT DEFAULT 'Kavali',
    joining_date TEXT,
    monthly_salary NUMERIC DEFAULT 25000,
    annual_ctc NUMERIC DEFAULT 300000,
    salary_breakdown JSONB DEFAULT '{}'::jsonb,
    terms_and_conditions JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'Offer Sent',          -- 'Offer Draft', 'Offer Sent', 'Offer Accepted', 'Offer Rejected', 'Onboarding Completed'
    email_status TEXT DEFAULT 'Pending',       -- 'Pending', 'Delivered', 'Bounced'
    sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    accepted_at TIMESTAMPTZ,
    token TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.job_offers 
ADD COLUMN IF NOT EXISTS offer_id TEXT,
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS candidate_name TEXT,
ADD COLUMN IF NOT EXISTS candidate_email TEXT,
ADD COLUMN IF NOT EXISTS candidate_phone TEXT,
ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'ZED Implementation Co-ordinator',
ADD COLUMN IF NOT EXISTS department TEXT DEFAULT 'Quality & Assessment',
ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'Full Time',
ADD COLUMN IF NOT EXISTS work_location TEXT DEFAULT 'Field',
ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Nellore',
ADD COLUMN IF NOT EXISTS mandal TEXT DEFAULT 'Kavali',
ADD COLUMN IF NOT EXISTS joining_date TEXT,
ADD COLUMN IF NOT EXISTS monthly_salary NUMERIC DEFAULT 25000,
ADD COLUMN IF NOT EXISTS annual_ctc NUMERIC DEFAULT 300000,
ADD COLUMN IF NOT EXISTS salary_breakdown JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS terms_and_conditions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Offer Sent',
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS token TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_job_offers_offer_id ON public.job_offers(offer_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_employee_id ON public.job_offers(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers(status);


-- =========================================================================
-- 3. WORK TASKS TABLE (Work Management, Field Surveys & Reporting)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.work_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_code TEXT,
    title TEXT,
    description TEXT,
    priority TEXT DEFAULT 'Medium',            -- 'High', 'Medium', 'Normal'
    due_date DATE,
    assigned_employee_id TEXT,
    location_name TEXT,
    district TEXT,
    mandal TEXT,
    status TEXT DEFAULT 'Assigned',            -- 'Assigned', 'In Progress', 'Submitted', 'Approved', 'Rejected'
    attachments JSONB DEFAULT '[]'::jsonb,      -- Supervisor uploaded guideline docs/PDFs
    report_summary TEXT,                       -- Employee submitted field remarks
    report_attachments JSONB DEFAULT '[]'::jsonb, -- Employee submitted evidence/photos/sheets
    submitted_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.work_tasks 
ADD COLUMN IF NOT EXISTS task_code TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS assigned_employee_id TEXT,
ADD COLUMN IF NOT EXISTS location_name TEXT,
ADD COLUMN IF NOT EXISTS district TEXT,
ADD COLUMN IF NOT EXISTS mandal TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Assigned',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS report_summary TEXT,
ADD COLUMN IF NOT EXISTS report_attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_work_tasks_task_code ON public.work_tasks(task_code);
CREATE INDEX IF NOT EXISTS idx_work_tasks_assigned_emp ON public.work_tasks(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_work_tasks_status ON public.work_tasks(status);


-- =========================================================================
-- 4. ATTENDANCE RECORDS TABLE (Shift Punches, Geo-Telemetry & Timesheets)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT,
    punch_date TEXT,
    check_in_time TEXT DEFAULT '-- : --',
    check_out_time TEXT DEFAULT '-- : --',
    effective_hours TEXT DEFAULT '0h 00m',
    location_name TEXT DEFAULT 'Field Office',
    status TEXT DEFAULT 'Present',             -- 'Present', 'Late', 'Half Day', 'Absent'
    is_regularized BOOLEAN DEFAULT false,
    regularization_reason TEXT,
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.attendance_records 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS punch_date TEXT,
ADD COLUMN IF NOT EXISTS check_in_time TEXT DEFAULT '-- : --',
ADD COLUMN IF NOT EXISTS check_out_time TEXT DEFAULT '-- : --',
ADD COLUMN IF NOT EXISTS effective_hours TEXT DEFAULT '0h 00m',
ADD COLUMN IF NOT EXISTS location_name TEXT DEFAULT 'Field Office',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Present',
ADD COLUMN IF NOT EXISTS is_regularized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS regularization_reason TEXT,
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_attendance_emp_date ON public.attendance_records(employee_id, punch_date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);


-- =========================================================================
-- 5. EMPLOYEE DOCUMENTS TABLE (Dossier, KYC & Compliance Files)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT,
    document_name TEXT,
    document_type TEXT,
    file_url TEXT,
    file_size TEXT,
    status TEXT DEFAULT 'Verified',
    uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.employee_documents 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS document_name TEXT,
ADD COLUMN IF NOT EXISTS document_type TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Verified',
ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_employee_documents_emp ON public.employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_status ON public.employee_documents(status);


-- =========================================================================
-- 6. NOTIFICATIONS TABLE (Broadcasts, Task Dispatches & System Alerts)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id TEXT,
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'announcement',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Ensure all columns exist even if table pre-existed
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement',
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_emp ON public.notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);


-- =========================================================================
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION ('employee-documents')
-- =========================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-documents', 'employee-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS Access Policies
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE policyname = 'Public Access for Employee Documents' 
        AND tablename = 'objects'
    ) THEN
        CREATE POLICY "Public Access for Employee Documents" ON storage.objects
        FOR ALL USING (bucket_id = 'employee-documents')
        WITH CHECK (bucket_id = 'employee-documents');
    END IF;
END $$;


-- =========================================================================
-- 8. ROW LEVEL SECURITY (RLS) OPEN ACCESS POLICIES
-- =========================================================================
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Employees' AND tablename = 'employees') THEN
        CREATE POLICY "Allow Full Access to Employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Job Offers' AND tablename = 'job_offers') THEN
        CREATE POLICY "Allow Full Access to Job Offers" ON public.job_offers FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Work Tasks' AND tablename = 'work_tasks') THEN
        CREATE POLICY "Allow Full Access to Work Tasks" ON public.work_tasks FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Attendance' AND tablename = 'attendance_records') THEN
        CREATE POLICY "Allow Full Access to Attendance" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Employee Documents' AND tablename = 'employee_documents') THEN
        CREATE POLICY "Allow Full Access to Employee Documents" ON public.employee_documents FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow Full Access to Notifications' AND tablename = 'notifications') THEN
        CREATE POLICY "Allow Full Access to Notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;
