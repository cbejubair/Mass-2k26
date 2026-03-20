-- Add Instagram links for poll options and seed Day Event DJ list

ALTER TABLE event_poll_options
ADD COLUMN IF NOT EXISTS instagram_url TEXT;

-- Normalize first five options to Day Event DJs
INSERT INTO event_poll_options (label, sort_order, instagram_url, is_active)
VALUES
  ('DJ YoYo', 1, 'https://www.instagram.com/djyoyo.india?igsh=a2Z3cDF4a2s4cXYy', true),
  ('DJ Yash', 2, 'https://www.instagram.com/djyashcbe?igsh=a3JvanJ3OWFpaHUy', true),
  ('DJ Nandhu', 3, 'https://www.instagram.com/dj_nandhu_snk?igsh=Y3hpdnUxYWg5bW9q', true),
  ('DJ Zayn', 4, 'https://www.instagram.com/dj_zayn___?igsh=MXE0NTZiYjZwdmtzNA==', true),
  ('DJ Maddy', 5, 'https://www.instagram.com/djmaddy_official_?igsh=MTJ3aDN1NG1ta3FiZg==', true)
ON CONFLICT (sort_order)
DO UPDATE SET
  label = EXCLUDED.label,
  instagram_url = EXCLUDED.instagram_url,
  is_active = true;

-- Keep only the first five options active for this poll
UPDATE event_poll_options
SET is_active = false
WHERE sort_order NOT BETWEEN 1 AND 5;
