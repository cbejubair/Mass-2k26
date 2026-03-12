import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth([
      "student",
      "admin",
      "class_coordinator",
    ]);
    const formData = await req.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed" },
        { status: 400 },
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 },
      );
    }

    // Convert to base64 data URL (for simplicity - stores in DB)
    // In production, you'd upload to cloud storage (S3, Cloudinary, etc.)
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Update user photo_url
    const { error } = await supabaseAdmin
      .from("users")
      .update({ photo_url: dataUrl })
      .eq("id", session.userId);

    if (error) {
      console.error("Photo upload error:", error);
      return NextResponse.json(
        { error: "Failed to save photo" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, photoUrl: dataUrl });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE() {
  try {
    const session = await requireAuth([
      "student",
      "admin",
      "class_coordinator",
    ]);

    const { error } = await supabaseAdmin
      .from("users")
      .update({ photo_url: null })
      .eq("id", session.userId);

    if (error) {
      console.error("Photo delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete photo" },
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
