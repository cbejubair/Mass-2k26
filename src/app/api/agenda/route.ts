import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth(["admin"]);
    const body = await req.json();
    const {
      title,
      startTime,
      endTime,
      description,
      assignedPerformanceId,
      stageRequirements,
    } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Title, start time, and end time are required" },
        { status: 400 },
      );
    }

    // Check for time conflicts
    const { data: conflicts } = await supabaseAdmin
      .from("agenda")
      .select("id, title")
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Time conflict detected",
          conflicts: conflicts.map((c) => c.title),
        },
        { status: 409 },
      );
    }

    const { error } = await supabaseAdmin.from("agenda").insert({
      title,
      start_time: startTime,
      end_time: endTime,
      description: description || null,
      assigned_performance_id: assignedPerformanceId || null,
      stage_requirements: stageRequirements || null,
    });

    if (error) {
      console.error("Agenda insert error:", error);
      return NextResponse.json(
        { error: "Failed to create agenda item" },
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
    await requireAuth();

    const { data } = await supabaseAdmin
      .from("agenda")
      .select(
        "*, performance_registrations(performance_type, leader_name, users(name))",
      )
      .order("start_time", { ascending: true });

    return NextResponse.json({ agenda: data || [] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(["admin"]);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("agenda").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
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

export async function PUT(req: NextRequest) {
  try {
    await requireAuth(["admin"]);
    const body = await req.json();
    const {
      id,
      title,
      startTime,
      endTime,
      description,
      assignedPerformanceId,
      stageRequirements,
    } = body;

    if (!id || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: "ID, Title, start time, and end time are required" },
        { status: 400 },
      );
    }

    // Check for time conflicts excluding the current item
    const { data: conflicts } = await supabaseAdmin
      .from("agenda")
      .select("id, title")
      .neq("id", id)
      .or(`and(start_time.lt.${endTime},end_time.gt.${startTime})`);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: "Time conflict detected",
          conflicts: conflicts.map((c) => c.title),
        },
        { status: 409 },
      );
    }

    const { error } = await supabaseAdmin
      .from("agenda")
      .update({
        title,
        start_time: startTime,
        end_time: endTime,
        description: description || null,
        assigned_performance_id: assignedPerformanceId || null,
        stage_requirements: stageRequirements || null,
      })
      .eq("id", id);

    if (error) {
      console.error("Agenda update error:", error);
      return NextResponse.json(
        { error: "Failed to update agenda item" },
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
