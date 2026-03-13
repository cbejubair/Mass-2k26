import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

const MAX_FILE_SIZE = Math.floor(1.5 * 1024 * 1024); // 1.5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const PROFILE_BUCKET = "mass";
const PROFILE_FOLDER = "profiles";

function getFileExtension(file: File) {
  const fromName = file.name?.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;

  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return byMime[file.type] || "jpg";
}

function extractStoragePathFromPublicUrl(url: string | null | undefined) {
  if (!url || !url.includes("/storage/v1/object/public/")) return null;

  const marker = `/storage/v1/object/public/${PROFILE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;

  const encodedPath = url.slice(index + marker.length);
  if (!encodedPath) return null;
  return decodeURIComponent(encodedPath);
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth([
      "student",
      "admin",
      "class_coordinator",
    ]);
    const formData = await req.formData();
    const photo = formData.get("photo");

    if (!(photo instanceof File)) {
      return NextResponse.json(
        { error: "Invalid image payload. Please upload a valid file." },
        { status: 400 },
      );
    }

    const file = photo;

    if (file.size <= 0) {
      return NextResponse.json(
        { error: "Empty image file provided" },
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
        { error: "File too large. Maximum size is 1.5MB" },
        { status: 400 },
      );
    }

    const fileExt = getFileExtension(file);
    const filePath = `${PROFILE_FOLDER}/${session.userId}/profile-${Date.now()}.${fileExt}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("photo_url")
      .eq("id", session.userId)
      .single();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(PROFILE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Photo upload storage error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload photo to storage" },
        { status: 500 },
      );
    }

    const { data: urlData } = supabaseAdmin.storage
      .from(PROFILE_BUCKET)
      .getPublicUrl(filePath);

    const photoUrl = urlData.publicUrl;
    if (!photoUrl || photoUrl.length > 2048) {
      await supabaseAdmin.storage.from(PROFILE_BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: "Invalid photo URL generated. Please try again." },
        { status: 500 },
      );
    }

    // Update user photo_url
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ photo_url: photoUrl })
      .eq("id", session.userId);

    if (updateError) {
      console.error("Photo upload DB update error:", updateError);

      await supabaseAdmin.storage.from(PROFILE_BUCKET).remove([filePath]);

      return NextResponse.json(
        { error: "Failed to save photo" },
        { status: 500 },
      );
    }

    const oldPhotoPath = extractStoragePathFromPublicUrl(
      currentUser?.photo_url,
    );
    if (oldPhotoPath && oldPhotoPath !== filePath) {
      await supabaseAdmin.storage.from(PROFILE_BUCKET).remove([oldPhotoPath]);
    }

    return NextResponse.json({ success: true, photoUrl });
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

    const { data: currentUser } = await supabaseAdmin
      .from("users")
      .select("photo_url")
      .eq("id", session.userId)
      .single();

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

    const oldPhotoPath = extractStoragePathFromPublicUrl(
      currentUser?.photo_url,
    );
    if (oldPhotoPath) {
      await supabaseAdmin.storage.from(PROFILE_BUCKET).remove([oldPhotoPath]);
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
