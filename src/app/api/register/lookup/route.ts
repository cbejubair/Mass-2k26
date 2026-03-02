import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth(["student"]);
    const regNo = req.nextUrl.searchParams.get("regNo");

    if (!regNo) {
      return NextResponse.json(
        { error: "Register number required" },
        { status: 400 },
      );
    }

    const { data } = await supabaseAdmin
      .from("users")
      .select("register_number, name, department, year, class_section")
      .eq("register_number", regNo.trim().toUpperCase())
      .eq("role", "student")
      .single();

    if (!data) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: data });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
