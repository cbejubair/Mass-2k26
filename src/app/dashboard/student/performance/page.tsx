"use client";

import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle2,
  Music,
  Plus,
  X,
  UserPlus,
  ExternalLink,
  Pencil,
  Users,
  Trophy,
  Mic2,
  AlertCircle,
  Crown,
  Lock,
  Play,
  Pause,
  SkipBack,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMemberResolved {
  register_number: string;
  name: string;
  department: string;
  year: string;
  class_section: string;
}

interface StudentPerformance {
  id: string;
  performance_type: string;
  participants_count: number;
  leader_name: string;
  is_team: boolean;
  team_members: TeamMemberResolved[];
  special_requirements: string | null;
  music_file_url: string | null;
  approval_status: string;
}

interface TeamPerformance {
  performance_type: string;
  leader_name: string;
  approval_status: string;
}

interface PaymentEligibility {
  eligible: boolean;
  status:
    | "eligible_approved"
    | "eligible_pending"
    | "ineligible_unpaid"
    | "ineligible_rejected"
    | "ineligible_insufficient";
  requiredAmount: number;
  paidAmount: number;
  paymentStatus: "approved" | "pending" | "rejected" | null;
  message: string;
}

interface LookupPreviewFound {
  found: true;
  user: TeamMemberResolved;
  paymentEligibility: PaymentEligibility;
}

interface LookupPreviewMissing {
  found: false;
  regNo: string;
}

type LookupPreview = LookupPreviewFound | LookupPreviewMissing;

const MAX_EVENTS = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusBadgeClass: Record<string, string> = {
  approved:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/15",
  rejected: "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/15",
  pending:
    "border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/15",
};

const statusDot: Record<string, string> = {
  approved: "bg-emerald-400",
  rejected: "bg-red-400",
  pending: "bg-amber-400",
};

