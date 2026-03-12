"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  Bus,
  ShoppingBag,
  Lightbulb,
  MapPin,
  Users,
  TruckIcon,
} from "lucide-react";

// ── Data types ────────────────────────────────────────────────────────────────

interface SurveyUser {
  name: string;
  register_number: string;
  department: string;
  year?: string;
  class_section?: string;
}

interface SurveyEntry {
  id: string;
  transport_after_event: string | null;
  need_college_transport: string | null;
  transport_area: string | null;
  transport_distance: string | null;
  stall_interest: string[] | null;
  creative_suggestions: string | null;
  users: SurveyUser | null;
}

// ── Label maps ────────────────────────────────────────────────────────────────

const TRANSPORT_AFTER_LABELS: Record<string, string> = {
  by_own: "By Own",
  out_bus: "Out Bus / Public Transport",
  hosteler: "Hosteler",
  parent: "Parent / Guardian Pick-up",
};

const COLLEGE_TRANSPORT_LABELS: Record<string, string> = {
  yes: "Yes, needs college transport",
  no: "No, will manage own",
};

const STALL_LABELS: Record<string, string> = {
  shawarma: "🌯 Shawarma",
  mojito: "🍹 Mojito",
  momos: "🥟 Momos",
  sprinkle_potato: "🥔 Sprinkle Potato",
  dessert: "🍮 Dessert",
  ice_cream: "🍦 Ice Cream",
  neon_vibe: "✨ Neon Vibe Items",
  fancy_items: "🎀 Fancy / Accessories",
};

const TRANSPORT_COLORS: Record<string, string> = {
  by_own: "bg-emerald-500",
  out_bus: "bg-blue-500",
  hosteler: "bg-violet-500",
  parent: "bg-amber-500",
};

const STALL_COLORS = [
  "bg-orange-500",
  "bg-cyan-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-sky-400",
  "bg-purple-500",
  "bg-rose-500",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function countBy<T>(
  items: T[],
  accessor: (item: T) => string | null | undefined,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const val = accessor(item);
    if (val) counts[val] = (counts[val] || 0) + 1;
  }
  return counts;
}

