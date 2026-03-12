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
      .select("id")
      .eq("role", "student");

    studentQuery = applyStudentScope(studentQuery, scope);

    const { data: students } = await studentQuery;

    const studentIds = (students || []).map((s) => s.id);

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

    const [payResult, perfResult, regResult] = await Promise.all([
      supabaseAdmin
        .from("payments")
        .select("payment_status, amount")
        .in("user_id", studentIds),
      supabaseAdmin
        .from("performance_registrations")
        .select("id")
        .in("user_id", studentIds),
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
        totalPerformances: (perfResult.data || []).length,
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
