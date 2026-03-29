export type FeedbackSingleField =
  | "overall_event_rating"
  | "expectation_match"
  | "planning_coordination"
  | "schedule_adherence"
  | "stage_setup_quality"
  | "lighting_arrangement"
  | "sound_system_clarity"
  | "led_visual_effects"
  | "performance_quality"
  | "dj_session_experience"
  | "event_energy_engagement"
  | "event_duration"
  | "seating_arrangement"
  | "crowd_management"
  | "transport_arrangement"
  | "coordinator_support"
  | "discipline_maintained"
  | "value_for_money"
  | "best_part"
  | "volunteer_next_event";

export type FeedbackTextField =
  | "liked_most"
  | "improve_next_time"
  | "suggestions_next_year";

export type FeedbackArrayField = "improvement_areas";

export type FeedbackField =
  | "register_number"
  | "student_name"
  | FeedbackSingleField
  | FeedbackTextField
  | FeedbackArrayField;

export interface FeedbackFormData {
  register_number: string;
  student_name: string;
  overall_event_rating: string;
  expectation_match: string;
  planning_coordination: string;
  schedule_adherence: string;
  stage_setup_quality: string;
  lighting_arrangement: string;
  sound_system_clarity: string;
  led_visual_effects: string;
  performance_quality: string;
  dj_session_experience: string;
  event_energy_engagement: string;
  event_duration: string;
  seating_arrangement: string;
  crowd_management: string;
  transport_arrangement: string;
  coordinator_support: string;
  discipline_maintained: string;
  value_for_money: string;
  best_part: string;
  improvement_areas: string[];
  liked_most: string;
  improve_next_time: string;
  suggestions_next_year: string;
  volunteer_next_event: string;
}

export interface FeedbackOption {
  value: string;
  label: string;
}

export interface FeedbackSchemaRow {
  section: string;
  field: FeedbackField;
  question: string;
  type: "text" | "single" | "multi" | "paragraph";
  required: boolean;
  options?: readonly FeedbackOption[];
}

const EXCELLENT_TO_POOR: FeedbackOption[] = [
  { value: "excellent", label: "Excellent" },
  { value: "good", label: "Good" },
  { value: "average", label: "Average" },
  { value: "poor", label: "Poor" },
];

export const FEEDBACK_OPTIONS = {
  overall_event_rating: [
    { value: "excellent", label: "Excellent" },
    { value: "good", label: "Good" },
    { value: "average", label: "Average" },
    { value: "poor", label: "Poor" },
    { value: "very_poor", label: "Very Poor" },
  ],
  expectation_match: [
    { value: "fully_met", label: "Fully met" },
    { value: "partially_met", label: "Partially met" },
    { value: "neutral", label: "Neutral" },
    { value: "not_met", label: "Not met" },
  ],
  planning_coordination: EXCELLENT_TO_POOR,
  schedule_adherence: [
    { value: "on_time", label: "Yes, on time" },
    { value: "slight_delays", label: "Slight delays" },
    { value: "major_delays", label: "Major delays" },
    { value: "no_schedule", label: "No schedule followed" },
  ],
  stage_setup_quality: EXCELLENT_TO_POOR,
  lighting_arrangement: EXCELLENT_TO_POOR,
  sound_system_clarity: EXCELLENT_TO_POOR,
  led_visual_effects: EXCELLENT_TO_POOR,
  performance_quality: EXCELLENT_TO_POOR,
  dj_session_experience: EXCELLENT_TO_POOR,
  event_energy_engagement: EXCELLENT_TO_POOR,
  event_duration: [
    { value: "too_long", label: "Too long" },
    { value: "perfect", label: "Perfect" },
    { value: "too_short", label: "Too short" },
  ],
  seating_arrangement: EXCELLENT_TO_POOR,
  crowd_management: EXCELLENT_TO_POOR,
  transport_arrangement: [
    ...EXCELLENT_TO_POOR,
    { value: "not_used", label: "Not used" },
  ],
  coordinator_support: EXCELLENT_TO_POOR,
  discipline_maintained: EXCELLENT_TO_POOR,
  value_for_money: [
    { value: "worth_it", label: "Worth it" },
    { value: "neutral", label: "Neutral" },
    { value: "not_worth", label: "Not worth" },
  ],
  best_part: [
    { value: "dj_session", label: "DJ Session" },
    { value: "performances", label: "Performances" },
    { value: "stage_lighting", label: "Stage & Lighting" },
    { value: "crowd_energy", label: "Crowd Energy" },
    { value: "overall_atmosphere", label: "Overall Atmosphere" },
  ],
  improvement_areas: [
    { value: "sound", label: "Sound" },
    { value: "lighting", label: "Lighting" },
    { value: "scheduling", label: "Scheduling" },
    { value: "crowd_control", label: "Crowd control" },
    { value: "performance_selection", label: "Performance selection" },
    { value: "dj_duration", label: "DJ duration" },
    { value: "seating", label: "Seating" },
    { value: "transport", label: "Transport" },
  ],
  volunteer_next_event: [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "maybe", label: "Maybe" },
  ],
} as const;

