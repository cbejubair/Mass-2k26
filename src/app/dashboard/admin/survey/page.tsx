"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface SurveyUser {
  name: string;
  register_number: string;
  department: string;
  year?: string;
  class_section?: string;
}

interface SurveyEntry {
  id: string;
  timing_preference: string | null;
  transport_feasibility: string | null;
  comfort_level: string | null;
  safety_measures: string | null;
  atmosphere_preference: string | null;
  support_score: number | null;
  challenges: string | null;
  creative_suggestions: string | null;
  suggestion_text: string | null;
  users: SurveyUser | null;
}

const TIMING_LABELS: Record<string, string> = {
  plan_a: "Plan A (until 8 PM)",
  plan_b: "Plan B (until 5 PM)",
};

const TRANSPORT_LABELS: Record<string, string> = {
  yes: "Yes, will arrange",
  no: "No, cannot",
  need_college_transport: "Need college transport",
};

const COMFORT_LABELS: Record<string, string> = {
  yes: "Yes",
  no: "No",
  depends: "Depends on transport/security",
};

const ATMOSPHERE_LABELS: Record<string, string> = {
  daytime: "Daytime cultural fest",
  night_concert: "Night concert-style",
  balanced: "Balanced (Day + Evening)",
};

function countBy<T>(
  items: T[],
  accessor: (item: T) => string | null | undefined,
): Record<string, number> {
  const counts: Record<string, number> = {};
  items.forEach((item) => {
    const val = accessor(item);
    if (val) counts[val] = (counts[val] || 0) + 1;
  });
  return counts;
}

function StatBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {count} ({pct}%)
        </span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function AdminSurveyPage() {
  const [surveys, setSurveys] = useState<SurveyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/survey")
      .then((r) => r.json())
      .then((data) => {
        setSurveys(data.feedback || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const total = surveys.length;
  const timingCounts = countBy(surveys, (s) => s.timing_preference);
  const transportCounts = countBy(surveys, (s) => s.transport_feasibility);
  const comfortCounts = countBy(surveys, (s) => s.comfort_level);
  const atmosphereCounts = countBy(surveys, (s) => s.atmosphere_preference);

  const avgScore =
    total > 0
      ? (
          surveys.reduce((sum, s) => sum + (s.support_score || 0), 0) /
          surveys.filter((s) => s.support_score).length
        ).toFixed(1)
      : "N/A";

  const scoreDist = [1, 2, 3, 4, 5].map(
    (n) => surveys.filter((s) => s.support_score === n).length,
  );

  const colors = [
    "bg-green-500",
    "bg-blue-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Survey Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {total} responses collected
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event Timing Preference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(TIMING_LABELS).map(([key, label], i) => (
              <StatBar
                key={key}
                label={label}
                count={timingCounts[key] || 0}
                total={total}
                color={colors[i]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Transportation Feasibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(TRANSPORT_LABELS).map(([key, label], i) => (
              <StatBar
                key={key}
                label={label}
                count={transportCounts[key] || 0}
                total={total}
                color={colors[i]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comfort Level (8 PM)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(COMFORT_LABELS).map(([key, label], i) => (
              <StatBar
                key={key}
                label={label}
                count={comfortCounts[key] || 0}
                total={total}
                color={colors[i]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atmosphere Preference</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(ATMOSPHERE_LABELS).map(([key, label], i) => (
              <StatBar
                key={key}
                label={label}
                count={atmosphereCounts[key] || 0}
                total={total}
                color={colors[i]}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Support Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Support for 8 PM Event — Average: {avgScore}/5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 justify-center h-32">
            {scoreDist.map((count, i) => {
              const maxCount = Math.max(...scoreDist, 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-foreground">{count}</span>
                  <div
                    className={`w-10 rounded-t ${colors[i]}`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <span className="text-xs font-medium">{i + 1}</span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Strongly oppose</span>
            <span>Strongly support</span>
          </div>
        </CardContent>
      </Card>

      {/* Open Responses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Safety Measures & Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {surveys
            .filter((s) => s.safety_measures || s.challenges)
            .map((s) => (
              <div
                key={s.id}
                className="border-b border-border pb-3 last:border-0"
              >
                {s.safety_measures && (
                  <div className="mb-1">
                    <Badge variant="secondary" className="text-xs mb-1">
                      Safety
                    </Badge>
                    <p className="text-sm">{s.safety_measures}</p>
                  </div>
                )}
                {s.challenges && (
                  <div className="mb-1">
                    <Badge variant="secondary" className="text-xs mb-1">
                      Challenges
                    </Badge>
                    <p className="text-sm">{s.challenges}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  — {s.users?.name} ({s.users?.register_number}) |{" "}
                  {s.users?.department}
                </p>
              </div>
            ))}
          {surveys.filter((s) => s.safety_measures || s.challenges).length ===
            0 && (
            <p className="text-sm text-muted-foreground">
              No open responses yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Creative Suggestions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {surveys
            .filter((s) => s.creative_suggestions)
            .map((s) => (
              <div
                key={s.id}
                className="border-b border-border pb-3 last:border-0"
              >
                <p className="text-sm">{s.creative_suggestions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  — {s.users?.name} ({s.users?.register_number}) |{" "}
                  {s.users?.department}
                </p>
              </div>
            ))}
          {surveys.filter((s) => s.creative_suggestions).length === 0 && (
            <p className="text-sm text-muted-foreground">No suggestions yet</p>
          )}
        </CardContent>
      </Card>

      {total === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No survey responses yet
        </p>
      )}
    </div>
  );
}
