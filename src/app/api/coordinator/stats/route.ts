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
    const scope = await getCoordinatorScope(session);

    if (!scope.canViewStats) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let studentQuery = supabaseAdmin
      .from("users")
      .select("id, register_number")
      .eq("role", "student");

    studentQuery = applyStudentScope(studentQuery, scope);

    const { data: students } = await studentQuery;

    const studentRows = students || [];
    const studentIds = studentRows.map((s) => s.id);
    const scopedRegisterNumbers = new Set(
      studentRows
        .map((s) => s.register_number?.trim().toUpperCase())
        .filter(Boolean),
    );

    if (studentIds.length === 0) {
      return NextResponse.json({
        classScope: scope,
        paymentSummary: {
          totalPayments: 0,
          totalAmount: 0,
          pendingAmount: 0,
        },
        stats: {
          totalStudents: 0,
          totalRegistered: 0,
          willingCount: 0,
          totalPaid: 0,
          pendingPayments: 0,
          totalPerformances: 0,
        },
      });
    }

    const [payResult, ownedPerfResult, teamPerfResult, regResult] =
      await Promise.all([
        supabaseAdmin
          .from("payments")
          .select("payment_status, amount")
          .in("user_id", studentIds),
        supabaseAdmin
          .from("performance_registrations")
          .select("id")
          .in("user_id", studentIds),
        supabaseAdmin
          .from("performance_registrations")
          .select("id, team_members")
          .eq("is_team", true),
        supabaseAdmin
          .from("event_registrations")
          .select("support_status, willing_to_coordinate")
          .in("user_id", studentIds),
      ]);

    const payments = payResult.data || [];
    const registrations = regResult.data || [];
    const totalPaid = payments.filter(
      (p) => p.payment_status === "approved",
    ).length;
    const pendingPayments = payments.filter(
      (p) => p.payment_status === "pending",
    ).length;
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.payment_status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const ownedPerformanceIds = new Set(
      (ownedPerfResult.data || []).map((p) => p.id),
    );
    const teamPerformanceIds = new Set(
      (teamPerfResult.data || [])
        .filter((perf) => {
          const members = Array.isArray(perf.team_members)
            ? (perf.team_members as { register_number?: string }[])
            : [];

          return members.some((member) => {
            const regNo = member.register_number?.trim().toUpperCase();
            return !!regNo && scopedRegisterNumbers.has(regNo);
          });
        })
        .map((perf) => perf.id),
    );
    const totalPerformances = new Set([
      ...ownedPerformanceIds,
      ...teamPerformanceIds,
    ]).size;

    return NextResponse.json({
      classScope: scope,
      paymentSummary: {
        totalPayments: payments.length,
        totalAmount,
        pendingAmount,
      },
      stats: {
        totalStudents: studentIds.length,
        totalRegistered: registrations.length,
        willingCount: registrations.filter((r) => r.willing_to_coordinate)
          .length,
        totalPaid,
        pendingPayments,
        totalPerformances,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
