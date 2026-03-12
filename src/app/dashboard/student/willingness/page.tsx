"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  Pencil,
  Heart,
  Users,
  Mic2,
  Camera,
  DollarSign,
  UtensilsCrossed,
  Wrench,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  HandHeart,
  X,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

// ─── Role catalogue ──────────────────────────────────────────────────────────

const ROLE_DETAILS = [
  {
    key: "finance-coordinator",
    title: "Finance Coordinator",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    points: [
      "Track student payments (UPI records).",
      "Maintain income and expense sheets.",
      "Coordinate vendor payments.",
      "Ensure transparent budgeting and final settlement.",
    ],
  },
  {
    key: "multimedia-team",
    title: "Multimedia Team (Videography & Photography)",
    icon: Camera,
    color: "text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/20",
    points: [
      "Capture promotional content before the event.",
      "Cover performances, crowd moments, and backstage.",
      "Create reels, event highlights, and after-movie videos.",
      "Manage event social media visuals.",
    ],
  },
  {
    key: "emcee-mc-department",
    title: "Emcee (MC) Department",
    icon: Mic2,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    points: [
      "Anchor the event and engage the audience.",
      "Coordinate event flow with the technical and performance teams.",
      "Maintain energy and smooth transitions between programs.",
      "Follow the scripted timeline of the event.",
    ],
  },
  {
    key: "event-day-volunteers",
    title: "Event Day Volunteers",
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    points: [
      "Assist participants and guests.",
      "Manage crowd movement and seating.",
      "Support backstage coordination.",
      "Help handle unexpected situations calmly.",
    ],
  },
  {
    key: "food-refreshment-volunteers",
    title: "Food & Refreshment Volunteers",
    icon: UtensilsCrossed,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    points: [
      "Coordinate with food vendors.",
      "Manage distribution counters.",
      "Ensure hygiene and proper serving.",
      "Monitor food stock and avoid wastage.",
    ],
  },
  {
    key: "technical-team",
    title: "Technical Team",
    icon: Wrench,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    points: [
      "Assist with stage setup and equipment arrangement.",
      "Monitor sound systems, microphones, DJ setup, and lighting.",
      "Coordinate with performers for technical requirements.",
      "Ensure smooth execution without technical interruptions.",
    ],
  },
  {
    key: "registration-entry-management",
    title: "Registration & Entry Management",
    icon: ClipboardList,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    points: [
      "Verify student registrations and payment confirmation.",
      "Manage entry points and crowd control at gates.",
      "Distribute passes/wristbands if required.",
      "Maintain attendance and entry records.",
    ],
  },
] as const;

// ─── Summary row ──────────────────────────────────────────────────────────────