export const FEEDBACK_FIELD_TO_COLUMN_MAP: Record<FeedbackField, string> = {
  register_number: "register_number",
  student_name: "student_name",
  overall_event_rating: "overall_event_rating",
  expectation_match: "expectation_match",
  planning_coordination: "planning_coordination",
  schedule_adherence: "schedule_adherence",
  stage_setup_quality: "stage_setup_quality",
  lighting_arrangement: "lighting_arrangement",
  sound_system_clarity: "sound_system_clarity",
  led_visual_effects: "led_visual_effects",
  performance_quality: "performance_quality",
  dj_session_experience: "dj_session_experience",
  event_energy_engagement: "event_energy_engagement",
  event_duration: "event_duration",
  seating_arrangement: "seating_arrangement",
  crowd_management: "crowd_management",
  transport_arrangement: "transport_arrangement",
  coordinator_support: "coordinator_support",
  discipline_maintained: "discipline_maintained",
  value_for_money: "value_for_money",
  best_part: "best_part",
  improvement_areas: "improvement_areas",
  liked_most: "liked_most",
  improve_next_time: "improve_next_time",
  suggestions_next_year: "suggestions_next_year",
  volunteer_next_event: "volunteer_next_event",
};

export const FEEDBACK_TABLE_SCHEMA: FeedbackSchemaRow[] = [
  {
    section: "Participant Details",
    field: "register_number",
    question: "Register Number",
    type: "text",
    required: true,
  },
  {
    section: "Participant Details",
    field: "student_name",
    question: "Name",
    type: "text",
    required: true,
  },
  {
    section: "Section 1 - Overall Event Experience",
    field: "overall_event_rating",
    question: "How would you rate the overall event?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.overall_event_rating,
  },
  {
    section: "Section 1 - Overall Event Experience",
    field: "expectation_match",
    question: "Did the event meet your expectations?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.expectation_match,
  },
  {
    section: "Section 2 - Event Planning & Organization",
    field: "planning_coordination",
    question: "How was the overall planning and coordination?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.planning_coordination,
  },
  {
    section: "Section 2 - Event Planning & Organization",
    field: "schedule_adherence",
    question: "Was the event schedule followed properly?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.schedule_adherence,
  },
  {
    section: "Section 3 - Stage & Production Quality",
    field: "stage_setup_quality",
    question: "Stage setup quality",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.stage_setup_quality,
  },
  {
    section: "Section 3 - Stage & Production Quality",
    field: "lighting_arrangement",
    question: "Lighting arrangement",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.lighting_arrangement,
  },
  {
    section: "Section 3 - Stage & Production Quality",
    field: "sound_system_clarity",
    question: "Sound system clarity",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.sound_system_clarity,
  },
  {
    section: "Section 3 - Stage & Production Quality",
    field: "led_visual_effects",
    question: "LED wall / visual effects",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.led_visual_effects,
  },
  {
    section: "Section 4 - Program & Entertainment",
    field: "performance_quality",
    question: "Performance quality overall",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.performance_quality,
  },
  {
    section: "Section 4 - Program & Entertainment",
    field: "dj_session_experience",
    question: "DJ session experience",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.dj_session_experience,
  },
  {
    section: "Section 4 - Program & Entertainment",
    field: "event_energy_engagement",
    question: "Event energy and crowd engagement",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.event_energy_engagement,
  },
  {
    section: "Section 4 - Program & Entertainment",
    field: "event_duration",
    question: "Duration of event",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.event_duration,
  },
  {
    section: "Section 5 - Logistics & Facilities",
    field: "seating_arrangement",
    question: "Seating arrangements",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.seating_arrangement,
  },
  {
    section: "Section 5 - Logistics & Facilities",
    field: "crowd_management",
    question: "Crowd management",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.crowd_management,
  },
  {
    section: "Section 5 - Logistics & Facilities",
    field: "transport_arrangement",
    question: "Transport arrangements (if used)",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.transport_arrangement,
  },
  {
    section: "Section 6 - Coordination & Management",
    field: "coordinator_support",
    question: "Coordinator support",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.coordinator_support,
  },
  {
    section: "Section 6 - Coordination & Management",
    field: "discipline_maintained",
    question: "Discipline maintained during event",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.discipline_maintained,
  },
  {
    section: "Section 8 - Financial & Value",
    field: "value_for_money",
    question: "Event contribution value for money",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.value_for_money,
  },
  {
    section: "Section 9 - Best Part of the Event",
    field: "best_part",
    question: "Which did you enjoy the most?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.best_part,
  },
  {
    section: "Section 10 - Improvement Areas",
    field: "improvement_areas",
    question: "Which areas need improvement?",
    type: "multi",
    required: true,
    options: FEEDBACK_OPTIONS.improvement_areas,
  },
  {
    section: "Section 11 - Final Feedback",
    field: "liked_most",
    question: "What did you like most about MASS 2K26?",
    type: "paragraph",
    required: true,
  },
  {
    section: "Section 11 - Final Feedback",
    field: "improve_next_time",
    question: "What should be improved next time?",
    type: "paragraph",
    required: true,
  },
  {
    section: "Section 11 - Final Feedback",
    field: "suggestions_next_year",
    question: "Any suggestions for next year event?",
    type: "paragraph",
    required: true,
  },
  {
    section: "Section 11 - Final Feedback",
    field: "volunteer_next_event",
    question: "Would you volunteer for next event?",
    type: "single",
    required: true,
    options: FEEDBACK_OPTIONS.volunteer_next_event,
  },
];

export const FEEDBACK_RATING_SCORE_MAP: Record<string, number> = {
  excellent: 5,
  good: 4,
  average: 3,
  poor: 2,
  very_poor: 1,
};

export const FEEDBACK_INITIAL_STATE: FeedbackFormData = {
  register_number: "",
  student_name: "",
  overall_event_rating: "",
  expectation_match: "",
  planning_coordination: "",
  schedule_adherence: "",
  stage_setup_quality: "",
  lighting_arrangement: "",
  sound_system_clarity: "",
  led_visual_effects: "",
  performance_quality: "",
  dj_session_experience: "",
  event_energy_engagement: "",
  event_duration: "",
  seating_arrangement: "",
  crowd_management: "",
  transport_arrangement: "",
  coordinator_support: "",
  discipline_maintained: "",
  value_for_money: "",
  best_part: "",
  improvement_areas: [],
  liked_most: "",
  improve_next_time: "",
  suggestions_next_year: "",
  volunteer_next_event: "",
};
