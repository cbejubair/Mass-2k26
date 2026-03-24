import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const isMissingColumnError = (message?: string) =>
      Boolean(
        message &&
        /column/i.test(message) &&
        /(does not exist|not found)/i.test(message),
      );

    const primaryColumns =
      "id, user_id, amount, screenshot_url, payment_status, payment_mode, transaction_ref, verified_by, verified_at, created_at, users:users!payments_user_id_fkey(name, register_number, department, year, class_section), verifier:users!payments_verified_by_fkey(name)";
    const legacyColumnsWithCreatedAt =
      "id, user_id, amount, screenshot_url, payment_status, verified_by, verified_at, created_at, users:users!payments_user_id_fkey(name, register_number, department, year, class_section), verifier:users!payments_verified_by_fkey(name)";
    const legacyColumns =
      "id, user_id, amount, screenshot_url, payment_status, verified_by, verified_at, users:users!payments_user_id_fkey(name, register_number, department, year, class_section), verifier:users!payments_verified_by_fkey(name)";

    let payments: any[] | null = null;
    let paymentsError: { message?: string } | null = null;

    const primaryResult = await supabaseAdmin
      .from("payments")
      .select(primaryColumns)
      .order("created_at", { ascending: false, nullsFirst: false });

    payments = primaryResult.data;
    paymentsError = primaryResult.error;

    if (paymentsError && isMissingColumnError(paymentsError.message)) {
      const fallbackWithCreatedAt = await supabaseAdmin
        .from("payments")
        .select(legacyColumnsWithCreatedAt)
        .order("created_at", { ascending: false, nullsFirst: false });

      payments = fallbackWithCreatedAt.data;
      paymentsError = fallbackWithCreatedAt.error;

      if (paymentsError && isMissingColumnError(paymentsError.message)) {
        const fallback = await supabaseAdmin
          .from("payments")
          .select(legacyColumns)
          .order("verified_at", { ascending: false });

        payments = fallback.data;
        paymentsError = fallback.error;
      }
    }

    if (paymentsError) {
      console.error("Admin payments query error:", paymentsError);
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 500 },
      );
    }

    const items = payments || [];
    if (items.length === 0) {
      return NextResponse.json({ payments: [] });
    }

    const mapped = items.map((p) => ({
      ...p,
      payment_mode: p.payment_mode ?? null,
      transaction_ref: p.transaction_ref ?? null,
      users: p.users
        ? {
            name: p.users.name || "-",
            register_number: p.users.register_number || "-",
            department: p.users.department || "-",
            year: p.users.year || "-",
            class_section: p.users.class_section || "-",
          }
        : {
            name: "-",
            register_number: "-",
            department: "-",
            year: "-",
            class_section: "-",
          },
      verifier: p.verifier?.name ? { name: p.verifier.name } : null,
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
