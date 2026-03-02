import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["admin"]);
    const { userId, remarks } = await req.json();

    if (!userId || !remarks) {
      return NextResponse.json(
        { error: "User ID and remarks required" },
        { status: 400 },
      );
    }

    // Check if registration exists
    const { data: existing } = await supabaseAdmin
      .from("event_registrations")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("event_registrations")
        .update({ remarks })
        .eq("user_id", userId);

      if (error) {
        return NextResponse.json(
          { error: "Failed to update remarks" },
          { status: 500 },
        );
      }
    } else {
      // Create registration with remark
      const { error } = await supabaseAdmin.from("event_registrations").insert({
        user_id: userId,
        remarks,
        support_status: false,
        willing_to_coordinate: false,
      });

      if (error) {
        return NextResponse.json(
          { error: "Failed to add remarks" },
          { status: 500 },
        );
      }
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