function StatusBadge({ status }: { status: string }) {
  const cls = statusBadgeClass[status] ?? statusBadgeClass.pending;
  const dot = statusDot[status] ?? statusDot.pending;
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <Badge variant="outline" className={`gap-1.5 font-semibold ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      {label}
    </Badge>
  );
}

function EventSlotBar({ used, max }: { used: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        Events ({used}/{max})
      </span>
      <div className="flex gap-1.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-8 rounded-full transition-all duration-500 ${
              i < used
                ? used >= max
                  ? "bg-red-500"
                  : "bg-emerald-500"
                : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Inline Music Player ──────────────────────────────────────────────────────

function MusicPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.addEventListener("loadstart", () => setLoading(true));
    audio.addEventListener("canplay", () => setLoading(false));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress(
        audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      );
    });
    audio.addEventListener("ended", () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      audio.currentTime = 0;
    });
    return () => {
      audio.pause();
      audio.src = "";
    };
  }, [url]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  };

  const reset = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(
      0,
      Math.min(1, (e.clientX - rect.left) / rect.width),
    );
    audio.currentTime = ratio * duration;
  };

  const fmt = (t: number) =>
    Number.isFinite(t)
      ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`
      : "--:--";

  return (
    <div className="rounded-xl border border-purple-500/25 bg-gradient-to-r from-purple-500/[0.07] to-purple-500/[0.03] p-3 space-y-2.5">
      {/* Controls row */}
      <div className="flex items-center gap-2.5">
        {/* Reset */}
        <button
          type="button"
          onClick={reset}
          className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
          title="Restart"
        >
          <SkipBack className="h-3 w-3 text-muted-foreground" />
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 border border-purple-500/40 flex items-center justify-center transition-all shadow-lg shadow-purple-500/20 shrink-0"
          title={playing ? "Pause" : "Play"}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
          ) : playing ? (
            <Pause className="h-3.5 w-3.5 text-white" />
          ) : (
            <Play className="h-3.5 w-3.5 text-white ml-0.5" />
          )}
        </button>

        {/* Waveform / progress */}
        <div className="flex-1 min-w-0 space-y-1">
          <div
            ref={progressRef}
            className="h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden group relative"
            onClick={handleSeek}
            title="Seek"
          >
            <div
              className="h-full rounded-full bg-purple-500 transition-all duration-100 relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{fmt(currentTime)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>

      {/* Status label */}
      <p className="text-[10px] text-purple-400/70 flex items-center gap-1.5">
        <Music className="h-2.5 w-2.5" />
        {playing ? "Now playing…" : "Music track attached"}
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PerformancePage() {
  const whatsappGroupLink =
    process.env.NEXT_PUBLIC_PERFORMANCE_WHATSAPP_GROUP_LINK?.trim() ||
    "https://chat.whatsapp.com/KB6NSCbpiLk2rGwNe2TtO6?mode=gi_t";

  // data
  const [performances, setPerformances] = useState<StudentPerformance[]>([]);
  const [teamPerformances, setTeamPerformances] = useState<TeamPerformance[]>(
    [],
  );
  const [pageLoading, setPageLoading] = useState(true);

  // form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [performanceType, setPerformanceType] = useState("");
  const [participantsCount, setParticipantsCount] = useState("1");
  const [leaderName, setLeaderName] = useState("");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [isTeam, setIsTeam] = useState(false);
  const [memberRegNo, setMemberRegNo] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);
  const [resolvedMembers, setResolvedMembers] = useState<TeamMemberResolved[]>(
    [],
  );
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupPreview, setLookupPreview] = useState<LookupPreview | null>(
    null,
  );
  const [paymentEligibility, setPaymentEligibility] =
    useState<PaymentEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const performanceTypes = [
    "Solo Singing",
    "Group Singing",
    "Solo Dance",
    "Group Dance",
    "Stand-up Comedy",
    "Skit/Drama",
    "Instrumental",
    "Beat Boxing",
    "Rap/Poetry",
    "Other",
  ];

  const totalEvents = performances.length + teamPerformances.length;
  const canSubmitPerformance = paymentEligibility?.eligible ?? false;
  const canAddMore =
    totalEvents < MAX_EVENTS && !editingId && canSubmitPerformance;
  const canShowWhatsappLink = totalEvents > 0;

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchAll = async () => {
    setPageLoading(true);
    setEligibilityLoading(true);
    try {
      const [ownRes, teamRes, eligibilityRes] = await Promise.all([
        fetch("/api/performances/submit"),
        fetch("/api/performances/team"),
        fetch("/api/performances/eligibility"),
      ]);
      const [ownData, teamData, eligibilityData] = await Promise.all([
        ownRes.json(),
        teamRes.json(),
        eligibilityRes.json(),
      ]);
      setPerformances(ownData.performances || []);
      setTeamPerformances(teamData.teamPerformances || []);
      setPaymentEligibility(eligibilityData.eligibility || null);
    } catch {
      setPerformances([]);
      setTeamPerformances([]);
      setPaymentEligibility(null);
    } finally {
      setPageLoading(false);
      setEligibilityLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ─── Form helpers ────────────────────────────────────────────────────────────

  const resetForm = () => {
    setPerformanceType("");
    setParticipantsCount("1");
    setLeaderName("");
    setSpecialRequirements("");
    setMusicFile(null);
    setIsTeam(false);
    setMemberRegNo("");
    setTeamMembers([]);
    setResolvedMembers([]);
    setLookupPreview(null);
    setError("");
  };

  const handleNewPerformance = () => {
    setEditingId(null);
    setSuccess(false);
    setSuccessMessage("");
    resetForm();
    setShowForm(true);
  };

  const handleEditPerformance = (p: StudentPerformance) => {
    setEditingId(p.id);
    setPerformanceType(p.performance_type || "");
    setParticipantsCount(String(p.participants_count || 1));
    setLeaderName(p.leader_name || "");
    setSpecialRequirements(p.special_requirements || "");
    setIsTeam(!!p.is_team);
    const members = p.team_members || [];
    setResolvedMembers(members);
    setTeamMembers(members.map((m) => m.register_number));
    setMemberRegNo("");
    setMusicFile(null);
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addTeamMember = async () => {
    const regNo = memberRegNo.trim().toUpperCase();
    if (!regNo) return;
    if (teamMembers.includes(regNo)) {
      setError("This student is already added to the team.");
      return;
    }
    setLookupLoading(true);
    setLookupPreview(null);
    setError("");
    try {
      const res = await fetch(
        `/api/register/lookup?regNo=${encodeURIComponent(regNo)}`,
      );
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setLookupPreview({
            found: true,
            user: data.user,
            paymentEligibility: data.paymentEligibility,
          });
          return;
        }
      }
      // User not found — show error preview, do NOT add
      setLookupPreview({ found: false, regNo });
    } catch {
      setError("Failed to lookup student. Please try again.");
    } finally {
      setLookupLoading(false);
    }
  };

  const confirmAddMember = () => {
    if (
      !lookupPreview ||
      !lookupPreview.found ||
      !lookupPreview.paymentEligibility?.eligible
    ) {
      return;
    }
    const { user } = lookupPreview;
    setTeamMembers((prev) => {
      const updated = [...prev, user.register_number];
      setParticipantsCount(String(updated.length + 1));
      return updated;
    });
    setResolvedMembers((prev) => [...prev, user]);
    setMemberRegNo("");
    setLookupPreview(null);
  };

  const dismissPreview = () => {
    setLookupPreview(null);
  };

  const removeMember = (index: number) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== index));
    setResolvedMembers((prev) => prev.filter((_, i) => i !== index));
    setParticipantsCount(String(Math.max(1, teamMembers.length)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && totalEvents >= MAX_EVENTS) {
      setError(`You have reached the maximum of ${MAX_EVENTS} events.`);
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    setSuccessMessage("");
    try {
      const fd = new FormData();
      if (editingId) fd.append("performanceId", editingId);
      fd.append("performanceType", performanceType);
      fd.append("participantsCount", participantsCount);
      fd.append("leaderName", leaderName);
      fd.append("specialRequirements", specialRequirements);
      fd.append("isTeam", String(isTeam));
      if (isTeam && teamMembers.length > 0)
        fd.append("teamMembers", JSON.stringify(teamMembers));
      if (musicFile) fd.append("musicFile", musicFile);

      const res = await fetch("/api/performances/submit", {
        method: editingId ? "PUT" : "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }
      setSuccess(true);
      setSuccessMessage(
        editingId
          ? "Performance updated — moved back to pending review."
          : "Performance registered successfully!",
      );
      resetForm();
      setEditingId(null);
      await fetchAll();
      setShowForm(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-sm text-muted-foreground">Loading performances…</p>
      </div>
    );
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Mic2 className="h-5 w-5 text-purple-500" />
            Performance Registration
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Register &amp; manage your performances for MASS 2K26
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          {/* <EventSlotBar used={totalEvents} max={MAX_EVENTS} /> */}
          <Button
            type="button"
            onClick={handleNewPerformance}
            disabled={eligibilityLoading || !canAddMore || showForm}
            className="w-full sm:w-auto gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40"
          >
            {!canSubmitPerformance ? (
              <>
                <Lock className="h-4 w-4" /> Payment Required
              </>
            ) : totalEvents >= MAX_EVENTS && !editingId ? (
              <>
                <Lock className="h-4 w-4" /> Limit Reached
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> New Performance
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Limit banner ── */}
      {totalEvents >= MAX_EVENTS && (
        <div className="relative overflow-hidden flex items-start gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3.5 text-sm text-red-300">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-xl" />
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
          <div>
            <p className="font-semibold text-red-300 mb-0.5">
              {MAX_EVENTS}-event limit reached
            </p>
            <p className="text-xs text-red-400/80">
              You cannot add new performances. Use the{" "}
              <span className="font-semibold text-red-300">Update</span> button
              to modify existing ones.
            </p>
          </div>
        </div>
      )}

      {/* ── Payment eligibility banner ── */}
      {!eligibilityLoading &&
        paymentEligibility &&
        !paymentEligibility.eligible && (
          <div className="relative overflow-hidden flex items-start gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3.5 text-sm text-red-300">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-xl" />
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <div>
              <p className="font-semibold text-red-300 mb-0.5">
                Payment required to register performances
              </p>
              <p className="text-xs text-red-400/80">
                You need at least Rs.{paymentEligibility.requiredAmount} with
                status pending or approved. Current status:{" "}
                {paymentEligibility.paymentStatus || "not submitted"}.
              </p>
              <a
                href="/dashboard/student/payment"
                className="inline-flex mt-2 text-xs font-medium text-red-300 underline underline-offset-2"
              >
                Go to Payment Page
              </a>
            </div>
          </div>
        )}

      {!eligibilityLoading &&
        paymentEligibility &&
        paymentEligibility.status === "eligible_pending" && (
          <div className="relative overflow-hidden flex items-start gap-3 rounded-xl border border-amber-500/25 bg-gradient-to-r from-amber-500/10 to-amber-500/5 px-4 py-3.5 text-sm text-amber-300">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 rounded-l-xl" />
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <p className="font-semibold text-amber-300 mb-0.5">
                Payment verification pending
              </p>
              <p className="text-xs text-amber-400/80">
                You can still register performances while your Rs.
                {paymentEligibility.paidAmount} payment is under review.
              </p>
            </div>
          </div>
        )}

      {/* ── Success banner ── */}
      {success && !showForm && (
        <div className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-4 py-3.5 text-sm text-emerald-300">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-xl" />
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* ── WhatsApp group join card ── */}
      {canShowWhatsappLink && (
        <Card className="border-green-500/20 bg-green-500/[0.04]">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-green-300">
                Performance WhatsApp Group
              </p>
              <p className="text-xs text-green-400/80">
                You are a leader/team member. Join the group for updates.
              </p>
            </div>
            {whatsappGroupLink ? (
              <Button
                asChild
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-500 text-white"
              >
                <a href={whatsappGroupLink} target="_blank" rel="noreferrer">
                  Join Group <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs border-green-500/30">
                Link will be shared soon
              </Badge>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Registration Form ── */}
      {showForm && (
        <Card className="border-white/10 bg-card/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${editingId ? "bg-amber-500/15 border border-amber-500/25" : "bg-purple-500/15 border border-purple-500/25"}`}
              >
                {editingId ? (
                  <Pencil className="h-4 w-4 text-amber-400" />
                ) : (
                  <Plus className="h-4 w-4 text-purple-400" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">
                  {editingId
                    ? "Update Performance"
                    : "Register New Performance"}
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  {editingId
                    ? "Changes will reset approval status to pending."
                    : `Slot ${performances.length + 1} of ${MAX_EVENTS} available.`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {!canSubmitPerformance && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Performance registration is disabled until you pay at least
                  Rs.
                  {paymentEligibility?.requiredAmount || 500}.
                </div>
              )}

              {/* Performance type */}
              <div className="space-y-2">
                <Label>Performance Type</Label>
                <Select
                  value={performanceType}
                  onValueChange={setPerformanceType}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {performanceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Leader name */}
              <div className="space-y-2">
                <Label>Leader / Performer Name</Label>
                <Input
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Primary performer name"
                  required
                />
              </div>

              {/* Team toggle */}
              <div className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/[0.02] px-4 py-3">
                <Checkbox
                  id="isTeam"
                  checked={isTeam}
                  onCheckedChange={(v) => {
                    setIsTeam(!!v);
                    if (!v) {
                      setTeamMembers([]);
                      setResolvedMembers([]);
                      setParticipantsCount("1");
                    }
                  }}
                />
                <div>
                  <Label htmlFor="isTeam" className="cursor-pointer">
                    This is a team performance
                  </Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Add team-mates — they&apos;ll see this on their dashboard
                    too
                  </p>
                </div>
              </div>

              {/* Team members panel */}
              {isTeam && (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-300">
                      Team Members
                    </span>
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      {resolvedMembers.length} added
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground -mt-2">
                    Enter register number → hit Enter or click Add. Details are
                    auto-filled.
                  </p>

                  <div className="flex gap-2">
                    <Input
                      value={memberRegNo}
                      onChange={(e) => {
                        setMemberRegNo(e.target.value);
                        setLookupPreview(null);
                        setError("");
                      }}
                      placeholder="Register number…"
                      className="bg-background/60"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTeamMember();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={addTeamMember}
                      disabled={lookupLoading || !memberRegNo.trim()}
                      className="shrink-0 px-4"
                    >
                      {lookupLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </Button>
                  </div>

                  {/* Lookup preview */}
                  {lookupPreview && (
                    <div
                      className={`rounded-lg border p-3 ${
                        lookupPreview.found
                          ? lookupPreview.paymentEligibility?.eligible
                            ? lookupPreview.paymentEligibility.status ===
                              "eligible_pending"
                              ? "border-amber-500/30 bg-amber-500/10"
                              : "border-emerald-500/30 bg-emerald-500/10"
                            : "border-red-500/30 bg-red-500/10"
                          : "border-red-500/30 bg-red-500/10"
                      }`}
                    >
                      {lookupPreview.found ? (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-sm font-bold text-emerald-300 shrink-0">
                            {lookupPreview.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-sm font-semibold ${
                                lookupPreview.paymentEligibility?.eligible
                                  ? lookupPreview.paymentEligibility.status ===
                                    "eligible_pending"
                                    ? "text-amber-300"
                                    : "text-emerald-300"
                                  : "text-red-300"
                              }`}
                            >
                              {lookupPreview.user.name}
                            </p>
                            <p
                              className={`text-[11px] ${
                                lookupPreview.paymentEligibility?.eligible
                                  ? lookupPreview.paymentEligibility.status ===
                                    "eligible_pending"
                                    ? "text-amber-400/70"
                                    : "text-emerald-400/70"
                                  : "text-red-400/70"
                              }`}
                            >
                              {lookupPreview.user.register_number}
                              {lookupPreview.user.department &&
                                ` · ${lookupPreview.user.department} ${lookupPreview.user.year}`}
                            </p>
                            <p
                              className={`text-[11px] mt-0.5 ${
                                lookupPreview.paymentEligibility?.eligible
                                  ? lookupPreview.paymentEligibility.status ===
                                    "eligible_pending"
                                    ? "text-amber-300/80"
                                    : "text-emerald-300/80"
                                  : "text-red-300/80"
                              }`}
                            >
                              {lookupPreview.paymentEligibility?.message ||
                                "Payment status unavailable."}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                              type="button"
                              size="sm"
                              onClick={confirmAddMember}
                              disabled={
                                !lookupPreview.paymentEligibility?.eligible
                              }
                              className="h-7 px-3 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {lookupPreview.paymentEligibility?.eligible
                                ? "Add"
                                : "Blocked"}
                            </Button>
                            <button
                              type="button"
                              onClick={dismissPreview}
                              className="p-1 rounded text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                            <X className="h-4 w-4 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-red-300">
                              Student not found
                            </p>
                            <p className="text-[11px] text-red-400/70">
                              {lookupPreview.regNo} is not a registered student.
                              Only registered students can be added.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={dismissPreview}
                            className="p-1 rounded text-muted-foreground hover:text-foreground shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {resolvedMembers.length > 0 && (
                    <div className="space-y-2">
                      {resolvedMembers.map((member, idx) => (
                        <div
                          key={`${member.register_number}-${idx}`}
                          className="flex items-center gap-3 rounded-lg border border-white/8 bg-background/60 px-3 py-2.5"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                            {member.name !== "Not found"
                              ? member.name.charAt(0).toUpperCase()
                              : "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {member.register_number}
                              {member.department &&
                                ` · ${member.department} ${member.year}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMember(idx)}
                            className="text-muted-foreground hover:text-red-400 transition-colors p-1 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Participants count */}
              <div className="space-y-2">
                <Label>Total Participants</Label>
                <Input
                  type="number"
                  value={participantsCount}
                  onChange={(e) => setParticipantsCount(e.target.value)}
                  min="1"
                  max="50"
                  required
                />
              </div>

              {/* Special requirements */}
              <div className="space-y-2">
                <Label>Special Requirements</Label>
                <Textarea
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Equipment, stage setup, props…"
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Music upload */}
              <div className="space-y-2">
                <Label>Music Track (optional)</Label>
                <label
                  htmlFor="musicFile"
                  className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-6 cursor-pointer hover:border-purple-500/40 hover:bg-purple-500/5 transition-all duration-200"
                >
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="musicFile"
                  />
                  {musicFile ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Music className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-purple-300">
                          {musicFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {(musicFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Click to change
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                        <Music className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Click to upload music track
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          MP3 / WAV · Max 20 MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
                {editingId && (
                  <p className="text-xs text-muted-foreground">
                    Leave empty to keep the existing track.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <Button
                  type="submit"
                  disabled={loading || !canSubmitPerformance}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting…
                    </>
                  ) : editingId ? (
                    "Update Performance"
                  ) : (
                    "Register Performance"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="shrink-0"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Performances sections in Tabs ── */}
      {(performances.length > 0 || teamPerformances.length > 0) && (
        <>
          {showForm && <Separator className="opacity-20" />}
          <Tabs defaultValue="mine" className="space-y-4">
            <TabsList className="w-full grid grid-cols-2 h-10 bg-white/5 border border-white/10">
              <TabsTrigger
                value="mine"
                className="text-xs gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Crown className="h-3.5 w-3.5" />
                My Performances
                {performances.length > 0 && (
                  <Badge className="ml-1 h-4 min-w-4 px-1 text-[9px] bg-white/20 text-current hover:bg-white/25 border-0">
                    {performances.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="text-xs gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                <Users className="h-3.5 w-3.5" />
                As Team Member
                {teamPerformances.length > 0 && (
                  <Badge className="ml-1 h-4 min-w-4 px-1 text-[9px] bg-white/20 text-current hover:bg-white/25 border-0">
                    {teamPerformances.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* My Performances tab */}
            <TabsContent value="mine" className="space-y-3 mt-0">
              {performances.length === 0 ? (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-8 text-center">
                  <Mic2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No performances registered yet.
                  </p>
                </div>
              ) : (
                performances.map((p) => (
                  <Card
                    key={p.id}
                    className="border-white/8 bg-card/50 backdrop-blur-sm overflow-hidden"
                  >
                    {/* top accent bar by status */}
                    <div
                      className={`h-0.5 w-full ${
                        p.approval_status === "approved"
                          ? "bg-emerald-500"
                          : p.approval_status === "rejected"
                            ? "bg-red-500"
                            : "bg-amber-500"
                      }`}
                    />
                    <CardContent className="p-5 space-y-4">
                      {/* Row 1: type + status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-purple-500/15 border border-purple-500/25 flex items-center justify-center shrink-0">
                            <Mic2 className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {p.performance_type}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Leader: {p.leader_name}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={p.approval_status} />
                      </div>

                      {/* Row 2: meta chips */}
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className="gap-1 text-[11px] border-white/15 bg-white/5 text-muted-foreground hover:bg-white/10"
                        >
                          <Users className="h-3 w-3" />
                          {p.participants_count} participant
                          {p.participants_count !== 1 ? "s" : ""}
                        </Badge>
                        {p.is_team && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[11px] border-blue-500/25 bg-blue-500/10 text-blue-400 hover:bg-blue-500/15"
                          >
                            <Users className="h-3 w-3" />
                            Team
                          </Badge>
                        )}
                        {!p.music_file_url && (
                          <Badge
                            variant="outline"
                            className="gap-1 text-[11px] border-white/8 bg-white/[0.02] text-muted-foreground/50"
                          >
                            <Music className="h-3 w-3" />
                            No track
                          </Badge>
                        )}
                      </div>

                      {/* Inline music player */}
                      {p.music_file_url && (
                        <MusicPlayer url={p.music_file_url} />
                      )}

                      {/* Team members */}
                      {p.is_team && p.team_members?.length > 0 && (
                        <div className="rounded-lg border border-white/8 bg-white/[0.02] p-3 space-y-2.5">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            <Users className="h-3 w-3" /> Team Members
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {p.team_members.map((m, i) => (
                              <Badge
                                key={i}
                                variant="outline"
                                className="gap-1.5 text-[11px] border-purple-500/20 bg-purple-500/8 text-foreground/80 py-1 px-2 hover:bg-purple-500/15"
                              >
                                <span className="w-4 h-4 rounded-full bg-purple-500/30 border border-purple-500/40 flex items-center justify-center text-[9px] font-bold text-purple-300 shrink-0">
                                  {m.name.charAt(0)}
                                </span>
                                <span className="font-medium">{m.name}</span>
                                <span className="text-muted-foreground text-[10px]">
                                  · {m.register_number}
                                </span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Special requirements */}
                      {p.special_requirements && (
                        <div className="rounded-lg border border-white/6 bg-white/[0.015] px-3 py-2.5 text-xs text-muted-foreground">
                          <p className="font-semibold text-foreground/50 uppercase text-[10px] tracking-widest mb-1">
                            Requirements
                          </p>
                          <p>{p.special_requirements}</p>
                        </div>
                      )}

                      {/* Update button */}
                      <div className="pt-1 flex items-center justify-between">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPerformance(p)}
                          className="gap-1.5 h-8 text-xs hover:border-amber-500/40 hover:text-amber-400"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Update
                        </Button>
                        <p className="text-[10px] text-muted-foreground/50">
                          Editing resets to pending review
                        </p>
                      </div>

                      {whatsappGroupLink && (
                        <div className="pt-1">
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-xs border-green-500/30 text-green-300 hover:bg-green-500/10"
                          >
                            <a
                              href={whatsappGroupLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Join WhatsApp Group
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* Team Performances tab */}
            <TabsContent value="team" className="space-y-3 mt-0">
              {teamPerformances.length === 0 ? (
                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-8 text-center">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    You haven&apos;t been added to any team yet.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="h-3 w-3" />
                    These count toward your {MAX_EVENTS}-event limit.
                  </p>
                  {teamPerformances.map((p, i) => (
                    <Card
                      key={i}
                      className="border-blue-500/15 bg-blue-500/[0.04] backdrop-blur-sm overflow-hidden"
                    >
                      <div className="h-0.5 w-full bg-blue-500/50" />
                      <CardContent className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                            <Trophy className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {p.performance_type}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Led by{" "}
                              <span className="font-medium text-foreground/70">
                                {p.leader_name}
                              </span>
                            </p>
                          </div>
                          <StatusBadge status={p.approval_status} />
                        </div>
                        <div className="mt-3">
                          <Badge
                            variant="outline"
                            className="gap-1.5 border-blue-500/25 bg-blue-500/10 text-blue-300 hover:bg-blue-500/15"
                          >
                            <Users className="h-3 w-3" />
                            You are a team member
                          </Badge>
                        </div>

                        {whatsappGroupLink && (
                          <div className="mt-3">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="gap-1.5 text-xs border-green-500/30 text-green-300 hover:bg-green-500/10"
                            >
                              <a
                                href={whatsappGroupLink}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Join WhatsApp Group
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* ── Empty state ── */}
      {performances.length === 0 &&
        teamPerformances.length === 0 &&
        !showForm && (
          <Card className="border-white/8 bg-card/30">
            <CardContent className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Mic2 className="h-8 w-8 text-purple-400/60" />
              </div>
              <div>
                <p className="font-semibold text-base">No performances yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Register your first performance — you can add up to{" "}
                  {MAX_EVENTS} events.
                </p>
              </div>
              <Button
                onClick={handleNewPerformance}
                className="mt-2 bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Plus className="h-4 w-4" />
                Register Performance
              </Button>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
