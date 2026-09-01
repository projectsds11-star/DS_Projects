-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: 004_create_core_app_tables.sql
-- DS PROJECTS — Clean Production Database Schema (Zero Dummy Data)
-- Tables: Employees, Job Offers, Work Tasks, Attendance, Documents, Notifications
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. EMPLOYEES TABLE
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    phone VARCHAR(50) NOT NULL,
    gender VARCHAR(20) DEFAULT 'Male',
    date_of_birth DATE,
    father_name VARCHAR(200),
    blood_group VARCHAR(20),
    marital_status VARCHAR(50),
    district VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    qualification VARCHAR(100),
    designation VARCHAR(150) NOT NULL DEFAULT 'Mandal Co-ordinator',
    department VARCHAR(150) NOT NULL DEFAULT 'Field Operations',
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Onboarding', 'Draft', 'Inactive')),
    onboarding_status VARCHAR(50) NOT NULL DEFAULT 'Pending Offer',
    photo_url TEXT,
    address TEXT,
    permanent_address TEXT,
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(50),
    aadhaar_masked VARCHAR(50),
    pan_masked VARCHAR(50),
    bank_name VARCHAR(150),
    account_number_masked VARCHAR(50),
    ifsc_code VARCHAR(50),
    branch_name VARCHAR(150),
    joining_date DATE,
    reporting_officer VARCHAR(200),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employees_emp_id ON public.employees (employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON public.employees (email);
CREATE INDEX IF NOT EXISTS idx_employees_district ON public.employees (district);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees (status);

-- 3. JOB OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_number VARCHAR(100) NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    employee_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    position VARCHAR(150) NOT NULL,
    department VARCHAR(150) NOT NULL DEFAULT 'Field Operations',
    district VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    employment_type VARCHAR(50) DEFAULT 'Full Time',
    work_location VARCHAR(100) DEFAULT 'Field',
    joining_date DATE NOT NULL,
    reporting_manager VARCHAR(200),
    probation VARCHAR(50) DEFAULT '3 Months',
    notice_period VARCHAR(50) DEFAULT '30 Days',
    basic_salary NUMERIC(12,2) DEFAULT 0,
    travel_allowance NUMERIC(12,2) DEFAULT 0,
    incentive NUMERIC(12,2) DEFAULT 0,
    other_allowance NUMERIC(12,2) DEFAULT 0,
    monthly_total NUMERIC(12,2) DEFAULT 0,
    annual_ctc NUMERIC(12,2) DEFAULT 0,
    job_description TEXT,
    responsibilities TEXT,
    terms_and_conditions TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Offer Sent' CHECK (status IN ('Offer Draft', 'Offer Generated', 'Offer Sent', 'Offer Accepted', 'Offer Rejected', 'Onboarding Completed')),
    email_status VARCHAR(50) DEFAULT 'Delivered',
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_offers_offer_number ON public.job_offers (offer_number);
CREATE INDEX IF NOT EXISTS idx_job_offers_emp_id ON public.job_offers (employee_id);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers (status);

-- 4. WORK TASKS TABLE
CREATE TABLE IF NOT EXISTS public.work_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    instructions JSONB DEFAULT '[]'::jsonb,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Normal', 'Low')),
    due_date VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Submitted', 'Approved', 'Overdue')),
    district VARCHAR(100) NOT NULL,
    mandal VARCHAR(100) NOT NULL,
    location_name VARCHAR(200) NOT NULL,
    target_metric VARCHAR(100),
    completed_count INT DEFAULT 0,
    supervisor_name VARCHAR(200) DEFAULT 'District Lead',
    assigned_employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    report_summary TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    admin_feedback TEXT,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_work_tasks_code ON public.work_tasks (task_code);
CREATE INDEX IF NOT EXISTS idx_work_tasks_emp_id ON public.work_tasks (assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_work_tasks_status ON public.work_tasks (status);

-- 5. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    punch_date VARCHAR(50) NOT NULL,
    check_in_time VARCHAR(50),
    check_out_time VARCHAR(50),
    effective_hours VARCHAR(50),
    location_name VARCHAR(200) DEFAULT 'Field HQ',
    status VARCHAR(50) NOT NULL DEFAULT 'Present' CHECK (status IN ('Present', 'Late', 'Absent', 'On Duty', 'Half Day')),
    is_regularized BOOLEAN DEFAULT FALSE,
    regularization_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attendance_emp_id ON public.attendance_records (employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records (punch_date);

-- 6. EMPLOYEE DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    document_name VARCHAR(250) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Official Letters', 'KYC & Identity', 'Academic', 'Field Reports')),
    file_url TEXT,
    file_type VARCHAR(20) DEFAULT 'PDF',
    file_size VARCHAR(50) DEFAULT '1.0 MB',
    verification_status VARCHAR(50) NOT NULL DEFAULT 'Pending' CHECK (verification_status IN ('Verified', 'Pending', 'Not Uploaded', 'Rejected')),
    verified_by VARCHAR(150),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_emp_id ON public.employee_documents (employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.employee_documents (category);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) NOT NULL REFERENCES public.employees(employee_id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'info' CHECK (type IN ('task', 'success', 'reminder', 'announcement', 'info', 'work')),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_link TEXT,
    action_text VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_emp_id ON public.notifications (employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (is_read);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Allow public and authenticated read/write access
CREATE POLICY "Allow read access to employees" ON public.employees FOR SELECT USING (true);
CREATE POLICY "Allow all access to employees" ON public.employees FOR ALL USING (true);

CREATE POLICY "Allow read access to job_offers" ON public.job_offers FOR SELECT USING (true);
CREATE POLICY "Allow all access to job_offers" ON public.job_offers FOR ALL USING (true);

CREATE POLICY "Allow read access to work_tasks" ON public.work_tasks FOR SELECT USING (true);
CREATE POLICY "Allow all access to work_tasks" ON public.work_tasks FOR ALL USING (true);

CREATE POLICY "Allow read access to attendance_records" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Allow all access to attendance_records" ON public.attendance_records FOR ALL USING (true);

CREATE POLICY "Allow read access to employee_documents" ON public.employee_documents FOR SELECT USING (true);
CREATE POLICY "Allow all access to employee_documents" ON public.employee_documents FOR ALL USING (true);

CREATE POLICY "Allow read access to notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true);
