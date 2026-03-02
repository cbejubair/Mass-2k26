import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["admin", "class_coordinator"]);
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
        return NextResponse.json(
          {
            valid: false,
            action: "invalid",
            message: "Event has ended. QR codes are no longer valid.",
          },
          { status: 200 },
        );
      }
    }

    // Lookup QR entry
    const { data: qrEntry, error } = await supabaseAdmin
      .from("entry_qr")
      .select(
        "*, users!entry_qr_user_id_fkey(name, register_number, department, year, class_section)",
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

    // Determine action based on current check-in/check-out state
    if (!qrEntry.checked_in_at) {
      // First scan → CHECK IN
      await supabaseAdmin
        .from("entry_qr")
        .update({
          checked_in_at: now,
          checked_in_by: session.userId,
        })
        .eq("id", qrEntry.id);

      return NextResponse.json({
        valid: true,
        action: "checked_in",
        message: "Check-in successful!",
        student: qrEntry.users,
      });
    }

    if (qrEntry.checked_in_at && !qrEntry.checked_out_at) {
      // Already checked in, not yet out → CHECK OUT
      await supabaseAdmin
        .from("entry_qr")
        .update({
          checked_out_at: now,
          checked_out_by: session.userId,
        })
        .eq("id", qrEntry.id);

      return NextResponse.json({
        valid: true,
        action: "checked_out",
        message: `Checked out. Was inside since ${new Date(qrEntry.checked_in_at).toLocaleTimeString()}`,
        student: qrEntry.users,
      });
    }

    // Already checked in AND checked out
    return NextResponse.json({
      valid: false,
      action: "already_done",
      message: `Already checked in at ${new Date(qrEntry.checked_in_at).toLocaleTimeString()} and out at ${new Date(qrEntry.checked_out_at).toLocaleTimeString()}`,
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