function SummaryRow({
  icon: Icon,
  question,
  children,
  accent = "bg-purple-500/15 border-purple-500/20 text-purple-300",
}: {
  icon: React.ElementType;
  question: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div
        className={`flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${accent}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-1">{question}</p>
        <div>{children}</div>
      </div>
    </div>
  );
}

// ─── Yes / No toggle card ─────────────────────────────────────────────────────

function YesNoCard({
  question,
  description,
  value,
  onChange,
}: {
  question: string;
  description?: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="font-medium text-sm">{question}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
            value === true
              ? "border-emerald-500 bg-emerald-500/15 text-emerald-300"
              : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Yes
          {value === true && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
            value === false
              ? "border-rose-500 bg-rose-500/15 text-rose-300"
              : "border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/10"
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          No
          {value === false && <X className="w-3.5 h-3.5 ml-1" />}
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WillingnessPage() {
  const [supportStatus, setSupportStatus] = useState<boolean | null>(true);
  const [willingToCoordinate, setWillingToCoordinate] = useState<
    boolean | null
  >(null);
  const [interestedRoles, setInterestedRoles] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existing, setExisting] = useState(false);
  const [editing, setEditing] = useState(false);

  // ── load existing submission ────────────────────────────────────────────────

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/register");
        if (res.ok) {
          const data = await res.json();
          if (data.registration) {
            const r = data.registration;
            setSupportStatus(r.support_status ?? true);
            setWillingToCoordinate(r.willing_to_coordinate ?? null);
            setInterestedRoles(r.interested_roles ?? []);
            setRemarks(r.remarks ?? "");
            setExisting(true);
          }
        }
      } catch {
        // silently continue — form will start fresh
      } finally {
        setPageLoading(false);
      }
    })();
  }, []);

  // ── helpers ─────────────────────────────────────────────────────────────────

  const toggleRole = (key: string) => {
    setInterestedRoles((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key],
    );
  };

  const roleMeta = (key: string) =>
    ROLE_DETAILS.find((r) => r.key === key) ?? null;

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (willingToCoordinate === null) {
      setError("Please answer the question before submitting.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const method = existing ? "PATCH" : "POST";
      const res = await fetch("/api/register", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supportStatus,
          willingToCoordinate,
          interestedRoles: willingToCoordinate ? interestedRoles : [],
          remarks,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }

      setExisting(true);
      setEditing(false);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── page loading ─────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── read-only summary ─────────────────────────────────────────────────────────

  if (existing && !editing) {
    const selectedRoles = interestedRoles
      .map((k) => roleMeta(k))
      .filter(Boolean);

    return (
      <div className="max-w-xl mx-auto space-y-6">
        {/* header */}
        <div>
          <h1 className="text-2xl font-bold">Coordinator Willingness</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your response has been recorded for MASS 2K26.
          </p>
        </div>

        {/* summary card */}
        <Card className="border border-white/10 bg-card/60 backdrop-blur">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-base">Response Summary</CardTitle>
                <CardDescription className="text-xs">
                  Submitted — MASS 2K26
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs"
              >
                Submitted
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => setEditing(true)}
              >
                <Pencil className="w-3 h-3 mr-1.5" />
                Edit
              </Button>
            </div>
          </CardHeader>

          <Separator className="bg-white/5" />

          <CardContent className="divide-y divide-white/5 px-6 py-0">
            {/* willingness */}
            <SummaryRow
              icon={HandHeart}
              question="Willing to coordinate"
              accent="bg-violet-500/10 border-violet-500/20 text-violet-400"
            >
              <Badge
                variant="outline"
                className={
                  willingToCoordinate
                    ? "border-violet-500/30 bg-violet-500/10 text-violet-400"
                    : "border-zinc-600/50 bg-zinc-700/20 text-zinc-400"
                }
              >
                {willingToCoordinate ? "Yes, willing" : "Not willing"}
              </Badge>
            </SummaryRow>

            {/* roles */}
            {willingToCoordinate && (
              <SummaryRow
                icon={Users}
                question="Interested roles"
                accent="bg-blue-500/10 border-blue-500/20 text-blue-400"
              >
                {selectedRoles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    No roles selected
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRoles.map((r) => {
                      if (!r) return null;
                      const Icon = r.icon;
                      return (
                        <Badge
                          key={r.key}
                          variant="outline"
                          className={`${r.bg} ${r.color} border gap-1.5`}
                        >
                          <Icon className="w-3 h-3" />
                          {r.title}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </SummaryRow>
            )}

            {/* remarks */}
            {remarks && (
              <SummaryRow
                icon={MessageSquare}
                question="Remarks"
                accent="bg-amber-500/10 border-amber-500/20 text-amber-400"
              >
                <p className="text-sm font-medium leading-relaxed">{remarks}</p>
              </SummaryRow>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── editable form ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Coordinator Willingness Form</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Let us know your interest in supporting MASS 2K26.
          </p>
        </div>
        {editing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs mt-1"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
          >
            <X className="w-3 h-3 mr-1.5" />
            Cancel
          </Button>
        )}
      </div>

      {/* error banner */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border-l-4 border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Step 1: Support & Coordination ───────────────────────────────── */}
        <Card className="border border-white/10 bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <CardTitle className="text-base">Your Involvement</CardTitle>
                <CardDescription className="text-xs">
                  Tell us how you&apos;d like to be part of MASS 2K26
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <YesNoCard
              question="Are you willing to coordinate?"
              description="Coordinators take an active role in managing event activities."
              value={willingToCoordinate}
              onChange={setWillingToCoordinate}
            />
          </CardContent>
        </Card>

        {/* ── Step 2: Role selection (only if willing) ──────────────────────── */}
        {willingToCoordinate === true && (
          <Card className="border border-white/10 bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Select Interested Roles
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose one or more roles you are comfortable with.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ROLE_DETAILS.map((role) => {
                const Icon = role.icon;
                const selected = interestedRoles.includes(role.key);
                return (
                  <button
                    key={role.key}
                    type="button"
                    onClick={() => toggleRole(role.key)}
                    className={`w-full text-left rounded-xl border-2 p-4 transition-all ${
                      selected
                        ? `${role.bg} border-current`
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selected ? role.bg : "bg-white/5"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${selected ? role.color : "text-muted-foreground"}`}
                          />
                        </div>
                        <span
                          className={`font-medium text-sm ${selected ? role.color : "text-foreground"}`}
                        >
                          {role.title}
                        </span>
                      </div>
                      {selected && (
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${role.color}`}
                        />
                      )}
                    </div>

                    {selected && (
                      <ul className="mt-3 space-y-1 pl-11">
                        {role.points.map((pt, i) => (
                          <li
                            key={i}
                            className="text-xs text-muted-foreground flex gap-2"
                          >
                            <span className={`mt-0.5 ${role.color}`}>•</span>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}
                  </button>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ── Remarks ───────────────────────────────────────────────────────── */}
        <Card className="border border-white/10 bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-base">Remarks</CardTitle>
                <CardDescription className="text-xs">
                  Optional — any additional comments or availability notes
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. I'm available after 2 PM on event day..."
              rows={3}
              className="resize-none bg-white/5 border-white/10 text-sm"
            />
          </CardContent>
        </Card>

        {/* ── Submit ────────────────────────────────────────────────────────── */}
        <Button
          type="submit"
          disabled={loading || willingToCoordinate === null}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : existing ? (
            "Update Response"
          ) : (
            "Submit Response"
          )}
        </Button>

        {willingToCoordinate === null && (
          <p className="text-center text-xs text-muted-foreground">
            Answer the question above to enable submission.
          </p>
        )}
      </form>
    </div>
  );
}
