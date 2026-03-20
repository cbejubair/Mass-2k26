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
    await requireAuth(["admin"]);

    const [optionsRes, votesRes, eligibleUsersRes] = await Promise.all([
      supabaseAdmin
        .from("event_poll_options")
        .select("id, label, sort_order, instagram_url")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabaseAdmin
        .from("event_poll_votes")
        .select(
          "id, option_id, created_at, users(name, register_number, department, year, class_section, role)",
        )
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact", head: true })
        .in("role", ["student", ...coordinatorDashboardRoles]),
    ]);

    if (optionsRes.error) {
      return NextResponse.json(
        { error: "Failed to load poll options" },
        { status: 500 },
      );
    }

    if (votesRes.error) {
      return NextResponse.json(
        { error: "Failed to load poll votes" },
        { status: 500 },
      );
    }

    const options = optionsRes.data || [];
    const votes = votesRes.data || [];

    const countsByOption = new Map<string, number>();
    for (const vote of votes) {
      countsByOption.set(
        vote.option_id,
        (countsByOption.get(vote.option_id) || 0) + 1,
      );
    }

    const totalVotes = votes.length;
    const rankedOptions = options
      .map((option) => {
        const votesCount = countsByOption.get(option.id) || 0;
        const percentage =
          totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
        return {
          id: option.id,
          label: option.label,
          instagramUrl: option.instagram_url,
          sortOrder: option.sort_order,
          votes: votesCount,
          percentage,
        };
      })
      .sort((a, b) => {
        if (b.votes !== a.votes) return b.votes - a.votes;
        return a.sortOrder - b.sortOrder;
      });

    const eligibleVoters = eligibleUsersRes.count || 0;
    const submissionRate =
      eligibleVoters > 0 ? Math.round((totalVotes / eligibleVoters) * 100) : 0;

    return NextResponse.json({
      phase: getPollPhase(new Date()),
      startAt: POLL_START_AT.toISOString(),
      endAt: POLL_END_AT.toISOString(),
      summary: {
        totalVotes,
        eligibleVoters,
        submissionRate,
      },
      options: rankedOptions,
      submissions: votes.map((vote) => ({
        id: vote.id,
        createdAt: vote.created_at,
        optionId: vote.option_id,
        user: Array.isArray(vote.users) ? vote.users[0] : vote.users,
      })),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
