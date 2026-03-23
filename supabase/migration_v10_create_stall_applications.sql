-- MASS 2K26 - Migration V10: Create public stall applications table

CREATE TABLE IF NOT EXISTS stall_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  applicant_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  stall_type TEXT NOT NULL CHECK (stall_type IN ('food', 'product')),
  stall_brand_name TEXT NOT NULL,
  items_to_sell TEXT NOT NULL,
  member_count INTEGER NOT NULL CHECK (member_count > 0),
  cooking_on_site BOOLEAN NOT NULL DEFAULT false,
  power_required BOOLEAN NOT NULL DEFAULT false,
  expected_space TEXT NOT NULL,
  previous_experience TEXT,
  special_requirements TEXT,
  accepted_terms BOOLEAN NOT NULL DEFAULT false CHECK (accepted_terms = true),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stall_applications_created_at
  ON stall_applications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stall_applications_stall_type
  ON stall_applications(stall_type);
