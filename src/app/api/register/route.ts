import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const { supportStatus, willingToCoordinate, interestedRoles, remarks } =
      await req.json();

    // Check if already registered
    const { data: existing } = await supabaseAdmin
      .from("event_registrations")
      .select("id")
      .eq("user_id", session.userId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already registered for the event" },
        { status: 409 },
      );
    }

    const { error } = await supabaseAdmin.from("event_registrations").insert({
      user_id: session.userId,
      support_status: supportStatus || false,
      willing_to_coordinate: willingToCoordinate || false,
      interested_roles: interestedRoles || [],
      remarks: remarks || null,
    });

    if (error) {
      console.error("Registration error:", error);
      return NextResponse.json(
        { error: "Failed to register" },
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

export async function GET() {
  try {
    const session = await requireAuth(["student"]);

    const { data, error } = await supabaseAdmin
      .from("event_registrations")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json({ registration: data || null });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
