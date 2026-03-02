export type UserRole = "admin" | "class_coordinator" | "student";

export interface User {
  id: string;
  register_number: string | null;
  name: string;
  mobile_number: string;
  role: UserRole;
  department: string | null;
  year: string | null;
  class_section: string | null;
  password_hash: string;
  must_change_password: boolean;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  support_status: boolean;
  willing_to_coordinate: boolean;
  remarks: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  screenshot_url: string;
  payment_status: "pending" | "approved" | "rejected";
  verified_by: string | null;
  verified_at: string | null;
}

export interface PerformanceRegistration {
  id: string;
  user_id: string;
  performance_type: string;
  participants_count: number;
  leader_name: string;
  special_requirements: string | null;
  music_file_url: string | null;
  approval_status: "pending" | "approved" | "rejected";
}

export interface SurveyFeedback {
  id: string;
  user_id: string;
  suggestion_text: string;
}

export interface EntryQR {
  id: string;
  user_id: string;
  qr_token: string;
  is_active: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  checked_out_at: string | null;
  checked_out_by: string | null;
}

export interface Agenda {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  description: string | null;
  assigned_performance_id: string | null;
  stage_requirements: string | null;
}
