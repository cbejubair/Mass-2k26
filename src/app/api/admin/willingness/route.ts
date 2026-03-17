import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    await requireAuth(["admin"]);

    // Attempt to fetch more than 1000 rows if possible
    const { data: registrations, error } = await supabaseAdmin
      .from("event_registrations")
      .select(
        `
        support_status,
        willing_to_coordinate,
        interested_roles,
        remarks,
        user_id,
        users (
          id,
          register_number,
          name,
          department,
          year,
          class_section
        )
      `,
      )
      .limit(5000)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Transform into the format expected by the frontend
    const students = (registrations || []).map((reg) => {
      const u = Array.isArray(reg.users) ? reg.users[0] : reg.users;
      return {
        id: u?.id || reg.user_id,
        register_number: u?.register_number || null,
        name: u?.name || "Unknown",
        department: u?.department || null,
        year: u?.year || null,
        class_section: u?.class_section || null,
        event_registrations: [
          {
            support_status: reg.support_status,
            willing_to_coordinate: reg.willing_to_coordinate,
            interested_roles: reg.interested_roles,
            remarks: reg.remarks,
          },
        ],
      };
    });

    return NextResponse.json({ students });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
