import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import {
  coordinatorDashboardRoles,
  rolePermissions,
  type CoordinatorDashboardRole,
  type CoordinatorRole,
} from "@/lib/coordinators";
import {
  getCoordinatorScope,
  isCoordinatorDashboardRole,
} from "@/lib/coordinator-access";

const roleMap: Record<CoordinatorDashboardRole, CoordinatorRole> = {
  staff_coordinator: "staff_coordinator",
  overall_student_coordinator: "overall_student_coordinator",
  class_coordinator: "class_coordinator",
  faculty_coordinator: "faculty_coordinator",
  event_head: "event_head",
  technical_coordinator: "technical_coordinator",
  discipline_coordinator: "discipline_coordinator",
};

function matchesScope(
  user: {
    department?: string | null;
    year?: string | null;
    class_section?: string | null;
  },
  scope: {
    accessLevel: "full" | "department" | "class" | "event";
    department: string | null;
    year: string | null;
    classSection: string | null;
  },
) {
  if (scope.accessLevel === "full" || scope.accessLevel === "event") {
    return true;
  }

  if (scope.accessLevel === "department") {
    return user.department === scope.department;
  }

  return (
    user.department === scope.department &&
    user.year === scope.year &&
    user.class_section === scope.classSection
  );
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["admin", ...coordinatorDashboardRoles]);
    const { performanceId, status } = await req.json();

    if (!performanceId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid performance ID or status" },
        { status: 400 },
      );
    }

    if (session.role !== "admin") {
      if (!isCoordinatorDashboardRole(session.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const permissions = rolePermissions[roleMap[session.role]];
      if (!permissions.canApprovePerformances) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const scope = await getCoordinatorScope(session);

      const { data: performance } = await supabaseAdmin
        .from("performance_registrations")
        .select("id, user_id, is_team, team_members")
        .eq("id", performanceId)
        .single();

      if (!performance) {
        return NextResponse.json(
          { error: "Performance not found" },
          { status: 404 },
        );
      }

      const { data: leader } = await supabaseAdmin
        .from("users")
        .select("department, year, class_section")
        .eq("id", performance.user_id)
        .single();

      const leaderInScope = leader ? matchesScope(leader, scope) : false;

      let teamMemberInScope = false;
      if (performance.is_team && Array.isArray(performance.team_members)) {
        const members = performance.team_members as {
          department?: string | null;
          year?: string | null;
          class_section?: string | null;
        }[];
        teamMemberInScope = members.some((member) =>
          matchesScope(member, scope),
        );
      }

      if (!leaderInScope && !teamMemberInScope) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const { error } = await supabaseAdmin
      .from("performance_registrations")
      .update({ approval_status: status })
      .eq("id", performanceId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update performance status" },
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
