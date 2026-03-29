"use client";

import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  BarChart3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Download,
  Lightbulb,
  Loader2,
  MessageSquareHeart,
  Search,
  SearchX,
  Table2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FEEDBACK_OPTIONS, FEEDBACK_TABLE_SCHEMA } from "@/lib/feedback-schema";

interface FeedbackEntry {
  id: string;
  register_number: string;
  student_name: string;
  overall_event_rating: string;
  expectation_match: string;
  planning_coordination: string;
  schedule_adherence: string;
  stage_setup_quality: string;
  lighting_arrangement: string;
  sound_system_clarity: string;
  led_visual_effects: string;
  performance_quality: string;
  dj_session_experience: string;
  event_energy_engagement: string;
  event_duration: string;
  seating_arrangement: string;
  crowd_management: string;
  transport_arrangement: string;
  coordinator_support: string;
  discipline_maintained: string;
  value_for_money: string;
  best_part: string;
  improvement_areas: string[];
  liked_most: string;
  improve_next_time: string;
  suggestions_next_year: string;
  volunteer_next_event: string;
  created_at: string;
}

type FilterLevel =
  | "all"
  | "excellent"
  | "good"
  | "average"
  | "poor"
  | "very_poor";

type RowStat = {
  value: string;
  label: string;
  count: number;
  percentage: number;
};

type ThemeStat = {
  keyword: string;
  count: number;
};

type FeedbackEntryWithMeta = FeedbackEntry & {
  derivedYear: string;
  derivedDepartment: string;
};

const ANALYTICS_SECTIONS = Array.from(
  new Set(
    FEEDBACK_TABLE_SCHEMA.filter(
      (row) => row.type === "single" || row.type === "multi",
    ).map((row) => row.section),
  ),
);

const THEME_STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "better",
  "could",
  "during",
  "event",
  "events",
  "every",
  "have",
  "improve",
  "improved",
  "improvement",
  "improvements",
  "mass",
  "more",
  "most",
  "next",
  "should",
  "some",
  "that",
  "their",
  "there",
  "these",
  "this",
  "very",
  "with",
  "year",
]);

const YEAR_CODE_MAP: Record<string, string> = {
  "22": "IV",
  "23": "III",
  "24": "II",
  "25": "I",
};

const DEPT_CODE_MAP: Record<string, string> = {
  "104": "CSE",
  "205": "IT",
  "243": "AIDS",
  "148": "AIML",
  "121": "BME",
  "225": "AGRI",
  "106": "ECE",
  "114": "MECH",
};

function deriveYearDepartment(registerNumber: string): {
  year: string;
  department: string;
} {
  const normalized = registerNumber.trim().toUpperCase();

  if (/^7125\d{8}$/.test(normalized)) {
    const year = YEAR_CODE_MAP[normalized.slice(4, 6)] || "Unknown";
    const department = DEPT_CODE_MAP[normalized.slice(6, 9)] || "Unknown";
    return { year, department };
  }

  const yearCode = normalized.slice(0, 2);
  const year = YEAR_CODE_MAP[yearCode] || "Unknown";

  const deptPatterns: Array<[RegExp, string]> = [
    [/AI\s*&?\s*DS|AIDS|AID\b/, "AIDS"],
    [/AI\s*&?\s*ML|AIML/, "AIML"],
    [/\bCSE\b|\bCS\b/, "CSE"],
    [/\bECE\b|\bEC\b/, "ECE"],
    [/\bMECH\b|\bME\b/, "MECH"],
    [/\bBME\b|\bBM\b/, "BME"],
    [/\bAGRI\b|\bAG\b/, "AGRI"],
    [/\bIT\b/, "IT"],
  ];

  const matchedDepartment =
    deptPatterns.find(([pattern]) => pattern.test(normalized))?.[1] ||
    "Unknown";

  return { year, department: matchedDepartment };
}

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
) {
  return options.find((option) => option.value === value)?.label || value;
}

