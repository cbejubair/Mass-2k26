-- Migration v11: Detailed feedback form storage for MASS 2K26

CREATE TABLE IF NOT EXISTS event_feedback_detailed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  register_number TEXT NOT NULL UNIQUE,
  student_name TEXT NOT NULL,

  overall_event_rating TEXT NOT NULL
    CHECK (overall_event_rating IN ('excellent', 'good', 'average', 'poor', 'very_poor')),
  expectation_match TEXT NOT NULL
    CHECK (expectation_match IN ('fully_met', 'partially_met', 'neutral', 'not_met')),

  planning_coordination TEXT NOT NULL
    CHECK (planning_coordination IN ('excellent', 'good', 'average', 'poor')),
  schedule_adherence TEXT NOT NULL
    CHECK (schedule_adherence IN ('on_time', 'slight_delays', 'major_delays', 'no_schedule')),

  stage_setup_quality TEXT NOT NULL
    CHECK (stage_setup_quality IN ('excellent', 'good', 'average', 'poor')),
  lighting_arrangement TEXT NOT NULL
    CHECK (lighting_arrangement IN ('excellent', 'good', 'average', 'poor')),
  sound_system_clarity TEXT NOT NULL
    CHECK (sound_system_clarity IN ('excellent', 'good', 'average', 'poor')),
  led_visual_effects TEXT NOT NULL
    CHECK (led_visual_effects IN ('excellent', 'good', 'average', 'poor')),

  performance_quality TEXT NOT NULL
    CHECK (performance_quality IN ('excellent', 'good', 'average', 'poor')),
  dj_session_experience TEXT NOT NULL
    CHECK (dj_session_experience IN ('excellent', 'good', 'average', 'poor')),
  event_energy_engagement TEXT NOT NULL
    CHECK (event_energy_engagement IN ('excellent', 'good', 'average', 'poor')),
  event_duration TEXT NOT NULL
    CHECK (event_duration IN ('too_long', 'perfect', 'too_short')),

  seating_arrangement TEXT NOT NULL
    CHECK (seating_arrangement IN ('excellent', 'good', 'average', 'poor')),
  crowd_management TEXT NOT NULL
    CHECK (crowd_management IN ('excellent', 'good', 'average', 'poor')),
  transport_arrangement TEXT NOT NULL
    CHECK (transport_arrangement IN ('excellent', 'good', 'average', 'poor', 'not_used')),

  coordinator_support TEXT NOT NULL
    CHECK (coordinator_support IN ('excellent', 'good', 'average', 'poor')),
  discipline_maintained TEXT NOT NULL
    CHECK (discipline_maintained IN ('excellent', 'good', 'average', 'poor')),

  value_for_money TEXT NOT NULL
    CHECK (value_for_money IN ('worth_it', 'neutral', 'not_worth')),
  best_part TEXT NOT NULL
    CHECK (best_part IN ('dj_session', 'performances', 'stage_lighting', 'crowd_energy', 'overall_atmosphere')),

  improvement_areas TEXT[] NOT NULL DEFAULT '{}',
  liked_most TEXT NOT NULL,
  improve_next_time TEXT NOT NULL,
  suggestions_next_year TEXT NOT NULL,

  volunteer_next_event TEXT NOT NULL
    CHECK (volunteer_next_event IN ('yes', 'no', 'maybe')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_feedback_detailed_created_at
  ON event_feedback_detailed(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_feedback_detailed_register_number
  ON event_feedback_detailed(register_number);

CREATE OR REPLACE FUNCTION update_event_feedback_detailed_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_event_feedback_detailed_updated_at ON event_feedback_detailed;

CREATE TRIGGER trg_event_feedback_detailed_updated_at
BEFORE UPDATE ON event_feedback_detailed
FOR EACH ROW
EXECUTE FUNCTION update_event_feedback_detailed_updated_at();
