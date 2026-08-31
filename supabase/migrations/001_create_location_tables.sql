-- ====================================================================
-- SUPABASE POSTGRESQL MIGRATION: 001_create_location_tables.sql
-- DS PROJECTS — Enterprise Location Master Data (Hierarchy: State -> District -> Mandal)
-- ====================================================================

-- 1. Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. STATES TABLE
CREATE TABLE IF NOT EXISTS public.states (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on state code & name
CREATE INDEX IF NOT EXISTS idx_states_code ON public.states (code);
CREATE INDEX IF NOT EXISTS idx_states_status ON public.states (status);

-- 3. DISTRICTS TABLE
CREATE TABLE IF NOT EXISTS public.districts (
    id VARCHAR(50) PRIMARY KEY,
    state_id VARCHAR(50) NOT NULL REFERENCES public.states(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL,
    headquarters VARCHAR(150),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_districts_state_name UNIQUE (state_id, name)
);

-- Indexes on districts
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON public.districts (state_id);
CREATE INDEX IF NOT EXISTS idx_districts_name ON public.districts (name);
CREATE INDEX IF NOT EXISTS idx_districts_status ON public.districts (status);

-- 4. MANDALS TABLE
CREATE TABLE IF NOT EXISTS public.mandals (
    id VARCHAR(50) PRIMARY KEY,
    district_id VARCHAR(50) NOT NULL REFERENCES public.districts(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_mandals_district_name UNIQUE (district_id, name)
);

-- Indexes on mandals
CREATE INDEX IF NOT EXISTS idx_mandals_district_id ON public.mandals (district_id);
CREATE INDEX IF NOT EXISTS idx_mandals_name ON public.mandals (name);
CREATE INDEX IF NOT EXISTS idx_mandals_status ON public.mandals (status);

-- 5. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trg_states_updated_at ON public.states;
CREATE TRIGGER trg_states_updated_at
    BEFORE UPDATE ON public.states
    FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();

DROP TRIGGER IF EXISTS trg_districts_updated_at ON public.districts;
CREATE TRIGGER trg_districts_updated_at
    BEFORE UPDATE ON public.districts
    FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();

DROP TRIGGER IF EXISTS trg_mandals_updated_at ON public.mandals;
CREATE TRIGGER trg_mandals_updated_at
    BEFORE UPDATE ON public.mandals
    FOR EACH ROW EXECUTE FUNCTION update_location_timestamp();

-- 6. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandals ENABLE ROW LEVEL SECURITY;

-- Allow read-only access to all authenticated and anonymous clients
CREATE POLICY "Allow public read access to states" ON public.states FOR SELECT USING (true);
CREATE POLICY "Allow public read access to districts" ON public.districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access to mandals" ON public.mandals FOR SELECT USING (true);

-- Allow write operations only to service role / super admin
CREATE POLICY "Admin write access to states" ON public.states FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin write access to districts" ON public.districts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Admin write access to mandals" ON public.mandals FOR ALL USING (auth.role() = 'service_role');
