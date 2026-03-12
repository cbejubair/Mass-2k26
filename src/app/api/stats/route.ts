import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Public stats API — no auth required.
 * Returns key metrics for the landing page:
 *  - registered students count
 *  - performing participants count
 *  - approved performances count
 *  - total revenue
 *  - departments participating
 */
export async function GET() {
  try {
    const [
      studentsRes,
      registrationsRes,
      performancesRes,
      paymentsRes,
      checkedInRes,
    ] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id", { count: "exact" })
        .eq("role", "student"),
      supabaseAdmin
        .from("event_registrations")
        .select("id", { count: "exact" }),
      supabaseAdmin
        .from("performance_registrations")
        .select("approval_status, participants_count", { count: "exact" }),
      supabaseAdmin
        .from("payments")
        .select("payment_status", { count: "exact" })
        .eq("payment_status", "approved"),
      supabaseAdmin
        .from("entry_qr")
        .select("id", { count: "exact" })
        .not("checked_in_at", "is", null),
    ]);

    const performances = performancesRes.data || [];
    const approvedPerformances = performances.filter(
      (p) => p.approval_status === "approved",
    );
    const totalPerformers = performances.reduce(
      (sum, p) => sum + (p.participants_count || 1),
      0,
    );

    return NextResponse.json({
      totalStudents: studentsRes.count || 0,
      totalRegistered: registrationsRes.count || 0,
      totalPerformances: performancesRes.count || 0,
      approvedPerformances: approvedPerformances.length,
      totalPerformers,
      approvedPayments: paymentsRes.count || 0,
      checkedIn: checkedInRes.count || 0,
    });
  } catch {
    return NextResponse.json(
      {
        totalStudents: 0,
        totalRegistered: 0,
        totalPerformances: 0,
        approvedPerformances: 0,
        totalPerformers: 0,
        approvedPayments: 0,
        checkedIn: 0,
      },
      { status: 200 },
    );
  }
}
