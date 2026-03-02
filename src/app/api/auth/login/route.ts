import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loginType } = body; // "student" or "admin"

    // ============================================================
    // STUDENT LOGIN — register number only, auto-create if new
    // ============================================================
    if (loginType === "student") {
      const {
        registerNumber,
        name,
        department,
        year,
        classSection,
        mobileNumber,
      } = body;

      if (!registerNumber) {
        return NextResponse.json(
          { error: "Register number is required" },
          { status: 400 },
        );
      }

      const regNum = registerNumber.toUpperCase().trim();

      // Check if student exists
      const { data: existing } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("register_number", regNum)
        .eq("role", "student")
        .single();

      if (existing) {
        // Existing student — login directly
        const token = signToken({
          userId: existing.id,
          role: existing.role,
          registerNumber: existing.register_number,
          name: existing.name,
          department: existing.department,
          year: existing.year,
          classSection: existing.class_section,
        });

        const response = NextResponse.json({
          success: true,
          isNew: false,
          user: {
            id: existing.id,
            name: existing.name,
            role: existing.role,
            registerNumber: existing.register_number,
            department: existing.department,
          },
        });

        response.cookies.set("session_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        });

        return response;
      }

      // New student — must provide additional details
      if (!name || !department || !year || !classSection || !mobileNumber) {
        return NextResponse.json(
          {
            error: "New student — please fill all details",
            needsDetails: true,
          },
          { status: 400 },
        );
      }

      // Auto-create student (no password needed)
      const { data: newUser, error: createErr } = await supabaseAdmin
        .from("users")
        .insert({
          register_number: regNum,
          name: name.trim(),
          mobile_number: mobileNumber.trim(),
          role: "student",
          department: department.trim(),
          year: year.trim(),
          class_section: classSection.trim(),
          password_hash: "STUDENT_NO_PASSWORD",
          must_change_password: false,
        })
        .select()
        .single();

      if (createErr) {
        console.error("Create student error:", createErr);
        return NextResponse.json(
          { error: "Failed to create student account" },
          { status: 500 },
        );
      }

      const token = signToken({
        userId: newUser.id,
        role: newUser.role,
        registerNumber: newUser.register_number,
        name: newUser.name,
        department: newUser.department,
        year: newUser.year,
        classSection: newUser.class_section,
      });

      const response = NextResponse.json({
        success: true,
        isNew: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          role: newUser.role,
          registerNumber: newUser.register_number,
          department: newUser.department,
        },
      });

      response.cookies.set("session_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      });

      return response;
    }

    // ============================================================
    // ADMIN / COORDINATOR LOGIN — register number + password
    // ============================================================
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 },
      );
    }

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("register_number", username.toUpperCase().trim())
      .in("role", ["admin", "class_coordinator"])
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      registerNumber: user.register_number,
      name: user.name,
      department: user.department,
      year: user.year,
      classSection: user.class_section,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        registerNumber: user.register_number,
        department: user.department,
      },
    });

    response.cookies.set("session_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
