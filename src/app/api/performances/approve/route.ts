import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["admin"]);
    const { performanceId, status } = await req.json();

    if (!performanceId || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid performance ID or status" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("performance_registrations")
      .update({ approval_status: status })
      .eq("id", performanceId);

    if (error) {
      return NextResponse.json(
        { error: "Failed to update performance status" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
