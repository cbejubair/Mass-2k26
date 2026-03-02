import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// GET – list all coordinators
export async function GET() {
  try {
    await requireAuth(["admin"]);

    const { data: coordinators, error } = await supabaseAdmin
      .from("users")
      .select(
        "id, register_number, name, mobile_number, department, year, class_section, created_at",
      )
      .eq("role", "class_coordinator")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ coordinators: coordinators || [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST – create a new coordinator
export async function POST(req: NextRequest) {
  try {
    await requireAuth(["admin"]);

    const {
      registerNumber,
      name,
      mobileNumber,
      password,
      department,
      year,
      classSection,
    } = await req.json();

    if (!registerNumber || !name || !mobileNumber || !password) {
      return NextResponse.json(
        {
          error:
            "Register number, name, mobile number, and password are required",
        },
        { status: 400 },
      );
    }

    // Check if register number already exists
    const { data: existing } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("register_number", registerNumber.toUpperCase().trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "A user with this register number already exists" },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: coordinator, error } = await supabaseAdmin
      .from("users")
      .insert({
        register_number: registerNumber.toUpperCase().trim(),
        name: name.trim(),
        mobile_number: mobileNumber.trim(),
        role: "class_coordinator",
        department: department?.trim() || null,
        year: year?.trim() || null,
        class_section: classSection?.trim() || null,
        password_hash: hashedPassword,
        must_change_password: false,
      })
      .select("id, register_number, name, department, year, class_section")
      .single();

    if (error) {
      console.error("Create coordinator error:", error);
      return NextResponse.json(
        { error: "Failed to create coordinator" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, coordinator });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    console.error("Create coordinator error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE – remove a coordinator
export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(["admin"]);

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Coordinator ID required" },
        { status: 400 },
      );
    }

    const { error } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id)
      .eq("role", "class_coordinator");

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message === "Unauthorized" || message === "Forbidden") {
      return NextResponse.json({ error: message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
