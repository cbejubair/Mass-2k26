import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    // Parallel fetch all stats
    const [
      studentsRes,
      registrationsRes,
      paymentsRes,
      performancesRes,
      surveysRes,
      qrRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id, department, year", { count: "exact" })
        .eq("role", "student"),
      supabaseAdmin
        .from("event_registrations")
        .select("support_status, willing_to_coordinate", { count: "exact" }),
      supabaseAdmin
        .from("payments")
        .select("payment_status, amount", { count: "exact" }),
      supabaseAdmin
        .from("performance_registrations")
        .select("performance_type, approval_status", { count: "exact" }),
      supabaseAdmin.from("survey_feedback").select("id", { count: "exact" }),
      supabaseAdmin
        .from("entry_qr")
        .select("is_active, checked_in_at", { count: "exact" }),
    ]);

    const students = studentsRes.data || [];
    const registrations = registrationsRes.data || [];
    const payments = paymentsRes.data || [];
    const performances = performancesRes.data || [];

    // Calculate stats
    const approvedPayments = payments.filter(
      (p) => p.payment_status === "approved",
    );
    const totalRevenue = approvedPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0,
    );
    const supportCount = registrations.filter((r) => r.support_status).length;
    const willingCount = registrations.filter(
      (r) => r.willing_to_coordinate,
    ).length;
    const checkedInCount = (qrRes.data || []).filter(
      (q) => q.checked_in_at,
    ).length;

    // Department breakdown
    const deptMap = new Map<string, number>();
    students.forEach((s) => {
      const dept = s.department || "Unknown";
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });

    // Year breakdown
    const yearMap = new Map<string, number>();
    students.forEach((s) => {
      const year = s.year || "Unknown";
      yearMap.set(year, (yearMap.get(year) || 0) + 1);
    });

    // Performance type breakdown
    const perfTypeMap = new Map<string, number>();
    performances.forEach((p) => {
      perfTypeMap.set(
        p.performance_type,
        (perfTypeMap.get(p.performance_type) || 0) + 1,
      );
    });

    // Payment status breakdown
    const payStatusMap = new Map<string, number>();
    payments.forEach((p) => {
      payStatusMap.set(
        p.payment_status,
        (payStatusMap.get(p.payment_status) || 0) + 1,
      );
    });

    return NextResponse.json({
      stats: {
        totalStudents: studentsRes.count || 0,
        totalRegistered: registrationsRes.count || 0,
        totalPaymentsApproved: approvedPayments.length,
        totalRevenue,
        pendingPayments: payments.filter((p) => p.payment_status === "pending")
          .length,
        totalPerformances: performancesRes.count || 0,
        pendingPerformances: performances.filter(
          (p) => p.approval_status === "pending",
        ).length,
        supportPercentage:
          registrations.length > 0
            ? Math.round((supportCount / registrations.length) * 100)
            : 0,
        willingCount,
        totalSurveys: surveysRes.count || 0,
        totalCheckedIn: checkedInCount,
        activeQR: (qrRes.data || []).filter((q) => q.is_active).length,
      },
      charts: {
        departmentBreakdown: Object.fromEntries(deptMap),
        yearBreakdown: Object.fromEntries(yearMap),
        performanceTypes: Object.fromEntries(perfTypeMap),
        paymentStatus: Object.fromEntries(payStatusMap),
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
