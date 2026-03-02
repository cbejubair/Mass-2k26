-- ============================================
-- MASS 2K26 - Migration V2
-- Run this in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PAYMENTS TABLE - Add transaction reference & payment mode
-- ============================================
ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'upi';
ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_ref TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 2. EVENT REGISTRATIONS - Add interested roles
-- ============================================
ALTER TABLE event_registrations ADD COLUMN IF NOT EXISTS interested_roles TEXT[] DEFAULT '{}';

-- ============================================
-- 3. PERFORMANCE REGISTRATIONS - Add team support
-- ============================================
ALTER TABLE performance_registrations ADD COLUMN IF NOT EXISTS is_team BOOLEAN DEFAULT false;
ALTER TABLE performance_registrations ADD COLUMN IF NOT EXISTS team_members JSONB DEFAULT '[]';
-- team_members format: [{"register_number": "REG001", "name": "John", "department": "CSE", "year": "III", "class_section": "A"}]

-- ============================================
-- 4. SURVEY FEEDBACK - Restructure to multi-question form
-- ============================================
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS timing_preference TEXT CHECK (timing_preference IN ('plan_a', 'plan_b'));
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS transport_feasibility TEXT CHECK (transport_feasibility IN ('yes', 'no', 'need_college_transport'));
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS comfort_level TEXT CHECK (comfort_level IN ('yes', 'no', 'depends'));
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS safety_measures TEXT;
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS atmosphere_preference TEXT CHECK (atmosphere_preference IN ('daytime', 'night_concert', 'balanced'));
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS support_score INTEGER CHECK (support_score >= 1 AND support_score <= 5);
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS challenges TEXT;
ALTER TABLE survey_feedback ADD COLUMN IF NOT EXISTS creative_suggestions TEXT;

-- Make suggestion_text nullable (it's now just one of many fields)
ALTER TABLE survey_feedback ALTER COLUMN suggestion_text DROP NOT NULL;

-- ============================================
-- END MIGRATION V2
-- ============================================
