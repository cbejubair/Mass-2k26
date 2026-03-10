import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const body = await req.json();

    const {
      transportAfterEvent,
      needCollegeTransport,
      transportArea,
      transportDistance,
      stallInterest,
      creativeSuggestions,
    } = body;

    // Validate required fields
    if (!transportAfterEvent || !needCollegeTransport) {
      return NextResponse.json(
        { error: "Please answer all required questions" },
        { status: 400 },
      );
    }

    const surveyData = {
      transport_after_event: transportAfterEvent,
      need_college_transport: needCollegeTransport,
      transport_area:
        needCollegeTransport === "yes" ? transportArea?.trim() || null : null,
      transport_distance:
        needCollegeTransport === "yes"
          ? transportDistance?.trim() || null
          : null,
      stall_interest:
        Array.isArray(stallInterest) && stallInterest.length > 0
          ? stallInterest
          : null,
      creative_suggestions: creativeSuggestions?.trim() || null,
    };

    // Upsert: replace existing feedback
    const { data: existing } = await supabaseAdmin
      .from("survey_feedback")
      .select("id")
      .eq("user_id", session.userId)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("survey_feedback")
        .update(surveyData)
        .eq("user_id", session.userId);

      if (error) {
        console.error("Survey update error:", error);
        return NextResponse.json(
          { error: "Failed to update survey" },
          { status: 500 },
        );
      }
    } else {
      const { error } = await supabaseAdmin.from("survey_feedback").insert({
        user_id: session.userId,
        ...surveyData,
      });

      if (error) {
        console.error("Survey insert error:", error);
        return NextResponse.json(
          { error: "Failed to submit survey" },
          { status: 500 },
        );
      }
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

export async function GET() {
  try {
    const session = await requireAuth();

    if (session.role === "student") {
      const { data } = await supabaseAdmin
        .from("survey_feedback")
        .select("*")
        .eq("user_id", session.userId)
        .single();

      return NextResponse.json({ feedback: data || null });
    }

    // Admin: get all with user info via two-step fetch
    const { data: feedbackRows } = await supabaseAdmin
      .from("survey_feedback")
      .select("*");

    const items = feedbackRows || [];
    if (items.length === 0) {
      return NextResponse.json({ feedback: [] });
    }

    const userIds = items.map((f) => f.user_id);
    const { data: users } = await supabaseAdmin
      .from("users")
      .select("id, name, register_number, department, year, class_section")
      .in("id", userIds);

    const userMap = new Map((users || []).map((u) => [u.id, u]));

    const feedbackWithUsers = items.map((f) => ({
      ...f,
      users: userMap.get(f.user_id) || null,
    }));

    return NextResponse.json({ feedback: feedbackWithUsers });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