function StatBar({
  label,
  count,
  total,
  colorClass,
}: {
  label: string;
  count: number;
  total: number;
  colorClass: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-200">{label}</span>
        <span className="text-neutral-400 font-medium tabular-nums">
          {count} <span className="text-neutral-600">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  color = "text-fuchsia-400",
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className={`rounded-xl bg-white/5 p-2.5`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── CSV download ──────────────────────────────────────────────────────────────

function downloadCSV(surveys: SurveyEntry[]) {
  const headers = [
    "Name",
    "Register Number",
    "Department",
    "Year",
    "Class Section",
    "Transport After Event",
    "Needs College Transport",
    "Transport Area",
    "Transport Distance",
    "Stall Interests",
    "Creative Suggestions",
  ];

  const rows = surveys.map((s) => [
    s.users?.name ?? "",
    s.users?.register_number ?? "",
    s.users?.department ?? "",
    s.users?.year ?? "",
    s.users?.class_section ?? "",
    TRANSPORT_AFTER_LABELS[s.transport_after_event ?? ""] ??
      s.transport_after_event ??
      "",
    COLLEGE_TRANSPORT_LABELS[s.need_college_transport ?? ""] ??
      s.need_college_transport ??
      "",
    s.transport_area ?? "",
    s.transport_distance ?? "",
    (s.stall_interest ?? [])
      .map((k) => STALL_LABELS[k]?.replace(/^.\s/, "") ?? k)
      .join("; "),
    s.creative_suggestions ?? "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mass2k26-survey-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminSurveyPage() {
  const [surveys, setSurveys] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/survey")
      .then((r) => r.json())
      .then((data) => setSurveys(data.feedback || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = useCallback(() => downloadCSV(surveys), [surveys]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  const total = surveys.length;
  const transportCounts = countBy(surveys, (s) => s.transport_after_event);
  const collegeBusCounts = countBy(surveys, (s) => s.need_college_transport);
  const needBusCount = collegeBusCounts["yes"] ?? 0;
  const busArea = surveys
    .filter((s) => s.need_college_transport === "yes" && s.transport_area)
    .map((s) => s.transport_area!);

  // Stall interest counts (items appear in arrays)
  const stallCounts: Record<string, number> = {};
  for (const s of surveys) {
    for (const item of s.stall_interest ?? []) {
      stallCounts[item] = (stallCounts[item] || 0) + 1;
    }
  }

  const sortedStalls = Object.entries(STALL_LABELS)
    .map(([key, label]) => ({ key, label, count: stallCounts[key] ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const suggestions = surveys.filter((s) => s.creative_suggestions);

  return (
    <div className="space-y-6 pb-10">
      {/* ── Page header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">
            Survey Insights
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {total} response{total !== 1 ? "s" : ""} collected
          </p>
        </div>
        <Button
          onClick={handleDownload}
          disabled={total === 0}
          className="gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_16px_rgba(217,70,239,0.25)] disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </Button>
      </div>

      {/* ── Top stat pills ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total Responses", value: total, color: "text-white" },
          {
            label: "Need College Bus",
            value: needBusCount,
            color: "text-amber-400",
          },
          {
            label: "Suggestions",
            value: suggestions.length,
            color: "text-violet-400",
          },
          {
            label: "Avg Stall Picks",
            value:
              total > 0
                ? (
                    surveys.reduce(
                      (s, e) => s + (e.stall_interest?.length ?? 0),
                      0,
                    ) / total
                  ).toFixed(1)
                : "—",
            color: "text-cyan-400",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-4"
          >
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="mt-1 text-xs uppercase tracking-wider text-neutral-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Transport & College bus ── */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <SectionHeader
            icon={Bus}
            title="Transport After Event"
            subtitle="How students plan to go home"
            color="text-blue-400"
          />
          <div className="space-y-3">
            {Object.entries(TRANSPORT_AFTER_LABELS).map(([key, label]) => (
              <StatBar
                key={key}
                label={label}
                count={transportCounts[key] ?? 0}
                total={total}
                colorClass={TRANSPORT_COLORS[key] ?? "bg-neutral-500"}
              />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
          <SectionHeader
            icon={TruckIcon}
            title="College Transport Needed"
            subtitle={`${needBusCount} of ${total} students need a college bus`}
            color="text-amber-400"
          />
          <div className="space-y-3">
            {Object.entries(COLLEGE_TRANSPORT_LABELS).map(([key, label], i) => (
              <StatBar
                key={key}
                label={label}
                count={collegeBusCounts[key] ?? 0}
                total={total}
                colorClass={i === 0 ? "bg-amber-500" : "bg-neutral-600"}
              />
            ))}
          </div>

          {/* Bus request areas */}
          {busArea.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <MapPin className="h-3 w-3" /> Pickup areas requested
              </p>
              <div className="max-h-40 space-y-1 overflow-y-auto pr-1">
                {surveys
                  .filter(
                    (s) =>
                      s.need_college_transport === "yes" && s.transport_area,
                  )
                  .map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2"
                    >
                      <span className="text-sm text-neutral-200">
                        {s.transport_area}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-neutral-400">
                          {s.users?.name}
                        </p>
                        {s.transport_distance && (
                          <p className="text-[11px] text-neutral-600">
                            {s.transport_distance} km
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Stall interest ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <SectionHeader
          icon={ShoppingBag}
          title="Stall Interest"
          subtitle="What students want at the food & merch stalls (multi-select)"
          color="text-orange-400"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedStalls.map(({ key, label, count }, i) => (
            <StatBar
              key={key}
              label={label}
              count={count}
              total={total}
              colorClass={STALL_COLORS[i % STALL_COLORS.length]}
            />
          ))}
        </div>
      </div>

      {/* ── Creative suggestions ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <SectionHeader
          icon={Lightbulb}
          title="Creative Suggestions"
          subtitle={`${suggestions.length} student${suggestions.length !== 1 ? "s" : ""} shared ideas`}
          color="text-yellow-400"
        />
        {suggestions.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No suggestions submitted yet.
          </p>
        ) : (
          <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
              >
                <p className="text-sm leading-relaxed text-neutral-200">
                  {s.creative_suggestions}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-neutral-400">
                    — {s.users?.name ?? "Unknown"}
                  </span>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                    {s.users?.register_number}
                  </Badge>
                  {s.users?.department && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 border-white/10"
                    >
                      {s.users.department}
                      {s.users.year ? ` · Yr ${s.users.year}` : ""}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── All responses table ── */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
        <SectionHeader
          icon={Users}
          title="All Responses"
          subtitle={`${total} submissions`}
          color="text-neutral-400"
        />
        {total === 0 ? (
          <p className="text-sm text-neutral-500">No responses yet.</p>
        ) : (
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="pb-3 pr-4 font-medium">Student</th>
                  <th className="pb-3 pr-4 font-medium">Transport</th>
                  <th className="pb-3 pr-4 font-medium">College Bus</th>
                  <th className="pb-3 font-medium">Stall Picks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {surveys.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="py-3 pr-4">
                      <p className="font-medium text-neutral-200">
                        {s.users?.name ?? "—"}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {s.users?.register_number}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {s.users?.department}
                        {s.users?.year ? ` · Yr ${s.users.year}` : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-xs text-neutral-300">
                      {TRANSPORT_AFTER_LABELS[s.transport_after_event ?? ""] ??
                        s.transport_after_event ??
                        "—"}
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      {s.need_college_transport === "yes" ? (
                        <span className="text-amber-400">
                          Yes
                          {s.transport_area ? ` · ${s.transport_area}` : ""}
                          {s.transport_distance
                            ? ` (${s.transport_distance} km)`
                            : ""}
                        </span>
                      ) : (
                        <span className="text-neutral-500">No</span>
                      )}
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1">
                        {(s.stall_interest ?? []).length > 0 ? (
                          (s.stall_interest ?? []).map((item) => (
                            <span
                              key={item}
                              className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-neutral-300"
                            >
                              {STALL_LABELS[item] ?? item}
                            </span>
                          ))
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
