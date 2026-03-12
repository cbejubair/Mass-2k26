-- ============================================
-- MASS 2K26 - Migration V6: Add photo_url to users table
-- ============================================

-- Add photo_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_photo_url ON users(photo_url) WHERE photo_url IS NOT NULL;

-- Add comment
COMMENT ON COLUMN users.photo_url IS 'URL to student profile photo (uploaded during registration or via settings)';
