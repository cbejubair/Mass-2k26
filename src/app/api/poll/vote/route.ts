import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { coordinatorDashboardRoles } from "@/lib/coordinators";
import { supabaseAdmin } from "@/lib/supabase-admin";

const POLL_START_AT = new Date("2026-03-23T10:00:00+05:30");
const POLL_END_AT = new Date("2026-03-23T18:00:00+05:30");

function isPollOpen(now: Date) {
  return now >= POLL_START_AT && now < POLL_END_AT;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth([
      "student",
      ...coordinatorDashboardRoles,
    ]);
    const body = await req.json();
    const optionId = (body?.optionId as string | undefined)?.trim();

    if (!optionId) {
      return NextResponse.json(
        { error: "Option is required" },
        { status: 400 },
      );
    }

    if (!isPollOpen(new Date())) {
      return NextResponse.json(
        {
          error:
            "Poll is closed. Voting is allowed only between 10:00 AM and 6:00 PM.",
        },
        { status: 400 },
      );
    }

    const { data: existingVote } = await supabaseAdmin
      .from("event_poll_votes")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already submitted your vote." },
        { status: 400 },
      );
    }

    const { data: option } = await supabaseAdmin
      .from("event_poll_options")
      .select("id")
      .eq("id", optionId)
      .eq("is_active", true)
      .maybeSingle();

    if (!option) {
      return NextResponse.json({ error: "Invalid option" }, { status: 400 });
    }

    const { error: voteError } = await supabaseAdmin
      .from("event_poll_votes")
      .insert({
        user_id: session.userId,
        option_id: optionId,
      });

    if (voteError) {
      return NextResponse.json(
        { error: "Failed to submit vote" },
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
