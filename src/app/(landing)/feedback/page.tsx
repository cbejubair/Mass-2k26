"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Lock,
  LogIn,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import FestivalBackground from "@/components/landing/FestivalBackground";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FEEDBACK_INITIAL_STATE,
  FEEDBACK_TABLE_SCHEMA,
  type FeedbackFormData,
  type FeedbackOption,
  type FeedbackSchemaRow,
} from "@/lib/feedback-schema";

// ── Register number decoder ──────────────────────────────────────────
const YEAR_MAP: Record<string, string> = {
  "22": "IV",
  "23": "III",
  "24": "II",
  "25": "I",
};
const DEPT_MAP: Record<string, string> = {
  "104": "CSE",
  "205": "IT",
  "243": "AIDS",
  "148": "AIML",
  "121": "BME",
  "225": "AGRI",
  "106": "ECE",
  "114": "MECH",
};

function deriveFromRegNumber(regNum: string): { year: string; department: string } | null {
  if (regNum.length !== 12 || !regNum.startsWith("7125")) return null;
  const year = YEAR_MAP[regNum.slice(4, 6)];
  const department = DEPT_MAP[regNum.slice(6, 9)];
  if (!year || !department) return null;
  return { year, department };
}

const SECTION_ORDER = Array.from(new Set(FEEDBACK_TABLE_SCHEMA.map((r) => r.section)));

type OptionTone = "high" | "midHigh" | "mid" | "low" | "neutral";

function getOptionTone(value: string): OptionTone {
  if (new Set(["excellent", "fully_met", "on_time", "worth_it", "perfect", "yes"]).has(value)) return "high";
  if (new Set(["good", "partially_met", "slight_delays", "maybe"]).has(value)) return "midHigh";
  if (new Set(["average", "neutral", "too_short", "too_long", "not_used"]).has(value)) return "mid";
  if (new Set(["poor", "very_poor", "not_met", "major_delays", "no_schedule", "not_worth", "no"]).has(value)) return "low";
  return "neutral";
}

function optionToneClasses(tone: OptionTone, active: boolean): string {
  const map: Record<OptionTone, { active: string; inactive: string }> = {
    high: {
      active: "border-emerald-500/60 bg-emerald-500/20 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30",
      inactive: "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300/80 hover:bg-emerald-500/[0.12] hover:border-emerald-400/40",
    },
    midHigh: {
      active: "border-sky-500/60 bg-sky-500/20 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.15)] ring-1 ring-sky-400/30",
      inactive: "border-sky-500/20 bg-sky-500/[0.06] text-sky-300/80 hover:bg-sky-500/[0.12] hover:border-sky-400/40",
    },
    mid: {
      active: "border-amber-500/60 bg-amber-500/20 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.15)] ring-1 ring-amber-400/30",
      inactive: "border-amber-500/20 bg-amber-500/[0.06] text-amber-300/80 hover:bg-amber-500/[0.12] hover:border-amber-400/40",
    },
    low: {
      active: "border-rose-500/60 bg-rose-500/20 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.15)] ring-1 ring-rose-400/30",
      inactive: "border-rose-500/20 bg-rose-500/[0.06] text-rose-300/80 hover:bg-rose-500/[0.12] hover:border-rose-400/40",
    },
    neutral: {
      active: "border-fuchsia-500/60 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_12px_rgba(217,70,239,0.15)] ring-1 ring-fuchsia-400/30",
      inactive: "border-white/[0.08] bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:border-fuchsia-400/30",
    },
  };
  return active ? map[tone].active : map[tone].inactive;
}

function isFieldMissing(form: FeedbackFormData, row: FeedbackSchemaRow): boolean {
  if (!row.required) return false;
  if (row.type === "multi") return form[row.field].length === 0;
  const value = form[row.field];
  return typeof value === "string" && value.trim().length === 0;
}

function scrollToField(fieldId: string) {
  const el = document.getElementById(`field-${fieldId}`);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
}

// ── Sub-components ────────────────────────────────────────────────────

