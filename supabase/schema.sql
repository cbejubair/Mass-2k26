-- ============================================
-- MASS 2K26 - Complete Database Schema (V3)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  register_number TEXT UNIQUE,
  name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'class_coordinator', 'student')) DEFAULT 'student',
  department TEXT,
  year TEXT,
  class_section TEXT,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_register_number ON users(register_number);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department_year_class ON users(department, year, class_section);

-- ============================================
-- 2. EVENT REGISTRATIONS TABLE
--    (aka "Event Coordinator Willingness Form")
-- ============================================
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  support_status BOOLEAN DEFAULT false,
  willing_to_coordinate BOOLEAN DEFAULT false,
  interested_roles TEXT[] DEFAULT '{}',
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_event_reg_user ON event_registrations(user_id);

-- ============================================
-- 3. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  screenshot_url TEXT NOT NULL,
  payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  payment_mode TEXT DEFAULT 'upi',
  transaction_ref TEXT,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(payment_status);

-- ============================================
-- 4. PERFORMANCE REGISTRATIONS TABLE
--    team_members format: [{"register_number":"REG001","name":"John","department":"CSE","year":"III","class_section":"A"}]
-- ============================================
CREATE TABLE performance_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  performance_type TEXT NOT NULL,
  participants_count INTEGER NOT NULL DEFAULT 1,
  leader_name TEXT NOT NULL,
  is_team BOOLEAN DEFAULT false,
  team_members JSONB DEFAULT '[]',
  special_requirements TEXT,
  music_file_url TEXT,
  approval_status TEXT NOT NULL CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_perf_user ON performance_registrations(user_id);
CREATE INDEX idx_perf_status ON performance_registrations(approval_status);

-- ============================================
-- 5. SURVEY FEEDBACK TABLE
--    Structured multi-question survey form
-- ============================================
CREATE TABLE survey_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  timing_preference TEXT CHECK (timing_preference IN ('plan_a', 'plan_b')),
  transport_feasibility TEXT CHECK (transport_feasibility IN ('yes', 'no', 'need_college_transport')),
  comfort_level TEXT CHECK (comfort_level IN ('yes', 'no', 'depends')),
  safety_measures TEXT,
  atmosphere_preference TEXT CHECK (atmosphere_preference IN ('daytime', 'night_concert', 'balanced')),
  support_score INTEGER CHECK (support_score >= 1 AND support_score <= 5),
  challenges TEXT,
  creative_suggestions TEXT,
  suggestion_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 6. ENTRY QR TABLE
--    Check-in / Check-out tracking with timestamps
-- ============================================
CREATE TABLE entry_qr (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  qr_token UUID NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  is_active BOOLEAN DEFAULT true,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES users(id),
  checked_out_at TIMESTAMPTZ,
  checked_out_by UUID REFERENCES users(id),
  UNIQUE(user_id)
);

CREATE INDEX idx_qr_token ON entry_qr(qr_token);
CREATE INDEX idx_qr_user ON entry_qr(user_id);

-- ============================================
-- 7. AGENDA TABLE
-- ============================================
CREATE TABLE agenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT,
  assigned_performance_id UUID REFERENCES performance_registrations(id),
  stage_requirements TEXT
);

CREATE INDEX idx_agenda_time ON agenda(start_time, end_time);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_qr ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS — backend API routes using service role key will work.
-- For direct client access, add policies as needed.

-- ============================================
-- STORAGE BUCKETS (run via Supabase dashboard or API)
-- ============================================
-- Create bucket: mass2026
-- Folders: payments/{register_number}/, music/{register_number}/

-- ============================================
-- SEED: Default Admin User
-- Password: admin123 (bcrypt hashed)
-- ============================================
INSERT INTO users (register_number, name, mobile_number, role, department, password_hash, must_change_password)
VALUES (
  'ADMIN001',
  'System Admin',
  '0000000000',
  'admin',
  'Administration',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: password
  false
);
