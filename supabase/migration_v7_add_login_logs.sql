-- ============================================
-- MASS 2K26 - Migration V7: Add login_logs table
-- ============================================

CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  register_number TEXT,
  ip_address TEXT,
  user_agent TEXT,
  logged_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_role ON login_logs(role);
CREATE INDEX IF NOT EXISTS idx_login_logs_logged_in_at ON login_logs(logged_in_at DESC);

COMMENT ON TABLE login_logs IS 'Stores successful login events for students, admins, and coordinators';