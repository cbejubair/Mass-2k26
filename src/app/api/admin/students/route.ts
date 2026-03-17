import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const { data: baseStudents, error: studentsError } = await supabaseAdmin
      .from("users")
      .select(
        "id, register_number, name, department, year, class_section, mobile_number",
      )
      .eq("role", "student")
      .limit(5000)
      .order("register_number");

    if (studentsError) {
      console.error("Admin students query error:", studentsError);
    }

    const students = baseStudents || [];
    if (students.length === 0) {
      return NextResponse.json({ students: [] });
    }

    const userIds = students.map((s) => s.id);

    const [eventRegsRes, paymentsRes, performancesRes, qrRes] =
      await Promise.all([
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
            "user_id, performance_type, is_team, team_members, approval_status",
          )
          .in("user_id", userIds),
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
    const performancesByUser = byUser(performancesRes.data);
    const qrByUser = byUser(qrRes.data);

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
      performance_registrations: (performancesByUser[student.id] || []).map(
        (perf) => ({
          performance_type: perf.performance_type,
          is_team: perf.is_team,
          team_members: perf.team_members,
          approval_status: perf.approval_status,
        }),
      ),
      entry_qr: (qrByUser[student.id] || []).map((qr) => ({
        is_active: qr.is_active,
        checked_in_at: qr.checked_in_at,
        checked_out_at: qr.checked_out_at,
      })),
    }));

    return NextResponse.json({ students: studentsWithRelations });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
