-- Poll system for students and coordinators (single active poll window)

CREATE TABLE IF NOT EXISTS event_poll_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES event_poll_options(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_poll_votes_option_id ON event_poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_event_poll_votes_created_at ON event_poll_votes(created_at DESC);

-- Seed five options once. Update labels later if needed.
INSERT INTO event_poll_options (label, sort_order)
SELECT v.label, v.sort_order
FROM (
  VALUES
    ('Option 1', 1),
    ('Option 2', 2),
    ('Option 3', 3),
    ('Option 4', 4),
    ('Option 5', 5)
) AS v(label, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM event_poll_options o WHERE o.sort_order = v.sort_order
);
