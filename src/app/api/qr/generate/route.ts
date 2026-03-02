import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

async function fetchWithLogs(userId: string) {
  const { data: qr } = await supabaseAdmin
    .from("entry_qr")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!qr) return null;

  const { data: logs } = await supabaseAdmin
    .from("entry_scan_logs")
    .select("action, entry_number, scanned_at")
    .eq("qr_id", qr.id)
    .order("scanned_at", { ascending: true });

  return { ...qr, scan_logs: logs ?? [] };
}

export async function POST() {
  try {
    const session = await requireAuth(["student"]);

    // Check payment is approved
    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("payment_status")
      .eq("user_id", session.userId)
      .single();

    if (!payment || payment.payment_status !== "approved") {
      return NextResponse.json(
        { error: "Payment must be approved before generating QR" },
        { status: 403 },
      );
    }

    // Get or create QR
    const existing = await fetchWithLogs(session.userId);
    if (existing) return NextResponse.json({ qr: existing });

    const { data: createdQr, error: createError } = await supabaseAdmin
      .from("entry_qr")
      .insert({
        user_id: session.userId,
        qr_token: uuidv4(),
        is_active: true,
        total_entries: 0,
      })
      .select("*")
      .single();

    if (createError) {
      return NextResponse.json(
        { error: "Failed to generate QR ticket" },
        { status: 500 },
      );
    }

    return NextResponse.json({ qr: { ...createdQr, scan_logs: [] } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const session = await requireAuth(["student"]);
    const qr = await fetchWithLogs(session.userId);
    return NextResponse.json({ qr });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
