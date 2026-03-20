import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth";
import {
  evaluatePerformancePaymentEligibility,
  getPerformancePaymentEligibilityByUserId,
} from "@/lib/performance-payment-rule";
import {
  applyStudentScope,
  getCoordinatorScope,
  isCoordinatorDashboardRole,
} from "@/lib/coordinator-access";

export const runtime = "nodejs";
export const maxDuration = 120;

type ResolvedMember = {
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
};

function normalizePerformanceType(
  performanceType: string,
  otherPerformanceName: string,
) {
  const type = performanceType?.trim();
  const otherName = otherPerformanceName?.trim();

  if (!type) {
    return { error: "Performance type is required" } as const;
  }

  if (type !== "Other") {
    return { value: type } as const;
  }

  if (!otherName) {
    return {
      error: "Please enter the performance name for Other category.",
    } as const;
  }

  return { value: `Other - ${otherName}` } as const;
}

async function resolveTeamMembers(teamMembersRaw: string, isTeam: boolean) {
  let resolvedTeamMembers: ResolvedMember[] = [];

  if (!isTeam || !teamMembersRaw) return resolvedTeamMembers;

  try {
    const memberRegNos: string[] = JSON.parse(teamMembersRaw);
    if (memberRegNos.length === 0) return resolvedTeamMembers;

    const { data: foundUsers } = await supabaseAdmin
      .from("users")
      .select("register_number, name, department, year, class_section")
      .in("register_number", memberRegNos);

    const foundMap = new Map(
      (foundUsers || []).map((u) => [u.register_number, u]),
    );

    resolvedTeamMembers = memberRegNos.map((regNo) => {
      const user = foundMap.get(regNo);
      return user
        ? {
            register_number: user.register_number,
            name: user.name,
            department: user.department,
            year: user.year,
            class_section: user.class_section,
          }
        : {
            register_number: regNo,
            name: "Unknown",
            department: "",
            year: "",
            class_section: "",
          };
    });
  } catch {
    return [];
  }

  return resolvedTeamMembers;
}

async function uploadMusicIfProvided(
  musicFile: File | null,
  registerNumber: string,
  filePrefix: string,
) {
  if (!musicFile || musicFile.size <= 0) return null;

  if (!musicFile.type?.startsWith("audio/")) {
    throw new Error("Only audio files are allowed");
  }

  if (musicFile.size > 20 * 1024 * 1024) {
    throw new Error("Music file must be less than 20MB");
  }

  const fileExt = musicFile.name.split(".").pop() || "bin";
  const filePath = `music/${registerNumber}/${filePrefix}.${fileExt}`;

  const { error: uploadErr } = await supabaseAdmin.storage
    .from("mass")
    .upload(filePath, musicFile, {
      contentType: musicFile.type,
      upsert: true,
    });

  if (uploadErr) {
    console.error("Music upload error:", uploadErr);
    throw new Error("Failed to upload music file");
  }

  const { data: urlData } = supabaseAdmin.storage
    .from("mass")
    .getPublicUrl(filePath);

  return urlData.publicUrl;
}

