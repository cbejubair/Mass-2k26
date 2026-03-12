import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import { scannerCoordinatorRoles } from "@/lib/coordinator-access";

/** Ordinal label: 1 → "1st", 2 → "2nd", etc. */
function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["admin", ...scannerCoordinatorRoles]);
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "QR token is required" },
        { status: 400 },
      );
    }

    // Check event date - QR should expire after event
    const eventDate = process.env.EVENT_DATE;
    if (eventDate) {
      const eventEnd = new Date(eventDate);
      eventEnd.setDate(eventEnd.getDate() + 1);
      if (new Date() > eventEnd) {
        return NextResponse.json({
          valid: false,
          action: "invalid",
          message: "Event has ended. QR codes are no longer valid.",
        });
      }
    }

    // Lookup QR entry + student info
    const { data: qrEntry, error } = await supabaseAdmin
      .from("entry_qr")
      .select(
        "*, users!entry_qr_user_id_fkey(name, register_number, department, year, class_section, photo_url)",
      )
      .eq("qr_token", token)
      .single();

    if (error || !qrEntry) {
      return NextResponse.json({
        valid: false,
        action: "invalid",
        message: "Invalid QR code. Token not found.",
      });
    }

    if (!qrEntry.is_active) {
      return NextResponse.json({
        valid: false,
        action: "invalid",
        message: "QR code is not active.",
      });
    }

    const now = new Date().toISOString();

    // Count completed exits to determine current entry number
    const { count: completedExits } = await supabaseAdmin
      .from("entry_scan_logs")
      .select("*", { count: "exact", head: true })
      .eq("qr_id", qrEntry.id)
      .eq("action", "check_out");

    const completedCycles = completedExits ?? 0;

    // ── Currently inside (checked_in, not yet out) → CHECK OUT ──────────────
    if (qrEntry.checked_in_at && !qrEntry.checked_out_at) {
      const entryNumber = completedCycles + 1;

      await Promise.all([
        supabaseAdmin
          .from("entry_qr")
          .update({ checked_out_at: now, checked_out_by: session.userId })
          .eq("id", qrEntry.id),
        supabaseAdmin.from("entry_scan_logs").insert({
          qr_id: qrEntry.id,
          user_id: qrEntry.user_id,
          action: "check_out",
          entry_number: entryNumber,
          scanned_by: session.userId,
          scanned_at: now,
        }),
      ]);

      return NextResponse.json({
        valid: true,
        action: "checked_out",
        entryNumber,
        message: `Exit recorded — ${ordinal(entryNumber)} entry. Was inside since ${new Date(qrEntry.checked_in_at).toLocaleTimeString()}`,
        student: qrEntry.users,
      });
    }

    // ── New entry (fresh start OR returning after previous exit) → CHECK IN ─
    const entryNumber = completedCycles + 1;

    await Promise.all([
      supabaseAdmin
        .from("entry_qr")
        .update({
          checked_in_at: now,
          checked_in_by: session.userId,
          checked_out_at: null,
          checked_out_by: null,
          total_entries: entryNumber,
        })
        .eq("id", qrEntry.id),
      supabaseAdmin.from("entry_scan_logs").insert({
        qr_id: qrEntry.id,
        user_id: qrEntry.user_id,
        action: "check_in",
        entry_number: entryNumber,
        scanned_by: session.userId,
        scanned_at: now,
      }),
    ]);

    const isReEntry = entryNumber > 1;
    return NextResponse.json({
      valid: true,
      action: "checked_in",
      entryNumber,
      message: isReEntry
        ? `Welcome back! This is your ${ordinal(entryNumber)} entry.`
        : "Check-in successful! Welcome to MASS 2K26.",
      student: qrEntry.users,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
