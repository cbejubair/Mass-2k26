-- Migration v5: Redesign survey_feedback columns for new survey questions
-- Old columns (from v2) are replaced with new focused fields

-- Drop old columns
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS timing_preference;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS transport_feasibility;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS comfort_level;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS safety_measures;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS atmosphere_preference;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS support_score;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS challenges;
ALTER TABLE survey_feedback DROP COLUMN IF EXISTS suggestion_text;

-- Add new columns
ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS transport_after_event TEXT
    CHECK (transport_after_event IN ('by_own', 'out_bus', 'hosteler', 'parent'));

ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS need_college_transport TEXT
    CHECK (need_college_transport IN ('yes', 'no'));

-- Area and distance only collected when need_college_transport = 'yes'
ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS transport_area TEXT;

ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS transport_distance TEXT;

-- Stall interests as a text array (e.g., '{shawarma,mojito,momos}')
ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS stall_interest TEXT[];

-- Keep creative_suggestions (already present from v2, safe to re-add with IF NOT EXISTS)
ALTER TABLE survey_feedback
  ADD COLUMN IF NOT EXISTS creative_suggestions TEXT;