async function findIneligibleTeamMembers(memberRegNos: string[]) {
  if (memberRegNos.length === 0) return [] as string[];

  const uniqueRegNos = Array.from(
    new Set(memberRegNos.map((m) => m.trim().toUpperCase()).filter(Boolean)),
  );

  if (uniqueRegNos.length === 0) return [] as string[];

  const { data: users } = await supabaseAdmin
    .from("users")
    .select("id, register_number")
    .in("register_number", uniqueRegNos);

  const userMap = new Map((users || []).map((u) => [u.register_number, u.id]));
  const userIds = Array.from(userMap.values());

  const { data: payments } = userIds.length
    ? await supabaseAdmin
        .from("payments")
        .select("user_id, amount, payment_status")
        .in("user_id", userIds)
    : {
        data: [] as {
          user_id: string;
          amount: number;
          payment_status: "approved" | "pending" | "rejected";
        }[],
      };

  const paymentByUserId = new Map((payments || []).map((p) => [p.user_id, p]));

  const ineligible = uniqueRegNos.filter((regNo) => {
    const userId = userMap.get(regNo);
    if (!userId) return true;
    const payment = paymentByUserId.get(userId) || null;
    return !evaluatePerformancePaymentEligibility(payment).eligible;
  });

  return ineligible;
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const registerRef = session.registerNumber || session.userId;
    const formData = await req.formData();
    const performanceType = formData.get("performanceType") as string;
    const otherPerformanceName =
      (formData.get("otherPerformanceName") as string) || "";
    const participantsCount = formData.get("participantsCount") as string;
    const leaderName = formData.get("leaderName") as string;
    const specialRequirements = formData.get("specialRequirements") as string;
    const musicFile = formData.get("musicFile") as File | null;
    const isTeam = formData.get("isTeam") === "true";
    const teamMembersRaw = formData.get("teamMembers") as string;

    if (!performanceType || !participantsCount || !leaderName) {
      return NextResponse.json(
        {
          error:
            "Performance type, participants count, and leader name are required",
        },
        { status: 400 },
      );
    }

    const normalizedType = normalizePerformanceType(
      performanceType,
      otherPerformanceName,
    );

    if ("error" in normalizedType) {
      return NextResponse.json(
        { error: normalizedType.error },
        { status: 400 },
      );
    }

    const ownEligibility = await getPerformancePaymentEligibilityByUserId(
      session.userId,
    );
    if (!ownEligibility.eligible) {
      return NextResponse.json(
        { error: ownEligibility.message, eligibility: ownEligibility },
        { status: 400 },
      );
    }

    // Enforce 3-event maximum (owned + as team member)
    const MAX_EVENTS = 3;
    const { count: ownedCount } = await supabaseAdmin
      .from("performance_registrations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.userId);

    const regNo = session.registerNumber;
    const { data: allTeamPerfs } = await supabaseAdmin
      .from("performance_registrations")
      .select("id, team_members, user_id")
      .eq("is_team", true)
      .neq("user_id", session.userId);

    const teamCount = (allTeamPerfs || []).filter((p) => {
      const members = p.team_members as { register_number: string }[];
      return (
        Array.isArray(members) &&
        members.some(
          (m) => m.register_number?.toUpperCase() === regNo?.toUpperCase(),
        )
      );
    }).length;

    if ((ownedCount ?? 0) + teamCount >= MAX_EVENTS) {
      return NextResponse.json(
        { error: `You have reached the maximum of ${MAX_EVENTS} events.` },
        { status: 400 },
      );
    }

    const resolvedTeamMembers = await resolveTeamMembers(
      teamMembersRaw,
      isTeam,
    );

    if (isTeam && teamMembersRaw) {
      let parsedMembers: string[] = [];
      try {
        parsedMembers = JSON.parse(teamMembersRaw);
      } catch {
        parsedMembers = [];
      }

      const ineligibleMemberRegNos =
        await findIneligibleTeamMembers(parsedMembers);
      if (ineligibleMemberRegNos.length > 0) {
        return NextResponse.json(
          {
            error:
              "All team members must have at least Rs.500 payment in pending or approved status.",
            ineligibleTeamMembers: ineligibleMemberRegNos,
          },
          { status: 400 },
        );
      }
    }

    let musicFileUrl: string | null = null;
    try {
      musicFileUrl = await uploadMusicIfProvided(
        musicFile,
        registerRef,
        "track",
      );
    } catch (uploadErr) {
      const message =
        uploadErr instanceof Error
          ? uploadErr.message
          : "Failed to upload music file";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("performance_registrations")
      .insert({
        user_id: session.userId,
        performance_type: normalizedType.value,
        participants_count: parseInt(participantsCount),
        leader_name: leaderName,
        is_team: isTeam,
        team_members: resolvedTeamMembers,
        special_requirements: specialRequirements || null,
        music_file_url: musicFileUrl,
        approval_status: "pending",
      });

    if (error) {
      console.error("Performance registration error:", error);
      return NextResponse.json(
        { error: "Failed to register performance" },
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

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(["student"]);
    const registerRef = session.registerNumber || session.userId;
    const formData = await req.formData();
    const performanceId = formData.get("performanceId") as string;
    const performanceType = formData.get("performanceType") as string;
    const otherPerformanceName =
      (formData.get("otherPerformanceName") as string) || "";
    const participantsCount = formData.get("participantsCount") as string;
    const leaderName = formData.get("leaderName") as string;
    const specialRequirements = formData.get("specialRequirements") as string;
    const musicFile = formData.get("musicFile") as File | null;
    const isTeam = formData.get("isTeam") === "true";
    const teamMembersRaw = formData.get("teamMembers") as string;

    if (!performanceId) {
      return NextResponse.json(
        { error: "Performance ID is required" },
        { status: 400 },
      );
    }

    if (!performanceType || !participantsCount || !leaderName) {
      return NextResponse.json(
        {
          error:
            "Performance type, participants count, and leader name are required",
        },
        { status: 400 },
      );
    }

    const normalizedType = normalizePerformanceType(
      performanceType,
      otherPerformanceName,
    );

    if ("error" in normalizedType) {
      return NextResponse.json(
        { error: normalizedType.error },
        { status: 400 },
      );
    }

    const ownEligibility = await getPerformancePaymentEligibilityByUserId(
      session.userId,
    );
    if (!ownEligibility.eligible) {
      return NextResponse.json(
        { error: ownEligibility.message, eligibility: ownEligibility },
        { status: 400 },
      );
    }

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

    const resolvedTeamMembers = await resolveTeamMembers(
      teamMembersRaw,
      isTeam,
    );

    if (isTeam && teamMembersRaw) {
      let parsedMembers: string[] = [];
      try {
        parsedMembers = JSON.parse(teamMembersRaw);
      } catch {
        parsedMembers = [];
      }

      const ineligibleMemberRegNos =
        await findIneligibleTeamMembers(parsedMembers);
      if (ineligibleMemberRegNos.length > 0) {
        return NextResponse.json(
          {
            error:
              "All team members must have at least Rs.500 payment in pending or approved status.",
            ineligibleTeamMembers: ineligibleMemberRegNos,
          },
          { status: 400 },
        );
      }
    }

    let musicFileUrl: string | null = existing.music_file_url;
    try {
      const uploadedMusicUrl = await uploadMusicIfProvided(
        musicFile,
        registerRef,
        `track-${performanceId}`,
      );
      if (uploadedMusicUrl) musicFileUrl = uploadedMusicUrl;
    } catch (uploadErr) {
      const message =
        uploadErr instanceof Error
          ? uploadErr.message
          : "Failed to upload music file";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("performance_registrations")
      .update({
        performance_type: normalizedType.value,
        participants_count: parseInt(participantsCount),
        leader_name: leaderName,
        is_team: isTeam,
        team_members: isTeam ? resolvedTeamMembers : [],
        special_requirements: specialRequirements || null,
        music_file_url: musicFileUrl,
        approval_status: "pending",
      })
      .eq("id", performanceId)
      .eq("user_id", session.userId);

    if (error) {
      console.error("Performance update error:", error);
      return NextResponse.json(
        { error: "Failed to update performance" },
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
    const session = await requireAuth();

    if (session.role === "student") {
      const { data } = await supabaseAdmin
        .from("performance_registrations")
        .select("*")
        .eq("user_id", session.userId);

      return NextResponse.json({ performances: data || [] });
    }

    if (session.role === "admin") {
      const { data } = await supabaseAdmin
        .from("performance_registrations")
        .select(
          "*, users(name, register_number, department, year, class_section)",
        );

      return NextResponse.json({ performances: data || [] });
    }

    if (isCoordinatorDashboardRole(session.role)) {
      const scope = await getCoordinatorScope(session);
      if (!scope.canViewStats && !scope.canApprovePerformances) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      let usersQuery = supabaseAdmin
        .from("users")
        .select("id, register_number")
        .eq("role", "student");

      usersQuery = applyStudentScope(usersQuery, scope);
      const { data: scopedStudents } = await usersQuery;

      const scopedUserIds = (scopedStudents || []).map((s) => s.id);
      const scopedRegisterNumbers = new Set(
        (scopedStudents || [])
          .map((s) => s.register_number?.trim().toUpperCase())
          .filter(Boolean),
      );

      if (scopedUserIds.length === 0) {
        return NextResponse.json({ performances: [] });
      }

      const [ownedRes, teamRes] = await Promise.all([
        supabaseAdmin
          .from("performance_registrations")
          .select(
            "*, users(name, register_number, department, year, class_section)",
          )
          .in("user_id", scopedUserIds),
        supabaseAdmin
          .from("performance_registrations")
          .select(
            "*, users(name, register_number, department, year, class_section)",
          )
          .eq("is_team", true),
      ]);

      const teamMemberScoped = (teamRes.data || []).filter((perf) => {
        const members = Array.isArray(perf.team_members)
          ? (perf.team_members as { register_number?: string }[])
          : [];

        return members.some((member) => {
          const regNo = member.register_number?.trim().toUpperCase();
          return !!regNo && scopedRegisterNumbers.has(regNo);
        });
      });

      const combined = [...(ownedRes.data || []), ...teamMemberScoped];
      const performances = combined.filter(
        (perf, idx, arr) => arr.findIndex((x) => x.id === perf.id) === idx,
      );

      return NextResponse.json({ performances });
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    const status =
      message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
