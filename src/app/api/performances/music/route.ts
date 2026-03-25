import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_AUDIO_SIZE_BYTES = 20 * 1024 * 1024;

function getStoragePathFromPublicUrl(url: string | null | undefined) {
  if (!url) return null;
  const marker = "/storage/v1/object/public/mass/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

function assertOwnedMusicPath(filePathRaw: string, registerNumber: string) {
  const filePath = filePathRaw?.trim();
  if (!filePath) {
    throw new Error("File path is required");
  }

  const ownerPrefix = `music/${registerNumber}/`;
  if (!filePath.startsWith(ownerPrefix)) {
    throw new Error("Invalid music file path");
  }

  return filePath;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const registerRef = session.registerNumber || session.userId;
    const formData = await req.formData();
    const musicFile = formData.get("musicFile") as File | null;

    if (!musicFile || musicFile.size <= 0) {
      return NextResponse.json(
        { error: "Music file is required" },
        { status: 400 },
      );
    }

    if (!musicFile.type?.startsWith("audio/")) {
      return NextResponse.json(
        { error: "Only audio files are allowed" },
        { status: 400 },
      );
    }

    if (musicFile.size > MAX_AUDIO_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Music file must be less than 20MB" },
        { status: 400 },
      );
    }

    const ext = musicFile.name.split(".").pop() || "bin";
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const filePath = `music/${registerRef}/temp-${suffix}.${ext}`;

    const { error: uploadErr } = await supabaseAdmin.storage
      .from("mass")
      .upload(filePath, musicFile, {
        contentType: musicFile.type,
        upsert: false,
      });

    if (uploadErr) {
      console.error("Music upload error:", uploadErr);
      return NextResponse.json(
        { error: "Failed to upload music file" },
        { status: 500 },
      );
    }

    const { data } = supabaseAdmin.storage.from("mass").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      filePath,
      publicUrl: data.publicUrl,
    });
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
    const session = await requireAuth(["student"]);
    const registerRef = session.registerNumber || session.userId;
    const body = await req.json().catch(() => ({}));
    const filePathRaw = (body?.filePath as string) || "";
    const performanceId = (body?.performanceId as string) || "";

    if (performanceId) {
      const { data: existing } = await supabaseAdmin
        .from("performance_registrations")
        .select("id, music_file_url")
        .eq("id", performanceId)
        .eq("user_id", session.userId)
        .single();

      if (!existing) {
        return NextResponse.json(
          { error: "Performance not found" },
          { status: 404 },
        );
      }

      const existingPath = getStoragePathFromPublicUrl(existing.music_file_url);
      if (existingPath) {
        const ownedPath = assertOwnedMusicPath(existingPath, registerRef);
        const { error: removeErr } = await supabaseAdmin.storage
          .from("mass")
          .remove([ownedPath]);

        if (removeErr) {
          console.error("Music delete error:", removeErr);
        }
      }

      const { error: updateErr } = await supabaseAdmin
        .from("performance_registrations")
        .update({ music_file_url: null, approval_status: "pending" })
        .eq("id", performanceId)
        .eq("user_id", session.userId);

      if (updateErr) {
        return NextResponse.json(
          { error: "Failed to clear music track" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    }

    if (!filePathRaw) {
      return NextResponse.json(
        { error: "filePath or performanceId is required" },
        { status: 400 },
      );
    }

    const filePath = assertOwnedMusicPath(filePathRaw, registerRef);
    const { error } = await supabaseAdmin.storage
      .from("mass")
      .remove([filePath]);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete uploaded file" },
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
