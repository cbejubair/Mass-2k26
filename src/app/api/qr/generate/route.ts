import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

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
    const { data: existingQr } = await supabaseAdmin
      .from("entry_qr")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    if (existingQr) {
      return NextResponse.json({ qr: existingQr });
    }

    const { data: createdQr, error: createError } = await supabaseAdmin
      .from("entry_qr")
      .insert({
        user_id: session.userId,
        qr_token: uuidv4(),
        is_active: true,
      })
      .select("*")
      .single();

    if (createError) {
      return NextResponse.json(
        { error: "Failed to generate QR ticket" },
        { status: 500 },
      );
    }

    return NextResponse.json({ qr: createdQr });
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

    const { data } = await supabaseAdmin
      .from("entry_qr")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    return NextResponse.json({ qr: data || null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
