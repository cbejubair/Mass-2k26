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
import {
  Loader2,
  CheckCircle2,
  ClipboardList,
  Bus,
  ShoppingBag,
  Lightbulb,
  AlertCircle,
  HelpCircle,
  MapPin,
} from "lucide-react";

// ─── Option maps ─────────────────────────────────────────────────────────────

const transportAfterOptions = [
  { value: "by_own", label: "By Own (self-arranged)" },
  { value: "out_bus", label: "Out Bus / Public Transport" },
  { value: "hosteler", label: "Hosteler (staying on campus)" },
  { value: "parent", label: "Parent / Guardian Pick-up" },
];

const stallItems = [
  { value: "shawarma", label: "🌯 Shawarma" },
  { value: "mojito", label: "🍹 Mojito" },
  { value: "momos", label: "🥟 Momos" },
  { value: "sprinkle_potato", label: "🥔 Sprinkle Potato" },
  { value: "directs", label: "🍽️ Directs" },
  { value: "neon_vibe", label: "✨ Neon Vibe Items" },
  { value: "fancy_items", label: "🎀 Fancy / Accessories" },
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
  const [transportAfterEvent, setTransportAfterEvent] = useState("");
  const [needCollegeTransport, setNeedCollegeTransport] = useState("");
  const [transportArea, setTransportArea] = useState("");
  const [transportDistance, setTransportDistance] = useState("");
  const [stallInterest, setStallInterest] = useState<string[]>([]);
  const [creativeSuggestions, setCreativeSuggestions] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existing, setExisting] = useState(false);

  useEffect(() => {
    fetch("/api/survey")
      .then((r) => r.json())
      .then((data) => {
        if (data.feedback) {
          const f = data.feedback;
          setTransportAfterEvent(f.transport_after_event || "");
          setNeedCollegeTransport(f.need_college_transport || "");
          setTransportArea(f.transport_area || "");
          setTransportDistance(f.transport_distance || "");
          setStallInterest(f.stall_interest || []);
          setCreativeSuggestions(f.creative_suggestions || "");
          setExisting(true);
        }
      })
      .catch(() => {})
      .finally(() => setPageLoading(false));
  }, []);

  const toggleStall = (val: string) =>
    setStallInterest((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val],
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!transportAfterEvent || !needCollegeTransport) {
      setError("Please answer all required questions.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transportAfterEvent,
          needCollegeTransport,
          transportArea,
          transportDistance,
          stallInterest,
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

  if (existing && !success) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
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

        <Card className="border-white/10 bg-card/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base">Your Responses</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-white/5">
            <div className="flex gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-lg border bg-amber-500/10 border-amber-500/20 flex items-center justify-center shrink-0">
                <Bus className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Transportation After Event
                </p>
                <p className="text-sm font-semibold">
                  {labelFor(transportAfterOptions, transportAfterEvent) || (
                    <span className="text-muted-foreground/50 italic font-normal">
                      Not answered
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-lg border bg-blue-500/10 border-blue-500/20 flex items-center justify-center shrink-0">
                <HelpCircle className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  Need College Transport?
                </p>
                <p className="text-sm font-semibold capitalize">
                  {needCollegeTransport || (
                    <span className="text-muted-foreground/50 italic font-normal">
                      Not answered
                    </span>
                  )}
                </p>
                {needCollegeTransport === "yes" &&
                  (transportArea || transportDistance) && (
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {transportArea && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {transportArea}
                        </span>
                      )}
                      {transportDistance && (
                        <span>~{transportDistance} from college</span>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <div className="flex gap-4 px-5 py-4">
              <div className="w-8 h-8 rounded-lg border bg-emerald-500/10 border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">
                  Stall Interest
                </p>
                {stallInterest.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {stallInterest.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs text-emerald-400"
                      >
                        {labelFor(stallItems, s)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50 italic">
                    None selected
                  </p>
                )}
              </div>
            </div>

            {creativeSuggestions && (
              <div className="flex gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-lg border bg-amber-500/10 border-amber-500/20 flex items-center justify-center shrink-0">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-1">
                    Creative Suggestions
                  </p>
                  <p className="text-sm font-semibold leading-snug">
                    {creativeSuggestions}
                  </p>
                </div>
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          MASS 2K26 Survey
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {success
            ? "Thank you! Response updated successfully."
            : "Help us plan the event better. Responses are confidential."}
        </p>
      </div>

      {success && (
        <div className="relative overflow-hidden flex items-center gap-3 rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-4 py-3 text-sm text-emerald-300">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 rounded-l-xl" />
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          Survey submitted successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="relative overflow-hidden flex items-start gap-3 rounded-xl border border-red-500/25 bg-gradient-to-r from-red-500/10 to-red-500/5 px-4 py-3.5 text-sm text-red-300">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-l-xl" />
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            {error}
          </div>
        )}

        {/* Q1 — Transportation After Event */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Bus className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Transportation After Event{" "}
                  <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  How do you plan to travel home after the event?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <RadioGroup
              name="transport_after"
              value={transportAfterEvent}
              onChange={setTransportAfterEvent}
              options={transportAfterOptions}
            />
          </CardContent>
        </Card>

        {/* Q2 — Need College Transport */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <HelpCircle className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-sm">
                  Need College Transport?{" "}
                  <span className="text-red-400">*</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Do you need college to arrange transport for you?
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5 space-y-4">
            <RadioGroup
              name="need_college_transport"
              value={needCollegeTransport}
              onChange={(v) => {
                setNeedCollegeTransport(v);
                if (v === "no") {
                  setTransportArea("");
                  setTransportDistance("");
                }
              }}
              options={[
                { value: "yes", label: "Yes, I need college transport" },
                { value: "no", label: "No, I don't need it" },
              ]}
            />
            {needCollegeTransport === "yes" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Area / Location
                  </label>
                  <input
                    type="text"
                    value={transportArea}
                    onChange={(e) => setTransportArea(e.target.value)}
                    placeholder="e.g., Anna Nagar, Tambaram…"
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Distance from College
                  </label>
                  <input
                    type="text"
                    value={transportDistance}
                    onChange={(e) => setTransportDistance(e.target.value)}
                    placeholder="e.g., 15 km, 30 min…"
                    className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q3 — Stall Interest */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Stall Interest</CardTitle>
                <CardDescription className="text-xs">
                  Which stalls would you visit? Select all that apply.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-1 pb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {stallItems.map((item) => {
                const checked = stallInterest.includes(item.value);
                return (
                  <label
                    key={item.value}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
                      checked
                        ? "border-emerald-500/40 bg-emerald-500/8 shadow-sm"
                        : "border-border/60 hover:border-emerald-500/30 hover:bg-muted/30"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleStall(item.value)}
                      className="accent-emerald-500 h-4 w-4 shrink-0"
                    />
                    <span className="text-sm">{item.label}</span>
                    {checked && (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 ml-auto shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Q4 — Creative Suggestions */}
        <Card className="border-white/10 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-sm">Creative Suggestions</CardTitle>
                <CardDescription className="text-xs">
                  Practical ideas to improve the event, safety, or engagement.
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
