"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  ClipboardList,
  Pencil,
  Clock,
  Bus,
  ShieldCheck,
  Sparkles,
  BarChart3,
  MessageSquare,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

// ─── Option maps ─────────────────────────────────────────────────────────────

const timingOptions = [
  { value: "plan_a", label: "Plan A — Event until 8:00 PM" },
  { value: "plan_b", label: "Plan B — Event until 5:00 PM" },
];
const transportOptions = [
  { value: "yes", label: "Yes, I will arrange" },
  { value: "no", label: "No, I cannot" },
  {
    value: "need_college_transport",
    label: "I may need college-arranged transport",
  },
];
const comfortOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "depends", label: "Depends on transport/security" },
];
const atmosphereOptions = [
  { value: "daytime", label: "Daytime cultural fest" },
  { value: "night_concert", label: "Night concert-style event" },
  { value: "balanced", label: "Balanced (Day programs + Evening finale)" },
];

function labelFor(opts: { value: string; label: string }[], val: string) {
  return opts.find((o) => o.value === val)?.label ?? val;
}

// ─── Form sub-components ──────────────────────────────────────────────────────

function RadioGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
            value === opt.value
              ? "border-primary/60 bg-primary/8 shadow-sm"
              : "border-border/60 hover:border-primary/30 hover:bg-muted/30"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="accent-primary h-4 w-4 shrink-0"
          />
          <span className="text-sm">{opt.label}</span>
          {value === opt.value && (
            <CheckCircle2 className="h-4 w-4 text-primary ml-auto shrink-0" />
          )}
        </label>
      ))}
    </div>
  );
}

function ScaleSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const labels: Record<number, string> = {
    1: "Strongly oppose",
    2: "Oppose",
    3: "Neutral",
    4: "Support",
    5: "Strongly support",
  };
  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`h-12 w-12 rounded-xl border-2 text-lg font-bold transition-all ${
              value === n
                ? "border-primary bg-primary text-primary-foreground scale-110 shadow-md"
                : "border-border hover:border-primary/50 text-muted-foreground hover:bg-muted/40"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-center text-xs text-muted-foreground font-medium">
          {labels[value]}
        </p>
      )}
      <div className="flex justify-between text-[10px] text-muted-foreground/60 px-1">
        <span>1 — Strongly oppose</span>
        <span>5 — Strongly support</span>
      </div>
    </div>
  );
}

// ─── Read-only summary row ────────────────────────────────────────────────────

function SummaryRow({
  icon: Icon,
  question,
  answer,
  accent = "default",
}: {
  icon: React.ElementType;
  question: string;
  answer: string;
  accent?: "default" | "green" | "blue" | "amber";
}) {
  const accentClass = {
    default: "text-muted-foreground",
    green: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
  }[accent];

  const iconBg = {
    default: "bg-white/5 border-white/10",
    green: "bg-emerald-500/10 border-emerald-500/20",
    blue: "bg-blue-500/10 border-blue-500/20",
    amber: "bg-amber-500/10 border-amber-500/20",
  }[accent];

  return (
    <div className="flex gap-4 py-4">
      <div
        className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}
      >
        <Icon className={`h-4 w-4 ${accentClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-1">
          {question}
        </p>
        {answer ? (
          <p className="text-sm font-semibold leading-snug">{answer}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50 italic font-normal">
            Not answered
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [timingPreference, setTimingPreference] = useState("");
  const [transportFeasibility, setTransportFeasibility] = useState("");
  const [comfortLevel, setComfortLevel] = useState("");
  const [safetyMeasures, setSafetyMeasures] = useState("");
  const [atmospherePreference, setAtmospherePreference] = useState("");
  const [supportScore, setSupportScore] = useState(0);
  const [challenges, setChallenges] = useState("");
  const [creativeSuggestions, setCreativeSuggestions] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existing, setExisting] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetch("/api/survey")
      .then((r) => r.json())
      .then((data) => {
        if (data.feedback) {
          const f = data.feedback;
          setTimingPreference(f.timing_preference || "");
          setTransportFeasibility(f.transport_feasibility || "");
          setComfortLevel(f.comfort_level || "");
          setSafetyMeasures(f.safety_measures || "");
          setAtmospherePreference(f.atmosphere_preference || "");
          setSupportScore(f.support_score || 0);
          setChallenges(f.challenges || "");
          setCreativeSuggestions(f.creative_suggestions || "");
          setExisting(true);
        }
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (
      !timingPreference ||
      !transportFeasibility ||
      !comfortLevel ||
      !atmospherePreference ||
      !supportScore
    ) {
      setError("Please answer all required questions.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timingPreference,
          transportFeasibility,
          comfortLevel,
          safetyMeasures,
          atmospherePreference,
          supportScore: String(supportScore),
          challenges,
          creativeSuggestions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(true);
      setExisting(true);
      setEditing(false);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading survey…</p>
      </div>
    );
  }

  // ─── Read-only summary view ──────────────────────────────────────────────────

  if (existing && !editing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-emerald-500" />
              MASS 2K26 Survey
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your response has been recorded.
            </p>
          </div>
          <Badge
            variant="outline"
            className="gap-1.5 text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shrink-0 mt-1"
          >
            <CheckCircle2 className="h-3 w-3" />
            Submitted
          </Badge>
        </div>

        {/* Post-update success banner */}
        {success && (
          <div className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-xl" />
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            Survey updated successfully!
          </div>
        )}

        {/* Summary card */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Your Responses</CardTitle>
                {/* <CardDescription>
                  Tap &quot;Edit&quot; to change any answer
                </CardDescription> */}
              </div>
              {/* <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(true);
                  setSuccess(false);
                  setError("");
                }}
                className="gap-1.5 h-8 text-xs hover:border-primary/50 hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5">
            <div className="px-5">
              <SummaryRow
                icon={Clock}
                question="Event Timing Preference"
                answer={labelFor(timingOptions, timingPreference)}
                accent="blue"
              />
            </div>
            <div className="px-5">
              <SummaryRow
                icon={Bus}
                question="Transportation Feasibility"
                answer={labelFor(transportOptions, transportFeasibility)}
                accent="amber"
              />
            </div>
            <div className="px-5">
              <SummaryRow
                icon={ShieldCheck}
                question="Safety & Comfort"
                answer={labelFor(comfortOptions, comfortLevel)}
                accent="green"
              />
            </div>
            {safetyMeasures && (
              <div className="px-5">
                <SummaryRow
                  icon={ShieldCheck}
                  question="Safety Measures Expected"
                  answer={safetyMeasures}
                />
              </div>
            )}
            <div className="px-5">
              <SummaryRow
                icon={Sparkles}
                question="Crowd & Energy Expectation"
                answer={labelFor(atmosphereOptions, atmospherePreference)}
                accent="blue"
              />
            </div>
            {/* Support score bar */}
            <div className="px-5">
              <div className="flex gap-4 py-4">
                <div className="w-8 h-8 rounded-lg border bg-amber-500/10 border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground font-medium mb-2">
                    Final Opinion Weight
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <div
                          key={n}
                          className={`h-2 w-6 rounded-full transition-all ${
                            n <= supportScore ? "bg-amber-500" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-amber-400">
                      {supportScore}/5
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {supportScore >= 4
                        ? "Strongly supports 8 PM"
                        : supportScore === 3
                          ? "Neutral"
                          : "Opposes 8 PM"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {challenges && (
              <div className="px-5">
                <SummaryRow
                  icon={MessageSquare}
                  question="Challenges Foreseen"
                  answer={challenges}
                />
              </div>
            )}
            {creativeSuggestions && (
              <div className="px-5">
                <SummaryRow
                  icon={Lightbulb}
                  question="Creative Suggestions"
                  answer={creativeSuggestions}
                  accent="amber"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Form view ───────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            MASS 2K26 Survey
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {editing
              ? "Update your responses below."
              : "Help us plan a better event. Your responses are confidential."}
          </p>
        </div>
        {editing && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            className="shrink-0 mt-1 h-8 text-xs"
          >
            Cancel
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="relative overflow-hidden flex items-start gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3.5 text-sm text-red-300">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-xl" />
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            {error}
          </div>
        )}

        {/* Q1 — Timing */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Event Timing Preference{" "}
                  <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Which plan do you prefer for MASS 2K26?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <RadioGroup
              name="timing"
              value={timingPreference}
              onChange={setTimingPreference}
              options={timingOptions}
            />
          </CardContent>
        </Card>

        {/* Q2 — Transport */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Bus className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Transportation Feasibility{" "}
                  <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  If Plan A (8:00 PM) is selected, can you arrange your own
                  transport?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <RadioGroup
              name="transport"
              value={transportFeasibility}
              onChange={setTransportFeasibility}
              options={transportOptions}
            />
          </CardContent>
        </Card>

        {/* Q3 — Comfort */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Safety & Comfort <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Do you feel comfortable attending an event that ends at 8:00
                  PM?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <RadioGroup
              name="comfort"
              value={comfortLevel}
              onChange={setComfortLevel}
              options={comfortOptions}
            />
          </CardContent>
        </Card>

        {/* Q4 — Safety text */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Safety Measures Expected
                </CardTitle>
                <CardDescription className="text-xs">
                  What safety measures do you expect if the event runs till 8:00
                  PM?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <Textarea
              value={safetyMeasures}
              onChange={(e) => setSafetyMeasures(e.target.value)}
              placeholder="e.g., security, lighting, female safety support, transport coordination…"
              className="min-h-[80px] resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Q5 — Atmosphere */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Crowd & Energy Expectation{" "}
                  <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Which atmosphere do you prefer?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <RadioGroup
              name="atmosphere"
              value={atmospherePreference}
              onChange={setAtmospherePreference}
              options={atmosphereOptions}
            />
          </CardContent>
        </Card>

        {/* Q6 — Score */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Final Opinion Weight <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  How strongly do you support conducting the event until 8:00
                  PM? (1–5)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <ScaleSelector value={supportScore} onChange={setSupportScore} />
          </CardContent>
        </Card>

        {/* Q7 — Challenges */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-sm">Challenges Foreseen</CardTitle>
                <CardDescription className="text-xs">
                  Transportation, safety, discipline, academic schedule, noise,
                  etc.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="Your thoughts…"
              className="min-h-[80px] resize-none text-sm"
            />
          </CardContent>
        </Card>

        {/* Q8 — Suggestions */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Creative Suggestions</CardTitle>
                <CardDescription className="text-xs">
                  Practical ideas to improve execution, safety, or engagement.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <Textarea
              value={creativeSuggestions}
              onChange={(e) => setCreativeSuggestions(e.target.value)}
              placeholder="Your ideas…"
              className="min-h-[80px] resize-none text-sm"
            />
          </CardContent>
        </Card>

        <Separator className="opacity-20" />

        <Button
          type="submit"
          disabled={loading}
          className="w-full gap-2"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : existing ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Update Survey Response
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Submit Survey
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