function yesNoMaybeBadge(value: string) {
  if (value === "yes") {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  }
  if (value === "no") {
    return "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }
  return "bg-amber-500/15 text-amber-300 border-amber-500/30";
}

function barClassForOption(value: string): string {
  if (
    ["excellent", "fully_met", "worth_it", "yes", "on_time"].includes(value)
  ) {
    return "bg-emerald-500";
  }
  if (["good", "partially_met", "slight_delays", "maybe"].includes(value)) {
    return "bg-sky-500";
  }
  if (
    ["average", "neutral", "too_long", "too_short", "not_used"].includes(value)
  ) {
    return "bg-amber-500";
  }
  if (
    [
      "poor",
      "very_poor",
      "not_met",
      "major_delays",
      "no_schedule",
      "not_worth",
      "no",
    ].includes(value)
  ) {
    return "bg-rose-500";
  }
  return "bg-violet-500";
}

function statPct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function extractTopThemes(texts: string[], limit = 8): ThemeStat[] {
  const counts: Record<string, number> = {};

  texts.forEach((text) => {
    const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const words = normalized.split(/\s+/).filter(Boolean);

    words.forEach((word) => {
      if (word.length < 4) return;
      if (/^\d+$/.test(word)) return;
      if (THEME_STOP_WORDS.has(word)) return;
      counts[word] = (counts[word] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([keyword, count]) => ({ keyword, count }));
}

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState<FilterLevel>("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [showTable, setShowTable] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      ANALYTICS_SECTIONS.map((section, i) => [section, i === 0]),
    ),
  );

  useEffect(() => {
    fetch("/api/admin/feedback")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load feedback");
        return data;
      })
      .then((data) => setItems(data.feedback || []))
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Failed to load feedback",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const itemsWithMeta: FeedbackEntryWithMeta[] = items.map((entry) => {
      const derived = deriveYearDepartment(entry.register_number || "");
      return {
        ...entry,
        derivedYear: derived.year,
        derivedDepartment: derived.department,
      };
    });

    const q = search.trim().toLowerCase();

    return itemsWithMeta.filter((entry) => {
      const matchesRating =
        ratingFilter === "all" || entry.overall_event_rating === ratingFilter;

      const matchesYear =
        yearFilter === "all" || entry.derivedYear === yearFilter;

      const matchesDepartment =
        departmentFilter === "all" ||
        entry.derivedDepartment === departmentFilter;

      const matchesSearch =
        !q ||
        entry.student_name.toLowerCase().includes(q) ||
        entry.register_number.toLowerCase().includes(q) ||
        entry.liked_most.toLowerCase().includes(q) ||
        entry.improve_next_time.toLowerCase().includes(q) ||
        entry.suggestions_next_year.toLowerCase().includes(q);

      return matchesRating && matchesYear && matchesDepartment && matchesSearch;
    });
  }, [items, ratingFilter, yearFilter, departmentFilter, search]);

  const yearOptions = useMemo(() => {
    const set = new Set(
      items.map((entry) => deriveYearDepartment(entry.register_number).year),
    );
    const order = ["I", "II", "III", "IV", "Unknown"];
    return Array.from(set).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [items]);

  const departmentOptions = useMemo(() => {
    const set = new Set(
      items.map(
        (entry) => deriveYearDepartment(entry.register_number).department,
      ),
    );
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const analyticsBySection = useMemo(() => {
    return ANALYTICS_SECTIONS.map((section) => {
      const rows = FEEDBACK_TABLE_SCHEMA.filter(
        (row) =>
          row.section === section &&
          (row.type === "single" || row.type === "multi"),
      );

      const rowStats = rows.map((row) => {
        const options = row.options || [];
        const field = row.field as keyof FeedbackEntry;

        const stats: RowStat[] = options.map((option) => {
          const count = filtered.reduce((acc, entry) => {
            const value = entry[field];

            if (row.type === "multi") {
              return Array.isArray(value) && value.includes(option.value)
                ? acc + 1
                : acc;
            }

            return typeof value === "string" && value === option.value
              ? acc + 1
              : acc;
          }, 0);

          return {
            value: option.value,
            label: option.label,
            count,
            percentage: statPct(count, filtered.length),
          };
        });

        const topStat =
          stats.length > 0
            ? stats.reduce((best, current) =>
                current.count > best.count ? current : best,
              )
            : null;

        return { row, stats, topStat };
      });

      return { section, rowStats };
    });
  }, [filtered]);

  const textInsights = useMemo(() => {
    return {
      likedThemes: extractTopThemes(filtered.map((item) => item.liked_most)),
      improveThemes: extractTopThemes(
        filtered.map((item) => item.improve_next_time),
      ),
      suggestionThemes: extractTopThemes(
        filtered.map((item) => item.suggestions_next_year),
      ),
    };
  }, [filtered]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const excellent = filtered.filter(
      (e) => e.overall_event_rating === "excellent",
    ).length;
    const good = filtered.filter(
      (e) => e.overall_event_rating === "good",
    ).length;
    const average = filtered.filter(
      (e) => e.overall_event_rating === "average",
    ).length;
    const low = filtered.filter((e) =>
      ["poor", "very_poor"].includes(e.overall_event_rating),
    ).length;
    const volunteerYes = filtered.filter(
      (e) => e.volunteer_next_event === "yes",
    ).length;

    return {
      total,
      excellent,
      good,
      average,
      low,
      volunteerYes,
      volunteerPct: statPct(volunteerYes, total),
    };
  }, [filtered]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const exportExcel = () => {
    const rows = filtered.map((entry, index) => ({
      "S.No": index + 1,
      "Submitted At": new Date(entry.created_at).toLocaleString(),
      "Register Number": entry.register_number,
      Name: entry.student_name,
      "Overall Event": labelFor(
        FEEDBACK_OPTIONS.overall_event_rating,
        entry.overall_event_rating,
      ),
      "Expectation Match": labelFor(
        FEEDBACK_OPTIONS.expectation_match,
        entry.expectation_match,
      ),
      "Planning & Coordination": labelFor(
        FEEDBACK_OPTIONS.planning_coordination,
        entry.planning_coordination,
      ),
      "Schedule Followed": labelFor(
        FEEDBACK_OPTIONS.schedule_adherence,
        entry.schedule_adherence,
      ),
      "Stage Setup": labelFor(
        FEEDBACK_OPTIONS.stage_setup_quality,
        entry.stage_setup_quality,
      ),
      Lighting: labelFor(
        FEEDBACK_OPTIONS.lighting_arrangement,
        entry.lighting_arrangement,
      ),
      Sound: labelFor(
        FEEDBACK_OPTIONS.sound_system_clarity,
        entry.sound_system_clarity,
      ),
      "LED/Visual": labelFor(
        FEEDBACK_OPTIONS.led_visual_effects,
        entry.led_visual_effects,
      ),
      "Performance Quality": labelFor(
        FEEDBACK_OPTIONS.performance_quality,
        entry.performance_quality,
      ),
      "DJ Session": labelFor(
        FEEDBACK_OPTIONS.dj_session_experience,
        entry.dj_session_experience,
      ),
      "Crowd Engagement": labelFor(
        FEEDBACK_OPTIONS.event_energy_engagement,
        entry.event_energy_engagement,
      ),
      "Event Duration": labelFor(
        FEEDBACK_OPTIONS.event_duration,
        entry.event_duration,
      ),
      Seating: labelFor(
        FEEDBACK_OPTIONS.seating_arrangement,
        entry.seating_arrangement,
      ),
      "Crowd Management": labelFor(
        FEEDBACK_OPTIONS.crowd_management,
        entry.crowd_management,
      ),
      Transport: labelFor(
        FEEDBACK_OPTIONS.transport_arrangement,
        entry.transport_arrangement,
      ),
      "Coordinator Support": labelFor(
        FEEDBACK_OPTIONS.coordinator_support,
        entry.coordinator_support,
      ),
      Discipline: labelFor(
        FEEDBACK_OPTIONS.discipline_maintained,
        entry.discipline_maintained,
      ),
      "Value For Money": labelFor(
        FEEDBACK_OPTIONS.value_for_money,
        entry.value_for_money,
      ),
      "Best Part": labelFor(FEEDBACK_OPTIONS.best_part, entry.best_part),
      "Improvement Areas": (entry.improvement_areas || [])
        .map((value) => labelFor(FEEDBACK_OPTIONS.improvement_areas, value))
        .join("; "),
      "Liked Most": entry.liked_most,
      "Improve Next Time": entry.improve_next_time,
      "Suggestions Next Year": entry.suggestions_next_year,
      Volunteer: labelFor(
        FEEDBACK_OPTIONS.volunteer_next_event,
        entry.volunteer_next_event,
      ),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback Responses");
    XLSX.writeFile(
      wb,
      `mass2k26-feedback-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 via-violet-500/5 to-cyan-500/10 p-5 sm:p-6">
        <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-fuchsia-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <MessageSquareHeart className="h-5 w-5 text-fuchsia-400" />
              Feedback Analytics Dashboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Question trends, collapsible sections, and text insight themes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={exportExcel}
              disabled={filtered.length === 0}
              className="w-full sm:w-auto border-fuchsia-400/30 hover:bg-fuchsia-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowTable((prev) => !prev)}
              className="w-full sm:w-auto"
            >
              <Table2 className="w-4 h-4 mr-2" />
              {showTable ? "Hide Detailed Table" : "Show Detailed Table"}
            </Button>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-2 xl:grid-cols-6 gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-xs text-muted-foreground">Responses in View</p>
            <p className="text-xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3">
            <p className="text-xs text-emerald-200/80">Excellent</p>
            <p className="text-xl font-bold mt-1 text-emerald-200">
              {stats.excellent}
            </p>
          </div>
          <div className="rounded-xl border border-sky-400/20 bg-sky-500/10 p-3">
            <p className="text-xs text-sky-200/80">Good</p>
            <p className="text-xl font-bold mt-1 text-sky-200">{stats.good}</p>
          </div>
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3">
            <p className="text-xs text-amber-200/80">Average</p>
            <p className="text-xl font-bold mt-1 text-amber-200">
              {stats.average}
            </p>
          </div>
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3">
            <p className="text-xs text-rose-200/80">Low (Poor + Very Poor)</p>
            <p className="text-xl font-bold mt-1 text-rose-200">{stats.low}</p>
          </div>
          <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 p-3">
            <p className="text-xs text-violet-200/80">Volunteer Yes</p>
            <p className="text-xl font-bold mt-1 text-violet-200">
              {stats.volunteerYes}
              <span className="ml-2 text-xs text-violet-100/70">
                ({stats.volunteerPct}%)
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/80 bg-card/60 p-4 backdrop-blur-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, register no, suggestions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* <Select
              value={ratingFilter}
              onValueChange={(value) => setRatingFilter(value as FilterLevel)}
            >
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Filter by overall rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="poor">Poor</SelectItem>
                <SelectItem value="very_poor">Very Poor</SelectItem>
              </SelectContent>
            </Select> */}

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-full sm:w-[190px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departmentOptions.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(search ||
              ratingFilter !== "all" ||
              yearFilter !== "all" ||
              departmentFilter !== "all") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setRatingFilter("all");
                  setYearFilter("all");
                  setDepartmentFilter("all");
                }}
                className="w-full sm:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} of {items.length} responses
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/80 bg-card/40 py-14 text-center text-muted-foreground">
          <SearchX className="h-7 w-7 mx-auto mb-2 opacity-60" />
          No feedback responses found for current filters.
        </div>
      ) : (
        <div className="space-y-5">
          {analyticsBySection.map((section) => (
            <div
              key={section.section}
              className="rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-5"
            >
              <button
                type="button"
                className="w-full flex items-center justify-between gap-3"
                onClick={() => toggleSection(section.section)}
              >
                <h2 className="text-left text-base sm:text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-fuchsia-400" />
                  {section.section}
                  <Badge variant="outline" className="ml-1">
                    {section.rowStats.length} questions
                  </Badge>
                </h2>
                {expandedSections[section.section] ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {expandedSections[section.section] && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                  {section.rowStats.map(({ row, stats, topStat }) => (
                    <div
                      key={row.field}
                      className="rounded-xl border border-border/70 bg-background/40 p-4"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <p className="text-sm font-semibold">{row.question}</p>
                        {topStat && topStat.count > 0 ? (
                          <Badge className="bg-fuchsia-500/15 border-fuchsia-500/30 text-fuchsia-200 whitespace-nowrap">
                            Top: {topStat.label} {topStat.percentage}%
                          </Badge>
                        ) : (
                          <Badge variant="outline">No responses</Badge>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {stats.map((stat) => (
                          <div key={stat.value}>
                            <div className="flex items-center justify-between gap-2 text-xs sm:text-sm mb-1">
                              <span className="text-muted-foreground">
                                {stat.label}
                              </span>
                              <span className="font-medium">
                                {stat.count} ({stat.percentage}%)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${barClassForOption(
                                  stat.value,
                                )}`}
                                style={{ width: `${stat.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="rounded-2xl border border-border/80 bg-card/40 p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2 mb-4">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Text Feedback Insights
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-semibold mb-3">
                  What Students Liked
                </p>
                <div className="flex flex-wrap gap-2">
                  {textInsights.likedThemes.length > 0 ? (
                    textInsights.likedThemes.map((theme) => (
                      <Badge key={`liked-${theme.keyword}`} variant="secondary">
                        {theme.keyword} ({theme.count})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No repeated themes yet.
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-semibold mb-3">Improvement Themes</p>
                <div className="flex flex-wrap gap-2">
                  {textInsights.improveThemes.length > 0 ? (
                    textInsights.improveThemes.map((theme) => (
                      <Badge
                        key={`improve-${theme.keyword}`}
                        variant="secondary"
                      >
                        {theme.keyword} ({theme.count})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No repeated themes yet.
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/40 p-4">
                <p className="text-sm font-semibold mb-3">
                  Next Year Suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {textInsights.suggestionThemes.length > 0 ? (
                    textInsights.suggestionThemes.map((theme) => (
                      <Badge
                        key={`suggest-${theme.keyword}`}
                        variant="secondary"
                      >
                        {theme.keyword} ({theme.count})
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      No repeated themes yet.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTable && filtered.length > 0 && (
        <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/40">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/70">
            <h3 className="text-sm sm:text-base font-semibold">
              Detailed Response Table
            </h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowTable(false)}
              className="gap-1.5"
            >
              <ChevronUp className="h-4 w-4" /> Hide
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[1700px]">
              <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                <TableRow>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Register No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Overall</TableHead>
                  <TableHead>Expectation</TableHead>
                  <TableHead>Planning</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Sound</TableHead>
                  <TableHead>DJ</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Best Part</TableHead>
                  <TableHead>Improvements</TableHead>
                  <TableHead>Liked Most</TableHead>
                  <TableHead>Improve Next</TableHead>
                  <TableHead>Suggestions</TableHead>
                  <TableHead>Volunteer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow
                    key={entry.id}
                    className="hover:bg-white/[0.03] align-top"
                  >
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium whitespace-nowrap">
                      {entry.register_number}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {entry.student_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {labelFor(
                          FEEDBACK_OPTIONS.overall_event_rating,
                          entry.overall_event_rating,
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.expectation_match,
                        entry.expectation_match,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.planning_coordination,
                        entry.planning_coordination,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.stage_setup_quality,
                        entry.stage_setup_quality,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.sound_system_clarity,
                        entry.sound_system_clarity,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.dj_session_experience,
                        entry.dj_session_experience,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(
                        FEEDBACK_OPTIONS.value_for_money,
                        entry.value_for_money,
                      )}
                    </TableCell>
                    <TableCell>
                      {labelFor(FEEDBACK_OPTIONS.best_part, entry.best_part)}
                    </TableCell>
                    <TableCell className="max-w-[220px]">
                      <div className="flex flex-wrap gap-1">
                        {(entry.improvement_areas || []).map((item) => (
                          <Badge key={item} variant="outline">
                            {labelFor(FEEDBACK_OPTIONS.improvement_areas, item)}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal text-sm text-muted-foreground">
                      {entry.liked_most}
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal text-sm text-muted-foreground">
                      {entry.improve_next_time}
                    </TableCell>
                    <TableCell className="max-w-[260px] whitespace-normal text-sm text-muted-foreground">
                      {entry.suggestions_next_year}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={yesNoMaybeBadge(entry.volunteer_next_event)}
                      >
                        {labelFor(
                          FEEDBACK_OPTIONS.volunteer_next_event,
                          entry.volunteer_next_event,
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {!showTable && filtered.length > 0 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowTable(true)}
            className="gap-2"
          >
            <ChevronDown className="h-4 w-4" />
            Show Detailed Table
          </Button>
        </div>
      )}
    </div>
  );
}
