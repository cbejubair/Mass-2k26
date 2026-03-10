import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth(["class_coordinator"]);

    // JWT may be missing class fields on older tokens — always refresh from DB
    const { data: coordinatorRow } = await supabaseAdmin
      .from("users")
      .select("department, year, class_section")
      .eq("id", session.userId)
      .single();

    const dept = coordinatorRow?.department ?? session.department;
    const yr = coordinatorRow?.year ?? session.year;
    const section = coordinatorRow?.class_section ?? session.classSection;

    if (!dept || !yr || !section) {
      return NextResponse.json(
        { error: "Coordinator has no class assignment. Contact admin." },
        { status: 400 },
      );
    }

    const classScope = {
      department: dept,
      year: yr,
      classSection: section,
      label: `${dept} - ${yr} ${section}`,
    };

    // Get students from coordinator's class (with full details for unpaid list)
    const { data: students, error: studentsError } = await supabaseAdmin
      .from("users")
      .select("id, name, register_number, department, year, class_section")
      .eq("role", "student")
      .eq("department", dept)
      .eq("year", yr)
      .eq("class_section", section)
      .order("name", { ascending: true });

    if (studentsError) {
      console.error(
        "Coordinator payments - students query error:",
        studentsError,
      );
    }

    const allStudents = students || [];
    const studentIds = allStudents.map((s) => s.id);

    if (studentIds.length === 0) {
      return NextResponse.json({
        classScope,
        summary: {
          total: 0,
          approved: 0,
          pending: 0,
          rejected: 0,
          totalAmount: 0,
          pendingAmount: 0,
        },
        payments: [],
        unpaidStudents: [],
      });
    }

    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select(
        "id, user_id, amount, screenshot_url, payment_status, payment_mode, transaction_ref, verified_by, verified_at",
      )
      .in("user_id", studentIds)
      .order("verified_at", { ascending: false });

    if (paymentsError) {
      console.error(
        "Coordinator payments - payments query error:",
        paymentsError,
      );
    }

    const items = payments || [];
    const userIds = Array.from(
      new Set(items.map((p) => p.user_id).filter(Boolean)),
    );
    const verifierIds = Array.from(
      new Set(items.map((p) => p.verified_by).filter(Boolean)),
    ) as string[];

    const [{ data: payers }, { data: verifiers }] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id, name, register_number, department, year, class_section")
        .in("id", userIds),
      verifierIds.length > 0
        ? supabaseAdmin.from("users").select("id, name").in("id", verifierIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    const payerMap = new Map((payers || []).map((u) => [u.id, u]));
    const verifierMap = new Map((verifiers || []).map((u) => [u.id, u]));

    const mapped = items.map((p) => ({
      ...p,
      users: payerMap.get(p.user_id)
        ? {
            name: payerMap.get(p.user_id)!.name,
            register_number: payerMap.get(p.user_id)!.register_number,
            department: payerMap.get(p.user_id)!.department,
            year: payerMap.get(p.user_id)!.year,
            class_section: payerMap.get(p.user_id)!.class_section,
          }
        : {
            name: "-",
            register_number: "-",
            department: "-",
            year: "-",
            class_section: "-",
          },
      verifier: p.verified_by
        ? { name: verifierMap.get(p.verified_by)?.name || "-" }
        : null,
    }));

    const summary = {
      total: mapped.length,
      approved: mapped.filter((p) => p.payment_status === "approved").length,
      pending: mapped.filter((p) => p.payment_status === "pending").length,
      rejected: mapped.filter((p) => p.payment_status === "rejected").length,
      totalAmount: mapped.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingAmount: mapped
        .filter((p) => p.payment_status === "pending")
        .reduce((sum, p) => sum + (p.amount || 0), 0),
    };

    // Compute students who don't have an active (non-rejected) payment
    const paidUserIds = new Set(
      items
        .filter((p) => p.payment_status !== "rejected")
        .map((p) => p.user_id),
    );
    const unpaidStudents = allStudents.filter((s) => !paidUserIds.has(s.id));

    return NextResponse.json({
      classScope,
      summary,
      payments: mapped,
      unpaidStudents,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
