-- ============================================
-- MASS 2K26 - Migration V4
-- Multi-entry support: entry_scan_logs table
-- Allows students to enter/exit multiple times
-- Run this AFTER migration_v3.sql
-- ============================================

-- ============================================
-- 1. ENTRY SCAN LOGS TABLE
--    Records every individual check-in or
--    check-out event with its entry number
-- ============================================
CREATE TABLE IF NOT EXISTS entry_scan_logs (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  qr_id         UUID        NOT NULL REFERENCES entry_qr(id) ON DELETE CASCADE,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action        TEXT        NOT NULL CHECK (action IN ('check_in', 'check_out')),
  entry_number  INTEGER     NOT NULL,   -- 1 = 1st entry, 2 = 2nd entry, …
  scanned_by    UUID        REFERENCES users(id),
  scanned_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_qr     ON entry_scan_logs(qr_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_user   ON entry_scan_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_time   ON entry_scan_logs(scanned_at);

-- Enable RLS (service role bypasses — API routes are safe)
ALTER TABLE entry_scan_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. entry_qr — add total_entries counter
--    Reset checked_in_at / checked_out_at on
--    each new cycle instead of blocking re-entry
-- ============================================
ALTER TABLE entry_qr ADD COLUMN IF NOT EXISTS total_entries INTEGER DEFAULT 0;

-- Migrate existing single check-in/out into logs (if data exists)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id, user_id, checked_in_at, checked_in_by,
                  checked_out_at, checked_out_by
           FROM entry_qr
           WHERE checked_in_at IS NOT NULL
  LOOP
    -- Insert check_in log
    INSERT INTO entry_scan_logs (qr_id, user_id, action, entry_number, scanned_by, scanned_at)
    VALUES (r.id, r.user_id, 'check_in', 1, r.checked_in_by, r.checked_in_at)
    ON CONFLICT DO NOTHING;

    -- Insert check_out log if it exists
    IF r.checked_out_at IS NOT NULL THEN
      INSERT INTO entry_scan_logs (qr_id, user_id, action, entry_number, scanned_by, scanned_at)
      VALUES (r.id, r.user_id, 'check_out', 1, r.checked_out_by, r.checked_out_at)
      ON CONFLICT DO NOTHING;

      UPDATE entry_qr SET total_entries = 1 WHERE id = r.id;
    END IF;
  END LOOP;
END $$;
