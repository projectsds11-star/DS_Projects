-- ============================================================
-- DS PROJECTS — Migration 003
-- Enforce one offer per employee at the database level.
-- Adds a UNIQUE constraint on job_offers(employee_id)
-- so no second offer can ever be inserted for the same employee.
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- Remove any existing duplicate offers, keeping only the latest one per employee
-- (run this BEFORE adding the constraint)
DELETE FROM public.job_offers
WHERE id NOT IN (
  SELECT DISTINCT ON (employee_id) id
  FROM public.job_offers
  ORDER BY employee_id, created_at DESC
);

-- Add the UNIQUE constraint
ALTER TABLE public.job_offers
  ADD CONSTRAINT job_offers_employee_id_unique UNIQUE (employee_id);

-- ============================================================
-- DONE.
-- Each employee can now have at most one offer letter.
-- A second insert will raise a unique_violation (23505).
-- ============================================================
