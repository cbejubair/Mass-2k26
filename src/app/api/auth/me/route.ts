import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireAuth([
      "student",
      "admin",
      "class_coordinator",
    ]);
    return NextResponse.json({
      userId: session.userId,
      name: session.name,
      registerNumber: session.registerNumber,
      role: session.role,
      department: session.department,
      year: session.year,
      classSection: session.classSection,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
