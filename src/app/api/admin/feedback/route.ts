import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const { data, error } = await supabaseAdmin
      .from("event_feedback_detailed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw error;

    return NextResponse.json({ feedback: data || [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
