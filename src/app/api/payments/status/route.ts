import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { coordinatorDashboardRoles } from "@/lib/coordinators";

export async function GET() {
  try {
    const session = await requireAuth([
      "student",
      ...coordinatorDashboardRoles,
    ]);

    const { data: payment } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    return NextResponse.json({ payment: payment || null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
