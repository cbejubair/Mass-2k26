import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select(
        "id, user_id, amount, screenshot_url, payment_status, payment_mode, transaction_ref, verified_by, verified_at",
      )
      .order("verified_at", { ascending: false });

    if (paymentsError) {
      console.error("Admin payments query error:", paymentsError);
      return NextResponse.json({ payments: [] });
    }

    const items = payments || [];
    if (items.length === 0) {
      return NextResponse.json({ payments: [] });
    }

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

    return NextResponse.json({ payments: mapped });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
