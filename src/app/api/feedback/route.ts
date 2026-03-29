import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { coordinatorDashboardRoles } from "@/lib/coordinators";
import {
  FEEDBACK_OPTIONS,
  FEEDBACK_TABLE_SCHEMA,
  type FeedbackFormData,
} from "@/lib/feedback-schema";

const FEEDBACK_ALLOWED_ROLES = [
  "student",
  ...coordinatorDashboardRoles,
] as string[];

const singleChoiceFieldSet = new Set(
  FEEDBACK_TABLE_SCHEMA.filter((row) => row.type === "single").map(
    (row) => row.field,
  ),
);

const paragraphFieldSet = new Set(
  FEEDBACK_TABLE_SCHEMA.filter((row) => row.type === "paragraph").map(
    (row) => row.field,
  ),
);

const requiredFieldSet = new Set(
  FEEDBACK_TABLE_SCHEMA.filter((row) => row.required).map((row) => row.field),
);

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeRegisterNumber(value: unknown): string {
  return normalizeText(value).toUpperCase();
}

function isValidRegisterNumber(value: string): boolean {
  return /^[A-Z0-9-]{3,20}$/.test(value);
}

function isValidSingleChoice(field: string, value: string): boolean {
  const options = FEEDBACK_OPTIONS[field as keyof typeof FEEDBACK_OPTIONS];
  if (!options) return false;
  return options.some((option) => option.value === value);
}

function parseImprovementAreas(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const allowedValues = FEEDBACK_OPTIONS.improvement_areas.map((o) => o.value);
  const allowed = new Set<string>(allowedValues);
  const cleaned = value
    .map((item) => normalizeText(item))
    .filter((item) => item.length > 0 && allowed.has(item));
  return Array.from(new Set(cleaned));
}

function validateRequiredFields(payload: FeedbackFormData): string | null {
  for (const field of requiredFieldSet) {
    const value = payload[field as keyof FeedbackFormData];
    if (field === "improvement_areas") {
      if (!Array.isArray(value) || value.length === 0) {
        return "Please select at least one improvement area.";
      }
      continue;
    }

    if (typeof value === "string" && value.length === 0) {
      return "Please complete all required fields.";
    }
  }

  return null;
}

function sanitizePayload(body: any): FeedbackFormData {
  const payload: FeedbackFormData = {
    register_number: normalizeRegisterNumber(body.register_number),
    student_name: normalizeText(body.student_name),
    overall_event_rating: normalizeText(body.overall_event_rating),
    expectation_match: normalizeText(body.expectation_match),
    planning_coordination: normalizeText(body.planning_coordination),
    schedule_adherence: normalizeText(body.schedule_adherence),
    stage_setup_quality: normalizeText(body.stage_setup_quality),
    lighting_arrangement: normalizeText(body.lighting_arrangement),
    sound_system_clarity: normalizeText(body.sound_system_clarity),
    led_visual_effects: normalizeText(body.led_visual_effects),
    performance_quality: normalizeText(body.performance_quality),
    dj_session_experience: normalizeText(body.dj_session_experience),
    event_energy_engagement: normalizeText(body.event_energy_engagement),
    event_duration: normalizeText(body.event_duration),
    seating_arrangement: normalizeText(body.seating_arrangement),
    crowd_management: normalizeText(body.crowd_management),
    transport_arrangement: normalizeText(body.transport_arrangement),
    coordinator_support: normalizeText(body.coordinator_support),
    discipline_maintained: normalizeText(body.discipline_maintained),
    value_for_money: normalizeText(body.value_for_money),
    best_part: normalizeText(body.best_part),
    improvement_areas: parseImprovementAreas(body.improvement_areas),
    liked_most: normalizeText(body.liked_most),
    improve_next_time: normalizeText(body.improve_next_time),
    suggestions_next_year: normalizeText(body.suggestions_next_year),
    volunteer_next_event: normalizeText(body.volunteer_next_event),
  };

  return payload;
}

function validatePayload(payload: FeedbackFormData): string | null {
  if (!isValidRegisterNumber(payload.register_number)) {
    return "Register number format is invalid.";
  }

  if (payload.student_name.length < 2 || payload.student_name.length > 80) {
    return "Please enter a valid name.";
  }

  for (const field of singleChoiceFieldSet) {
    const value = payload[field as keyof FeedbackFormData];
    if (typeof value !== "string" || value.length === 0) continue;

    if (!isValidSingleChoice(field, value)) {
      return "One or more selected options are invalid.";
    }
  }

  for (const field of paragraphFieldSet) {
    const value = payload[field as keyof FeedbackFormData];
    if (typeof value === "string" && value.length > 1500) {
      return "Paragraph responses should be under 1500 characters.";
    }
  }

  return validateRequiredFields(payload);
}

export async function GET() {
  try {
    const session = await requireAuth(FEEDBACK_ALLOWED_ROLES);
    const registerNumber = session.registerNumber;

    if (!registerNumber) {
      return NextResponse.json({ submitted: false });
    }

    const { data, error } = await supabaseAdmin
      .from("event_feedback_detailed")
      .select("register_number")
      .eq("register_number", registerNumber.toUpperCase())
      .maybeSingle();

    if (error) {
      console.error("Feedback check error:", error);
      return NextResponse.json({ submitted: false });
    }

    return NextResponse.json({ submitted: !!data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(FEEDBACK_ALLOWED_ROLES);

    const body = await req.json();
    const payload = sanitizePayload(body);
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    // Check for duplicate — one submission per register number
    const { data: existing } = await supabaseAdmin
      .from("event_feedback_detailed")
      .select("register_number")
      .eq("register_number", payload.register_number)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "ALREADY_SUBMITTED" },
        { status: 409 },
      );
    }

    const { error } = await supabaseAdmin
      .from("event_feedback_detailed")
      .insert(payload);

    if (error) {
      console.error("Detailed feedback insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit feedback. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
