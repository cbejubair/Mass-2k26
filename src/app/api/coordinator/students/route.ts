import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import {
  applyStudentScope,
  getCoordinatorScope,
} from "@/lib/coordinator-access";
import { coordinatorDashboardRoles } from "@/lib/coordinators";

export async function GET() {
  try {
    const session = await requireAuth([...coordinatorDashboardRoles]);
    const classScope = await getCoordinatorScope(session);

    if (!classScope.canViewStats) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let studentsQuery = supabaseAdmin
      .from("users")
      .select("id, register_number, name, department, year, class_section")
      .eq("role", "student")
      .order("register_number");

    studentsQuery = applyStudentScope(studentsQuery, classScope);

    const { data: baseStudents, error: studentsError } = await studentsQuery;

    if (studentsError) {
      console.error("Coordinator students query error:", studentsError);
    }

    const students = baseStudents || [];
    if (students.length === 0) {
      return NextResponse.json({ classScope, students: [] });
    }

    const userIds = students.map((s) => s.id);
    const scopedRegisterNumbers = new Set(
      students
        .map((s) => s.register_number?.trim().toUpperCase())
        .filter(Boolean),
    );

    const [
      eventRegsRes,
      paymentsRes,
      ownedPerformancesRes,
      teamPerformancesRes,
      qrRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("event_registrations")
        .select(
          "user_id, support_status, willing_to_coordinate, interested_roles, remarks",
        )
        .in("user_id", userIds),
      supabaseAdmin
        .from("payments")
        .select(
          "id, user_id, amount, payment_status, payment_mode, transaction_ref, screenshot_url",
        )
        .in("user_id", userIds),
      supabaseAdmin
        .from("performance_registrations")
        .select(
          "id, user_id, performance_type, is_team, team_members, approval_status",
        )
        .in("user_id", userIds),
      supabaseAdmin
        .from("performance_registrations")
        .select(
          "id, user_id, performance_type, is_team, team_members, approval_status",
        )
        .eq("is_team", true),
      supabaseAdmin
        .from("entry_qr")
        .select("user_id, is_active, checked_in_at, checked_out_at")
        .in("user_id", userIds),
    ]);

    const byUser = <T extends { user_id: string }>(
      rows: T[] | null | undefined,
    ) =>
      (rows || []).reduce<Record<string, T[]>>((acc, row) => {
        if (!acc[row.user_id]) acc[row.user_id] = [];
        acc[row.user_id].push(row);
        return acc;
      }, {});

    const eventRegsByUser = byUser(eventRegsRes.data);
    const paymentsByUser = byUser(paymentsRes.data);
    const performancesByUser = byUser(ownedPerformancesRes.data);
    const qrByUser = byUser(qrRes.data);

    const performancesByRegisterNumber = (
      teamPerformancesRes.data || []
    ).reduce<Record<string, any[]>>((acc, perf) => {
      const members = Array.isArray(perf.team_members)
        ? (perf.team_members as {
            register_number?: string;
            performance_type?: string;
            approval_status?: string;
          }[])
        : [];

      for (const member of members) {
        const regNo = member.register_number?.trim().toUpperCase();
        if (!regNo || !scopedRegisterNumbers.has(regNo)) continue;
        if (!acc[regNo]) acc[regNo] = [];
        acc[regNo].push(perf);
      }

      return acc;
    }, {});

    const studentsWithRelations = students.map((student) => ({
      ...student,
      event_registrations: (eventRegsByUser[student.id] || []).map((r) => ({
        support_status: r.support_status,
        willing_to_coordinate: r.willing_to_coordinate,
        interested_roles: r.interested_roles,
        remarks: r.remarks,
      })),
      payments: (paymentsByUser[student.id] || []).map((p) => ({
        id: p.id,
        amount: p.amount,
        payment_status: p.payment_status,
        payment_mode: p.payment_mode,
        transaction_ref: p.transaction_ref,
        screenshot_url: p.screenshot_url,
      })),
      performance_registrations: (() => {
        const own = performancesByUser[student.id] || [];
        const asTeamMember =
          performancesByRegisterNumber[
            student.register_number?.trim().toUpperCase() || ""
          ] || [];

        const merged = [...own, ...asTeamMember];
        const dedupedById = merged.filter(
          (perf, idx, arr) => arr.findIndex((x) => x.id === perf.id) === idx,
        );

        return dedupedById.map((perf) => ({
          performance_type: perf.performance_type,
          is_team: perf.is_team,
          team_members: perf.team_members,
          approval_status: perf.approval_status,
        }));
      })(),
      entry_qr: (qrByUser[student.id] || []).map((qr) => ({
        is_active: qr.is_active,
        checked_in_at: qr.checked_in_at,
        checked_out_at: qr.checked_out_at,
      })),
    }));

    return NextResponse.json({ classScope, students: studentsWithRelations });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
