import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

/**
 * GET /api/performances/team
 * Returns performance registrations where the current student
 * is listed as a team member (not the leader).
 */
export async function GET() {
  try {
    const session = await requireAuth(["student"]);

    // Fetch all team performances
    const { data: allTeamPerfs } = await supabaseAdmin
      .from("performance_registrations")
      .select(
        "id, performance_type, leader_name, approval_status, team_members, user_id",
      )
      .eq("is_team", true);

    if (!allTeamPerfs || allTeamPerfs.length === 0) {
      return NextResponse.json({ teamPerformances: [] });
    }

    // Filter performances where this student appears in team_members
    const regNo = session.registerNumber;
    const teamPerformances = allTeamPerfs
      .filter((perf) => {
        // Don't include performances the student owns
        if (perf.user_id === session.userId) return false;

        const members = perf.team_members as {
          register_number: string;
        }[];
        return (
          Array.isArray(members) &&
          members.some(
            (m) => m.register_number?.toUpperCase() === regNo?.toUpperCase(),
          )
        );
      })
      .map((perf) => ({
        performance_type: perf.performance_type,
        leader_name: perf.leader_name,
        approval_status: perf.approval_status,
      }));

    return NextResponse.json({ teamPerformances });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
