-- ============================================
-- MASS 2K26 - Migration V3
-- Entry QR: Check-in / Check-out with timestamps
-- Performance: Add created_at
-- Run this AFTER migration_v2.sql
-- ============================================

-- ============================================
-- 1. ENTRY QR - Replace single scan with check-in/check-out
-- ============================================

-- Add new check-in/check-out columns
ALTER TABLE entry_qr ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE entry_qr ADD COLUMN IF NOT EXISTS checked_in_by UUID REFERENCES users(id);
ALTER TABLE entry_qr ADD COLUMN IF NOT EXISTS checked_out_at TIMESTAMPTZ;
ALTER TABLE entry_qr ADD COLUMN IF NOT EXISTS checked_out_by UUID REFERENCES users(id);

-- Migrate existing data only if legacy columns exist
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
            AND table_name = 'entry_qr'
            AND column_name = 'scanned_at'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
                AND table_name = 'entry_qr'
                AND column_name = 'scanned_by'
        ) THEN
            EXECUTE '
                UPDATE entry_qr
                SET checked_in_at = scanned_at,
                        checked_in_by = scanned_by
                WHERE scanned_at IS NOT NULL
            ';
        ELSE
            EXECUTE '
                UPDATE entry_qr
                SET checked_in_at = scanned_at
                WHERE scanned_at IS NOT NULL
            ';
        END IF;
    END IF;
END $$;

-- Drop old columns (optional — can keep for safety)
-- ALTER TABLE entry_qr DROP COLUMN IF EXISTS scanned_at;
-- ALTER TABLE entry_qr DROP COLUMN IF EXISTS scanned_by;
-- ALTER TABLE entry_qr DROP COLUMN IF EXISTS scan_status;

-- ============================================
-- 2. PERFORMANCE REGISTRATIONS - Add created_at
-- ============================================
ALTER TABLE performance_registrations ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- END MIGRATION V3
-- ============================================
