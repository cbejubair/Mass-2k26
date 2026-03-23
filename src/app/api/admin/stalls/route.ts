import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    const { data, error } = await supabaseAdmin
      .from("stall_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      throw error;
    }

    return NextResponse.json({ applications: data || [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