function OptionGrid({ field, options, value, onChange, highlighted }: {
  field: string;
  options: readonly FeedbackOption[];
  value: string;
  onChange: (v: string) => void;
  highlighted: boolean;
}) {
  return (
    <div className={`grid gap-2 sm:grid-cols-2 rounded-xl transition-all duration-500 ${highlighted ? "ring-2 ring-red-500/50 ring-offset-2 ring-offset-transparent p-1" : ""}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        const tone = getOptionTone(opt.value);
        return (
          <button
            key={`${field}-${opt.value}`}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-200 cursor-pointer ${optionToneClasses(tone, active)}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function ValidationToast({ message, fieldId, onDismiss }: { message: string; fieldId: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className="fixed left-1/2 top-5 z-[200] -translate-x-1/2"
    >
      <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-[#0a0a0f]/95 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.6),0_0_0_1px_rgba(239,68,68,0.15)] backdrop-blur-2xl">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </span>
        <div className="flex flex-col gap-0.5">
          <p className="text-[13px] font-medium text-white">Required field missing</p>
          <p className="max-w-[260px] truncate text-xs text-neutral-400">{message}</p>
        </div>
        <button type="button" onClick={() => { scrollToField(fieldId); onDismiss(); }}
          className="ml-1 shrink-0 rounded-lg bg-red-500/15 px-2.5 py-1 text-xs font-semibold text-red-300 transition hover:bg-red-500/25 hover:text-red-200 active:scale-95">
          Jump ↓
        </button>
        <button type="button" onClick={onDismiss}
          className="ml-1 shrink-0 rounded-lg p-1 text-neutral-500 transition hover:bg-white/[0.08] hover:text-neutral-300" aria-label="Dismiss">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

// ── Full-page overlay states ──────────────────────────────────────────

function CenteredOverlay({ embedded, children }: { embedded: boolean; children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[hsl(240,10%,3.9%)]">
      <FestivalBackground />
      {!embedded && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-fuchsia-500/[0.07] blur-[100px]" />
          <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-purple-500/[0.06] blur-[120px]" />
        </div>
      )}
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        {children}
      </div>
    </main>
  );
}

/** Shown when user is not logged in */
function LoginGate({ embedded }: { embedded: boolean }) {
  return (
    <CenteredOverlay embedded={embedded}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-fuchsia-500/10 ring-1 ring-fuchsia-500/30">
          <LogIn className="h-9 w-9 text-fuchsia-400" />
        </div>
        <h2 className="text-2xl font-black text-white">Login Required</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          You need to be logged in to submit your feedback. Please sign in with your student credentials.
        </p>
        <a
          href="/login"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition hover:bg-fuchsia-400 hover:shadow-[0_0_28px_rgba(217,70,239,0.45)] active:scale-[0.98]"
        >
          <LogIn className="h-4 w-4" />
          Sign in to continue
        </a>
      </motion.div>
    </CenteredOverlay>
  );
}

/** Shown when this register number already submitted */
function AlreadySubmitted({ name, registerNumber, embedded }: { name: string; registerNumber: string; embedded: boolean }) {
  return (
    <CenteredOverlay embedded={embedded}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/30">
          <CheckCircle2 className="h-9 w-9 text-amber-400" />
        </div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
          Already Submitted
        </div>
        <h2 className="text-2xl font-black text-white">You&apos;ve already responded!</h2>
        <p className="mt-3 text-sm leading-relaxed text-neutral-400">
          Feedback from <span className="font-semibold text-white">{name}</span>{" "}
          <span className="font-mono text-xs text-neutral-500">({registerNumber})</span>{" "}
          has already been recorded. Each student can submit feedback only once.
        </p>
        <p className="mt-5 text-xs text-neutral-500">
          Think something went wrong? Contact your coordinator.
        </p>
      </motion.div>
    </CenteredOverlay>
  );
}

/** Full success screen after submission */
function SuccessScreen({ name, embedded }: { name: string; embedded: boolean }) {
  return (
    <CenteredOverlay embedded={embedded}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 22 }}
        className="w-full max-w-md text-center"
      >
        {/* Animated checkmark ring */}
        <div className="relative mx-auto mb-8 flex h-28 w-28 items-center justify-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 18 }}
            className="absolute inset-0 rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30"
          />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.15, 1] }}
            transition={{ delay: 0.35, duration: 0.5, times: [0, 0.7, 1] }}
          >
            <CheckCircle2 className="h-14 w-14 text-emerald-400" />
          </motion.div>
          {/* Ping rings */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-emerald-500/40"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Feedback recorded
          </div>
          <h2 className="text-3xl font-black text-white">
            Thank you, {name.split(" ")[0]}! 🎉
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-400">
            Your feedback for <span className="font-semibold text-fuchsia-300">MASS 2K26</span> has been submitted successfully. It will help us make the next edition even better.
          </p>
          <p className="mt-6 text-xs text-neutral-600">
            You can close this page or explore the rest of the site.
          </p>
        </motion.div>
      </motion.div>
    </CenteredOverlay>
  );
}

// ── Page states ───────────────────────────────────────────────────────
type PageState =
  | "loading"           // Checking session + prior submission
  | "not_logged_in"     // Must log in first
  | "already_submitted" // Already submitted
  | "form"              // Normal — show the form
  | "success";          // Just submitted

// ─────────────────────────────────────────────────────────────────────
export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const embedded = searchParams.get("embedded") === "1";

  const [pageState, setPageState] = useState<PageState>("loading");
  const [form, setForm] = useState<FeedbackFormData>(FEEDBACK_INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");

  // User metadata
  const [userName, setUserName] = useState("");
  const [userRegNum, setUserRegNum] = useState("");
  const [autoFilled, setAutoFilled] = useState(false);
  const [decodedInfo, setDecodedInfo] = useState<{ year: string; department: string } | null>(null);

  // Validation toast + highlight
  const [toast, setToast] = useState<{ message: string; fieldId: string } | null>(null);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
  }, []);

  // ── On mount: check session then check prior submission ──
  useEffect(() => {
    async function init() {
      try {
        // 1. Get session
        const meRes = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (!meRes.ok) {
          setPageState("not_logged_in");
          return;
        }
        const me = await meRes.json();
        const name: string = me.name || "";
        const regNum: string = me.registerNumber || "";
        setUserName(name);
        setUserRegNum(regNum);

        // 2. Check prior submission
        const checkRes = await fetch("/api/feedback", { credentials: "same-origin" });
        if (checkRes.ok) {
          const check = await checkRes.json();
          if (check.submitted) {
            setPageState("already_submitted");
            return;
          }
        }

        // 3. Auto-fill form
        setForm((prev) => ({ ...prev, register_number: regNum, student_name: name }));
        setAutoFilled(true);

        if (regNum) {
          const derived = deriveFromRegNumber(regNum);
          if (derived) setDecodedInfo(derived);
          else if (me.department && me.year) setDecodedInfo({ department: me.department, year: me.year });
        }

        setPageState("form");
      } catch {
        // Fallback — show form. API will enforce auth.
        setPageState("form");
      }
    }
    init();
  }, []);

  const groupedSchema = useMemo(
    () => SECTION_ORDER.map((section) => ({
      section,
      questions: FEEDBACK_TABLE_SCHEMA.filter((r) => r.section === section),
    })),
    [],
  );

  const updateField = <K extends keyof FeedbackFormData>(key: K, value: FeedbackFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (highlightedField === key) { setHighlightedField(null); setToast(null); }
  };

  const toggleImprovementArea = (value: string) => {
    setForm((prev) => {
      const exists = prev.improvement_areas.includes(value);
      const next = {
        ...prev,
        improvement_areas: exists
          ? prev.improvement_areas.filter((i) => i !== value)
          : [...prev.improvement_areas, value],
      };
      if (next.improvement_areas.length > 0 && highlightedField === "improvement_areas") {
        setHighlightedField(null); setToast(null);
      }
      return next;
    });
  };

  const showValidationError = (row: FeedbackSchemaRow) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    setHighlightedField(row.field);
    setToast({ message: row.question, fieldId: row.field });
    setTimeout(() => scrollToField(row.field), 80);
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    highlightTimerRef.current = setTimeout(() => setHighlightedField(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setApiError("");

    const missing = FEEDBACK_TABLE_SCHEMA.find((row) => isFieldMissing(form, row));
    if (missing) { showValidationError(missing); setSubmitting(false); return; }

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (response.status === 409 || data.error === "ALREADY_SUBMITTED") {
        setPageState("already_submitted");
        return;
      }
      if (!response.ok) {
        setApiError(data.error || "Failed to submit feedback.");
        return;
      }
      setPageState("success");
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render pre-form states ─────────────────────────────────────────
  if (pageState === "loading") {
    return (
      <main className="relative flex min-h-screen items-center justify-center bg-[hsl(240,10%,3.9%)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" />
          <p className="text-sm text-neutral-500">Loading feedback form…</p>
        </div>
      </main>
    );
  }

  if (pageState === "not_logged_in") return <LoginGate embedded={embedded} />;
  if (pageState === "already_submitted") return <AlreadySubmitted name={userName} registerNumber={userRegNum} embedded={embedded} />;
  if (pageState === "success") return <SuccessScreen name={userName || form.student_name} embedded={embedded} />;

  // ── Main form ──────────────────────────────────────────────────────
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[hsl(240,10%,3.9%)]">
      {!embedded && <FestivalBackground />}
      {!embedded && <Navbar />}

      {/* Validation toast */}
      <AnimatePresence mode="wait">
        {toast && (
          <ValidationToast
            key={toast.fieldId}
            message={toast.message}
            fieldId={toast.fieldId}
            onDismiss={() => { setToast(null); if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }}
          />
        )}
      </AnimatePresence>

      <section className={`relative px-4 pb-20 sm:px-6 ${embedded ? "pt-6 md:pt-8" : "pt-24 md:pt-32"}`}>
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-fuchsia-500/[0.07] blur-[100px]" />
          <div className="absolute right-10 top-40 h-80 w-80 rounded-full bg-purple-500/[0.06] blur-[120px]" />
          <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-cyan-500/[0.04] blur-[100px]" />
        </div>

        <div className="relative mx-auto max-w-5xl space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/15 ring-1 ring-fuchsia-500/30">
                <ClipboardList className="h-5 w-5 text-fuchsia-400" />
              </div>
              <h1 className="text-3xl font-black text-white sm:text-4xl">
                MASS <span className="text-fuchsia-400">2K26</span> Feedback
              </h1>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-neutral-400 sm:text-base">
              Measure execution quality, logistics, engagement, and improvement areas. Your feedback directly shapes the next MASS event.
            </p>
          </motion.div>

          {/* API error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-sm font-medium text-red-200">{apiError}</p>
            </motion.div>
          )}

          {/* Main form card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden border-white/[0.08] bg-white/[0.03] shadow-[0_8px_48px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
              <CardHeader className="border-b border-white/[0.06] bg-white/[0.02]">
                <CardTitle className="text-white">Feedback Form</CardTitle>
                <CardDescription className="text-neutral-500">
                  All fields are mandatory. Improvement areas support multiple selection.
                </CardDescription>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-300">High</span>
                  <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-sky-300">Good</span>
                  <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-amber-300">Neutral</span>
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-rose-300">Low</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {groupedSchema.map((section, sectionIndex) => (
                    <motion.div
                      key={section.section}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 + sectionIndex * 0.05 }}
                      className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
                    >
                      <h2 className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
                        <Sparkles className="h-4 w-4 text-fuchsia-400/70" />
                        {section.section}
                      </h2>

                      {/* Auto-fill session banner */}
                      {section.section === "Participant Details" && autoFilled && (
                        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] px-3.5 py-2.5">
                          <UserCheck className="h-4 w-4 shrink-0 text-emerald-400" />
                          <p className="text-xs font-medium text-emerald-300">
                            Auto-filled from your login session
                            {decodedInfo && (
                              <span className="ml-1.5 text-emerald-400/80">
                                · {decodedInfo.department} · Year {decodedInfo.year}
                              </span>
                            )}
                          </p>
                        </div>
                      )}

                      <div className="space-y-5">
                        {section.questions.map((question) => {
                          const field = question.field;
                          const fieldValue = form[field];
                          const isAutoFilledField = autoFilled && (field === "register_number" || field === "student_name");
                          const isHighlighted = highlightedField === field;

                          return (
                            <div
                              key={field}
                              id={`field-${field}`}
                              className={`space-y-2 scroll-mt-28 rounded-xl transition-all duration-300 ${
                                isHighlighted ? "ring-2 ring-red-500/50 ring-offset-[3px] ring-offset-transparent -mx-1 px-1 py-1" : ""
                              }`}
                            >
                              <Label className="flex items-center gap-1.5 text-sm font-semibold text-neutral-300">
                                {question.question}
                                <span className="text-red-400/80">*</span>
                                {isAutoFilledField && <Lock className="ml-1 h-3 w-3 text-emerald-400/60" />}
                              </Label>

                              {isHighlighted && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="flex items-center gap-1.5 text-[11px] font-medium text-red-400"
                                >
                                  <AlertCircle className="h-3 w-3 shrink-0" />
                                  This field is required
                                </motion.p>
                              )}

                              {/* TEXT */}
                              {question.type === "text" && typeof fieldValue === "string" && (
                                <div className="relative">
                                  <Input
                                    value={fieldValue}
                                    onChange={(e) => { if (isAutoFilledField) return; updateField(field, e.target.value as FeedbackFormData[typeof field]); }}
                                    readOnly={isAutoFilledField}
                                    placeholder={field === "register_number" ? "e.g. 712525104001" : "Enter your name"}
                                    className={`text-white placeholder:text-neutral-600 focus:border-fuchsia-500/50 focus:ring-fuchsia-500/20 transition-all duration-300 ${
                                      isAutoFilledField
                                        ? "cursor-not-allowed bg-emerald-500/[0.06] border-emerald-500/20 text-emerald-200"
                                        : isHighlighted
                                        ? "border-red-500/50 bg-red-500/[0.06]"
                                        : "border-white/[0.08] bg-white/[0.05]"
                                    }`}
                                  />
                                  {field === "register_number" && !autoFilled && fieldValue.length === 12 && (() => {
                                    const d = deriveFromRegNumber(fieldValue);
                                    if (!d) return null;
                                    return (
                                      <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-950/30 px-3 py-1.5 text-xs text-emerald-300">
                                        <Sparkles className="h-3 w-3 shrink-0" />
                                        Detected: <strong>{d.department}</strong> · Year <strong>{d.year}</strong>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}

                              {/* SINGLE */}
                              {question.type === "single" && typeof fieldValue === "string" && question.options && (
                                <OptionGrid
                                  field={field}
                                  options={question.options}
                                  value={fieldValue}
                                  onChange={(v) => updateField(field, v as FeedbackFormData[typeof field])}
                                  highlighted={isHighlighted}
                                />
                              )}

                              {/* MULTI */}
                              {question.type === "multi" && Array.isArray(fieldValue) && question.options && (
                                <div className={`grid gap-2 sm:grid-cols-2 rounded-xl transition-all duration-500 ${isHighlighted ? "ring-2 ring-red-500/50 ring-offset-2 ring-offset-transparent p-1" : ""}`}>
                                  {question.options.map((opt) => {
                                    const checked = fieldValue.includes(opt.value);
                                    return (
                                      <label key={opt.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${
                                        checked
                                          ? "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200"
                                          : "border-white/[0.08] bg-white/[0.04] text-neutral-300 hover:border-fuchsia-400/30 hover:bg-white/[0.07]"
                                      }`}>
                                        <Checkbox checked={checked} onCheckedChange={() => toggleImprovementArea(opt.value)} />
                                        <span>{opt.label}</span>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              {/* PARAGRAPH */}
                              {question.type === "paragraph" && typeof fieldValue === "string" && (
                                <Textarea
                                  value={fieldValue}
                                  onChange={(e) => updateField(field, e.target.value as FeedbackFormData[typeof field])}
                                  placeholder="Write your response"
                                  className={`min-h-24 text-white placeholder:text-neutral-600 focus:ring-fuchsia-500/20 transition-all duration-300 ${
                                    isHighlighted
                                      ? "border-red-500/50 bg-red-500/[0.06] focus:border-red-400/50"
                                      : "border-white/[0.08] bg-white/[0.05] focus:border-fuchsia-500/50"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}

                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting}
                    className="w-full rounded-xl bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all duration-200 hover:bg-fuchsia-400 hover:shadow-[0_0_28px_rgba(217,70,239,0.45)] active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting…
                      </span>
                    ) : "Submit Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {!embedded && <Footer />}
    </main>
  );
}
