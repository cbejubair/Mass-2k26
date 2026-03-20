import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { coordinatorDashboardRoles } from "@/lib/coordinators";
import { supabaseAdmin } from "@/lib/supabase-admin";

const POLL_START_AT = new Date("2026-03-23T10:00:00+05:30");
const POLL_END_AT = new Date("2026-03-23T18:00:00+05:30");

type PollPhase = "before" | "open" | "closed";

function getPollPhase(now: Date): PollPhase {
  if (now < POLL_START_AT) return "before";
  if (now >= POLL_END_AT) return "closed";
  return "open";
}

export async function GET() {
  try {
    const session = await requireAuth([
      "student",
      ...coordinatorDashboardRoles,
    ]);

    const { data: options, error: optionsError } = await supabaseAdmin
      .from("event_poll_options")
      .select("id, label, sort_order, instagram_url")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (optionsError) {
      return NextResponse.json(
        { error: "Failed to load poll options" },
        { status: 500 },
      );
    }

    const { data: userVote } = await supabaseAdmin
      .from("event_poll_votes")
      .select("option_id")
      .eq("user_id", session.userId)
      .maybeSingle();

    const now = new Date();
    const phase = getPollPhase(now);

    const countsByOptionId = new Map<string, number>();
    let totalVotes = 0;

    if (phase === "closed") {
      const { data: votes, error: votesError } = await supabaseAdmin
        .from("event_poll_votes")
        .select("option_id");

      if (votesError) {
        return NextResponse.json(
          { error: "Failed to load poll results" },
          { status: 500 },
        );
      }

      for (const vote of votes || []) {
        const count = countsByOptionId.get(vote.option_id) || 0;
        countsByOptionId.set(vote.option_id, count + 1);
      }

      totalVotes = (votes || []).length;
    }

    const rankedOptions = (options || []).map((option) => {
      const votes = countsByOptionId.get(option.id) || 0;
      const percentage =
        totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      return {
        id: option.id,
        label: option.label,
        instagramUrl: option.instagram_url,
        sortOrder: option.sort_order,
        votes,
        percentage,
      };
    });

    if (phase === "closed") {
      rankedOptions.sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        return a.sortOrder - b.sortOrder;
      });
    }

    return NextResponse.json({
      phase,
      startAt: POLL_START_AT.toISOString(),
      endAt: POLL_END_AT.toISOString(),
      hasVoted: !!userVote,
      selectedOptionId: userVote?.option_id || null,
      totalVotes,
      options: rankedOptions,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
