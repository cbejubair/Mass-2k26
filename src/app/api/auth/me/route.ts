import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { coordinatorDashboardRoles } from "@/lib/coordinators";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const session = await requireAuth([
      "student",
      "admin",
      ...coordinatorDashboardRoles,
    ]);

    // Fetch photo_url from database
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("photo_url")
      .eq("id", session.userId)
      .single();

    if (error) {
      console.error("Error fetching user photo:", error);
    }

    return NextResponse.json({
      userId: session.userId,
      name: session.name,
      registerNumber: session.registerNumber,
      role: session.role,
      department: session.department,
      year: session.year,
      classSection: session.classSection,
      photo_url: user?.photo_url || null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
